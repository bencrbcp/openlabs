from flask import Flask, jsonify, request, make_response, redirect, url_for
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
PROXMOX_USER = config.get('PROXMOX_USER')
PROXMOX_PASSWORD = config.get('PROXMOX_PASSWORD')
PROXMOX_PORT = config.get('PROXMOX_PORT')
PROXMOX_NODE = config.get('PROXMOX_NODE')

JWT_SECRET_KEY = config.get('JWT_SECRET_KEY')
app.config['SECRET_KEY'] = JWT_SECRET_KEY

# Ensure the necessary configuration values are set
if not all([PROXMOX_HOST, PROXMOX_USER, PROXMOX_PASSWORD, PROXMOX_PORT, PROXMOX_NODE, JWT_SECRET_KEY]):
    raise EnvironmentError("Missing one or more required configuration values")

# Proxmox API initialization
proxmox = ProxmoxAPI(PROXMOX_HOST, user=PROXMOX_USER, password=PROXMOX_PASSWORD, verify_ssl=False, port=int(PROXMOX_PORT))

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('x-access-token')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
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
    if data['username'] == 'admin' and data['password'] == 'admin':
        token = jwt.encode({'user': data['username'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, app.config['SECRET_KEY'], algorithm='HS256')
        response = make_response(jsonify({'message': 'Login successful'}))
        response.set_cookie('x-access-token', token)
        return response
    return make_response('Could not verify', 401, {'WWW-Authenticate': 'Basic realm="Login Required"'})

# Route to logout
@app.route('/logout', methods=['GET'])
def logout():
    message = request.args.get('message', 'You have been logged out successfully.')
    response = make_response(redirect(url_for('login')))
    response.set_cookie('x-access-token', '', expires=0)
    response.set_data(jsonify({'message': message}).data)
    return response

# Route to get the Kali VM template
@app.route('/vms', methods=['GET'])
@token_required
def get_vms():
    try:
        vms = proxmox.nodes(PROXMOX_NODE).qemu.get()
        kali_vms = [vm for vm in vms if vm['vmid'] == 2001 or 'kali' in vm['name'].lower()]
        return jsonify(kali_vms), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to start a new VM
@app.route('/vms', methods=['POST'])
@token_required
def create_vm():
    try:
        # Clone VM template with a unique name
        new_vm_name = f'kali-{os.urandom(4).hex()}'
        vmid = proxmox.nodes(PROXMOX_NODE).qemu.post(
            newid=None, vmid=2001, clone=True, name=new_vm_name
        )
        return jsonify({'message': 'VM created', 'vmid': vmid}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to stop a VM
@app.route('/vms/<int:vmid>/stop', methods=['POST'])
@token_required
def stop_vm(vmid):
    try:
        proxmox.nodes(PROXMOX_NODE).qemu(vmid).status.shutdown.post()
        return jsonify({'message': 'VM stopped'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)