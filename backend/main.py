from flask import Flask, jsonify, request, make_response, redirect, url_for, g
from functools import wraps
from proxmoxer import ProxmoxAPI
import os
import yaml
import os.path
import jwt
import datetime

app = Flask(__name__)

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

# Route to login and get a token
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    proxmox_user = data.get('username') + "@pam"
    proxmox_password = data.get('password')

    if not proxmox_user or not proxmox_password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        # Verify credentials by initializing Proxmox API
        proxmox = ProxmoxAPI(PROXMOX_HOST, user=proxmox_user, password=proxmox_password, verify_ssl=False, port=int(PROXMOX_PORT))
        # Store the Proxmox instance in memory for this user
        proxmox_sessions[proxmox_user] = proxmox
        # If no exception, credentials are valid, create a token without storing the password
        token = jwt.encode({'proxmox_user': proxmox_user, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, app.config['SECRET_KEY'], algorithm='HS256')
        response = make_response(jsonify({'message': 'Login successful'}))
        response.set_cookie('x-access-token', token)
        return response
    except Exception as e:
        return jsonify({'error': 'Login failed: ' + str(e)}), 401

# Route to logout
@app.route('/logout', methods=['GET'])
def logout():
    message = request.args.get('message', 'You have been logged out successfully.')
    response = make_response(redirect(url_for('login')))
    response.set_cookie('x-access-token', '', expires=0)
    response.set_data(jsonify({'message': message}).data)
    token = request.cookies.get('x-access-token')
    if token:
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            proxmox_user = data['proxmox_user']
            # Remove the user's Proxmox session from memory
            proxmox_sessions.pop(proxmox_user, None)
        except jwt.InvalidTokenError:
            pass
    return response

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
        return jsonify({'error': str(e)}), 500

# Route to create a VM from a template ID, i.e 2001
@app.route('/vms/create', methods=['POST'])
@token_required
def create_vm_with_name():
    try:
        # Get data from the request
        data = request.get_json()
        template_vmid = data.get('template_vmid')
        new_vm_name = data.get('name')
        
        if not template_vmid or not new_vm_name:
            return jsonify({'error': 'Template VM ID and new VM name are required'}), 400
        
        # Find the next available VM ID to avoid overlaps
        vms = g.proxmox.cluster.resources.get(type='vm')
        used_vmids = [int(vm['vmid']) for vm in vms]
        new_vmid = max(used_vmids) + 1 if used_vmids else 100
        
        # Clone the template VM with the provided name
        g.proxmox.nodes(PROXMOX_NODE).qemu(template_vmid).clone.create(
            newid=new_vmid,  # Assign a new unique ID
            name=new_vm_name,  # New VM name
            full=1  # Perform a full clone
        )
        
        return jsonify({'message': 'VM created', 'vmid': new_vmid}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to delete a VM by VM ID
@app.route('/vms/<int:vmid>/delete', methods=['DELETE'])
@token_required
def delete_vm(vmid):
    try:
        # Delete the VM with the provided VM ID
        g.proxmox.nodes(PROXMOX_NODE).qemu(vmid).delete()
        return jsonify({'message': 'VM deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to stop a VM
@app.route('/vms/<int:vmid>/stop', methods=['POST'])
@token_required
def stop_vm(vmid):
    try:
        g.proxmox.nodes(PROXMOX_NODE).qemu(vmid).status.shutdown.post()
        return jsonify({'message': 'VM stopped'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to convert a VM to a template by VM ID
@app.route('/vms/<int:vmid>/template', methods=['POST'])
@token_required
def convert_vm_to_template(vmid):
    try:
        # Convert the VM with the provided VM ID to a template
        g.proxmox.nodes(PROXMOX_NODE).qemu(vmid).template.post()
        return jsonify({'message': 'VM converted to template successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
        return jsonify({'error': str(e)}), 500

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
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
