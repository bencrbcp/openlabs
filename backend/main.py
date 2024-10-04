from flask import Flask, jsonify, request
from proxmoxer import ProxmoxAPI
import os
import yaml
import os.path

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
PROXMOX_PORT = config.get('PROXMOX_PORT', 443)  # Default to 443 if not set
PROXMOX_NODE = config.get('PROXMOX_NODE', 'ufsit01')  # Default to 'ufsit01' if not set

# Ensure the necessary configuration values are set
if not all([PROXMOX_HOST, PROXMOX_USER, PROXMOX_PASSWORD]):
    raise EnvironmentError("Missing one or more required configuration values: PROXMOX_HOST, PROXMOX_USER, PROXMOX_PASSWORD")

# Proxmox API initialization
proxmox = ProxmoxAPI(PROXMOX_HOST, user=PROXMOX_USER, password=PROXMOX_PASSWORD, verify_ssl=False, port=int(PROXMOX_PORT))

# Route to get the Kali VM template
@app.route('/vms', methods=['GET'])
def get_vms():
    try:
        vms = proxmox.nodes(PROXMOX_NODE).qemu.get()
        kali_vms = [vm for vm in vms if vm['vmid'] == 2001 or 'kali' in vm['name'].lower()]
        return jsonify(kali_vms), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to start a new VM
@app.route('/vms', methods=['POST'])
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
def stop_vm(vmid):
    try:
        proxmox.nodes(PROXMOX_NODE).qemu(vmid).status.shutdown.post()
        return jsonify({'message': 'VM stopped'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)