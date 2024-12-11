from flask import Flask, jsonify, request, make_response, redirect, url_for, g
from functools import wraps
from proxmoxer import ProxmoxAPI
import os
import yaml
import os.path
import jwt
import datetime
import argparse
from flask_cors import CORS

# Debug flag to show verbose errors and stuff during development only
parser = argparse.ArgumentParser(description="Run Flask app with debug mode.")
parser.add_argument('--debug', action='store_true', help="Run the app in debug mode and show detailed errors.")
args = parser.parse_args()
DEBUG = args.debug

app = Flask(__name__)
CORS(app,supports_credentials=True)
app.config['DEBUG'] = DEBUG

# Check if the config file exists
if not os.path.exists('config.yaml'):
    raise FileNotFoundError("Configuration file 'config.yaml' not found. Please create it based on 'example_config.yaml'.")

# Load configuration from a YAML file
with open('config.yaml', 'r') as config_file:
    config = yaml.safe_load(config_file)

PROXMOX_HOST = config.get('PROXMOX_HOST')
PROXMOX_PORT = config.get('PROXMOX_PORT')
PROXMOX_NODE = config.get('PROXMOX_NODE')

JWT_SECRET_KEY = config.get('JWT_SECRET_KEY')
app.config['SECRET_KEY'] = JWT_SECRET_KEY

# Ensure the necessary configuration values are set
if not all([PROXMOX_HOST, PROXMOX_PORT, PROXMOX_NODE, JWT_SECRET_KEY]):
    raise EnvironmentError("Missing one or more required configuration values")

# Store proxmox sessions in-memory
proxmox_sessions = {}

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('x-access-token')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            proxmox_user = data['proxmox_user']
            # Retrieve the Proxmox session from in-memory storage
            if proxmox_user not in proxmox_sessions:
                return jsonify({'message': 'Session not found, please log in again!'}), 401
            g.proxmox = proxmox_sessions[proxmox_user]
        except jwt.ExpiredSignatureError:
            return redirect(url_for('logout', message='Token has expired!'))
        except jwt.InvalidTokenError:
            return redirect(url_for('logout', message='Invalid token!'))
        return f(*args, **kwargs)
    return decorated
    
# Error handling that respects the debug flag
def handle_error(e, detailed=DEBUG):
    """Handles errors based on debug mode."""
    message = {'error': str(e)} if detailed else {'error': 'An error occurred'}
    return jsonify(message)

# Route to login and get a token
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    login_method = data.get('method', 'pve')  # Default to 'pve' if not provided
    proxmox_user = f"{data.get('username')}@{login_method}"
    proxmox_password = data.get('password')

    if not proxmox_user or not proxmox_password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        # Verify credentials by initializing Proxmox API
        #print(proxmox_user)
        proxmox = ProxmoxAPI(PROXMOX_HOST, user=proxmox_user, password=proxmox_password, verify_ssl=False, port=int(PROXMOX_PORT))
        # Store the Proxmox instance in memory for this user
        proxmox_sessions[proxmox_user] = proxmox
        # If no exception, credentials are valid, create a token without storing the password
        token = jwt.encode({'proxmox_user': proxmox_user, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, app.config['SECRET_KEY'], algorithm='HS256')
        response = make_response(jsonify({'message': 'Login successful'}))
        response.set_cookie('x-access-token', token)
        return response
    except Exception as e:
        return handle_error(e), 401

# route to logout
@app.route('/logout', methods=['GET'])
def logout():
    # Get the custom message from the query parameters (or use a default)
    message = request.args.get('message', 'You have been logged out successfully.')
    
    # Clear the session or token
    response = make_response(jsonify({'message': message}))
    response.set_cookie('x-access-token', '', expires=0)  # clear the token cookie
    
    # Check if there's a token and decode it to remove the session
    token = request.cookies.get('x-access-token')
    if token:
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            proxmox_user = data['proxmox_user']
            proxmox_sessions.pop(proxmox_user, None)  # remove the session
        except jwt.InvalidTokenError:
            pass
    
    # Return a 200 OK response with the message
    response.status_code = 200
    return response

# Route to get the logged-in user's Proxmox username
@app.route('/user', methods=['GET'])
@token_required
def get_logged_in_user():
    try:
        # Retrieve the Proxmox username from the JWT token
        proxmox_user = jwt.decode(
            request.cookies.get('x-access-token'),
            app.config['SECRET_KEY'],
            algorithms=['HS256']
        )['proxmox_user']

        return jsonify({'proxmox_user': proxmox_user}), 200
    except Exception as e:
        return handle_error(e), 500

# Route to get all active VMs and return as JSON
@app.route('/vms/active', methods=['GET'])
@token_required
def get_vms():
    try:
        # Get all VMs from the Proxmox node
        vms = g.proxmox.nodes(PROXMOX_NODE).qemu.get()
        
        # Filter the VMs to include only the ones that are running (status = 'running')
        active_vms = [vm for vm in vms if vm.get('status') == 'running']
        
        return jsonify(active_vms), 200
    except Exception as e:
        return handle_error(e), 500

# Route to create a VM from a template ID, i.e 2001
@app.route('/vms/create', methods=['POST'])
@token_required
def create_vm_with_name():
    try:
        # Get data from the request
        data = request.get_json()
        template_vmid = data.get('template_vmid')
        new_vm_name = data.get('name')
        full = data.get('full', 1)      # Full clone or not, default 1 for now
        
        if not template_vmid or not new_vm_name:
            return jsonify({'error': 'Template VM ID and new VM name are required'}), 400
        
        # Find the next available VM ID to avoid overlaps
        vms = g.proxmox.cluster.resources.get(type='vm')
        used_vmids = [int(vm['vmid']) for vm in vms]
        new_vmid = max(used_vmids) + 1 if used_vmids else 100
        
        # Clone the template VM with the provided name
        created = g.proxmox.nodes(PROXMOX_NODE).qemu(template_vmid).clone.create(
            newid=new_vmid,  # Assign a new unique ID
            name=new_vm_name,  # New VM name
            full=full
        )
        
        return jsonify({'message': 'VM created', 'vmid': new_vmid, 'info': created}), 200
    except Exception as e:
        return handle_error(e), 500
        
# Route to check the status of a VM being cloned
@app.route('/vms/clone-status/<string:taskid>', methods=['GET'])
@token_required
def check_clone_status(taskid):
    try:
        if not taskid:
            return jsonify({'error': 'Task ID is required'}), 400

        # Fetch the task status using the task ID
        task_status = g.proxmox.nodes(PROXMOX_NODE).tasks(taskid).status.get()
        task_status["output_log"] = g.proxmox.nodes(PROXMOX_NODE).tasks(taskid).log.get()

        return jsonify(task_status), 200
    except Exception as e:
        return handle_error(e), 500

# Route to delete a VM by VM ID
@app.route('/vms/<int:vmid>/delete', methods=['DELETE'])
@token_required
def delete_vm(vmid):
    try:
        # Delete the VM with the provided VM ID
        g.proxmox.nodes(PROXMOX_NODE).qemu(vmid).delete()
        return jsonify({'message': 'VM deleted successfully'}), 200
    except Exception as e:
        return handle_error(e), 500

# Route to stop a VM
@app.route('/vms/<int:vmid>/stop', methods=['POST'])
@token_required
def stop_vm(vmid):
    try:
        g.proxmox.nodes(PROXMOX_NODE).qemu(vmid).status.shutdown.post()
        return jsonify({'message': 'VM stopped'}), 200
    except Exception as e:
        return handle_error(e), 500

# Route to convert a VM to a template by VM ID
@app.route('/vms/<int:vmid>/template', methods=['POST'])
@token_required
def convert_vm_to_template(vmid):
    try:
        # Convert the VM with the provided VM ID to a template
        g.proxmox.nodes(PROXMOX_NODE).qemu(vmid).template.post()
        return jsonify({'message': 'VM converted to template successfully'}), 200
    except Exception as e:
        return handle_error(e), 500

# Route to create a snapshot for a VM by VM ID
@app.route('/vms/<int:vmid>/snapshot', methods=['POST'])
@token_required
def create_vm_snapshot(vmid):
    try:
        # Get data from the request for the snapshot name
        data = request.get_json()
        snapshot_name = data.get('name')
        
        if not snapshot_name:
            return jsonify({'error': 'Snapshot name is required'}), 400
        
        # Create a snapshot for the VM with the provided VM ID
        g.proxmox.nodes(PROXMOX_NODE).qemu(vmid).snapshot.post(
            snapname=snapshot_name  # Name of the snapshot
        )
        return jsonify({'message': 'Snapshot created successfully'}), 200
    except Exception as e:
        return handle_error(e), 500

# Route to revert a VM to a snapshot by VM ID and snapshot name
@app.route('/vms/<int:vmid>/snapshot/revert', methods=['POST'])
@token_required
def revert_vm_to_snapshot(vmid):
    try:
        # Get data from the request for the snapshot name
        data = request.get_json()
        snapshot_name = data.get('name')
        
        if not snapshot_name:
            return jsonify({'error': 'Snapshot name is required'}), 400
        
        # Revert the VM to the specified snapshot
        g.proxmox.nodes(PROXMOX_NODE).qemu(vmid).snapshot(snapshot_name).rollback.post()
        return jsonify({'message': 'VM reverted to snapshot successfully'}), 200
    except Exception as e:
        return handle_error(e), 500

# Route to get a list of all users in Proxmox
@app.route('/users', methods=['GET'])
@token_required
def get_users():
    try:
        # Get all users from Proxmox
        users = g.proxmox.access.users.get()
        return jsonify(users), 200
    except Exception as e:
        return handle_error(e), 500

# Route to get detailed information about a specific user in Proxmox
@app.route('/users/<string:userid>', methods=['GET'])
@token_required
def get_user_details(userid):
    try:
        # Get detailed information about a specific user
        user_details = g.proxmox.access.users(userid).get()
        return jsonify(user_details), 200
    except Exception as e:
        return handle_error(e), 500

# Route to get a user's permissions
@app.route('/users/<string:userid>/permissions', methods=['GET'])
@token_required
def get_user_permissions(userid):
    try:
        # Fetch permissions for given user
        permissions = g.proxmox.access.permissions.get(userid=userid)
        return jsonify(permissions), 200
    except Exception as e:
        return handle_error(e), 500

# Route to enable a user
@app.route('/users/<string:userid>/enable', methods=['POST'])
@token_required
def enable_user(userid):
    try:
        g.proxmox.access.users(userid).put(enable=1)
        return jsonify({'message': 'User enabled successfully'}), 200
    except Exception as e:
        return handle_error(e), 500

# Route to disable a user
@app.route('/users/<string:userid>/disable', methods=['POST'])
@token_required
def disable_user(userid):
    try:
        g.proxmox.access.users(userid).put(enable=0)
        return jsonify({'message': 'User disabled successfully'}), 200
    except Exception as e:
        return handle_error(e), 500
        
# Route to delete a user
@app.route('/users/<string:userid>', methods=['DELETE'])
@token_required
def delete_user(userid):
    try:
        g.proxmox.access.users(userid).delete()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        return handle_error(e), 500
        
# Route to create a new user
@app.route('/users/create', methods=['POST'])
@token_required
def create_user():
    try:
        # Get the data from the request
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        confirmPassword = data.get('confirmPassword')
        email = data.get('email')
        firstname = data.get('firstname')
        lastname = data.get('lastname')
        group = data.get('group', '')  # Optional, defaults to an empty string
        comment = data.get('comment', '')  # Optional, user comment or description

        if not username or not password or not email or not firstname or not lastname:
            return jsonify({'error': 'Username, password, email, firstname, and lastname are required'}), 400
            
        if password != confirmPassword:
            return jsonify({'error': 'Passwords do not match!'}), 400

        # Ensure the username includes the realm (e.g., `username@pve`)
        if '@' not in username:
            username += '@pve'

        # Create the user in Proxmox
        g.proxmox.access.users.post(
            userid=username,
            password=password,
            email=email,
            groups=group,
            comment=comment,
            firstname=firstname,
            lastname=lastname,
            enable=1  # Enable the user by default
        )

        return jsonify({'message': f'User {username} created successfully'}), 201
    except Exception as e:
        return handle_error(e), 500

# Route to add a user to a group
@app.route('/users/<string:userid>/groups/set', methods=['POST'])
@token_required
def set_user_to_groups(userid):
    try:
        data = request.get_json()
        groups = data.get('groups')

        if not groups:
            return jsonify({'error': 'groups is required'}), 400

        g.proxmox.access.users.put(userid, groups=groups)
        return jsonify({'message': 'User added to group successfully'}), 200
    except Exception as e:
        return handle_error(e), 500

### POOL STUFF
# Route to list existing pools
@app.route('/pools', methods=['GET'])
@token_required
def list_pools():
    try:
        # Retrieve all pools from Proxmox
        pools = g.proxmox.pools.get()
        return jsonify(pools), 200
    except Exception as e:
        return handle_error(e), 500
        
# Route to add a new pool
@app.route('/pools/add', methods=['POST'])
@token_required
def add_pool():
    try:
        # Get the data from the request
        data = request.get_json()
        poolid = data.get('poolid')
        comment = data.get('comment', '')  # Optional comment

        if not poolid:
            return jsonify({'error': 'Pool ID is required'}), 400

        # Create the pool in Proxmox
        g.proxmox.pools.post(
            poolid=poolid,
            comment=comment
        )

        return jsonify({'message': f'Pool {poolid} created successfully'}), 201
    except Exception as e:
        return handle_error(e), 500

# Route to get info about a specific pool
@app.route('/pools/<string:poolid>', methods=['GET'])
@token_required
def get_pool_info(poolid):
    try:
        if not poolid:
            return jsonify({'error': 'Pool ID is required'}), 400

        # Retrieve the specific pool's information
        pool_info = g.proxmox.pools(poolid).get()

        return jsonify(pool_info), 200
    except Exception as e:
        return handle_error(e), 500

# Route to delete a pool
@app.route('/pools/<string:poolid>', methods=['DELETE'])
@token_required
def delete_pool(poolid):
    try:
        if not poolid:
            return jsonify({'error': 'Pool ID is required'}), 400

        # Delete the pool in Proxmox
        g.proxmox.pools(poolid).delete()

        return jsonify({'message': f'Pool {poolid} deleted successfully'}), 200
    except Exception as e:
        return handle_error(e), 500

# Route to add VMs to a pool
@app.route('/pools/<string:poolid>/add-vms', methods=['PUT'])
@token_required
def add_vms_to_pool(poolid):
    try:
        # Get the data from the request
        data = request.get_json()
        vms = data.get('vms')

        if not vms or not isinstance(vms, list):
            return jsonify({'error': 'VMs must be provided as a list'}), 400

        if not poolid:
            return jsonify({'error': 'Pool ID is required'}), 400

        # Add the VMs to the specified pool
        g.proxmox.pools(poolid).put(
            vms=vms
        )

        return jsonify({'message': f'VMs successfully added to pool {poolid}'}), 200
    except Exception as e:
        return handle_error(e), 500

# Route to delete VMs from a pool
@app.route('/pools/<string:poolid>/remove-vms', methods=['PUT'])
@token_required
def remove_vms_from_pool(poolid):
    try:
        # Get the data from the request
        data = request.get_json()
        vms = data.get('vms')

        if not vms or not isinstance(vms, list):
            return jsonify({'error': 'VMs must be provided as a list'}), 400

        if not poolid:
            return jsonify({'error': 'Pool ID is required'}), 400

        # Remove the VMs from the specified pool
        g.proxmox.pools(poolid).put(
            vms=vms,
            delete=1  # Indicate that the VMs should be removed
        )

        return jsonify({'message': f'VMs successfully removed from pool {poolid}'}), 200
    except Exception as e:
        return handle_error(e), 500

if __name__ == '__main__':
    app.run()
