from flask import Flask, jsonify, request
from proxmoxer import ProxmoxAPI
import os

app = Flask(__name__)

# Initialize Proxmox API
proxmox = ProxmoxAPI('proxmox_host', user='root@pam', password='your_password', verify_ssl=False)

# Route to get the status of all Kali VMs
@app.route('/vms', methods=['GET'])
def get_vms():
    try:
        node = 'ufsit01'
        vms = proxmox.nodes(node).qemu.get()
        kali_vms = [vm for vm in vms if vm['vmid'] == 2001 or 'kali' in vm['name'].lower()]
        return jsonify(kali_vms), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to start a new VM
@app.route('/vms', methods=['POST'])
def create_vm():
    try:
        vmid = proxmox.nodes('ufsit01').qemu.post(
            newid=None, vmid=2001, clone=True, name=f'kali-{os.urandom(4).hex()}'
        )
        return jsonify({'message': 'VM created', 'vmid': vmid}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to stop a VM
@app.route('/vms/<int:vmid>/stop', methods=['POST'])
def stop_vm(vmid):
    try:
        proxmox.nodes('ufsit01').qemu(vmid).status.shutdown.post()
        return jsonify({'message': 'VM stopped'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
