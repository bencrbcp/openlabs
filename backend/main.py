from flask import Flask, jsonify, request
from proxmoxer import ProxmoxAPI
import os

app = Flask(__name__)

# proxmox API init
proxmox = ProxmoxAPI('proxmox.red.ufsit.club', user='root@pam', password='UFSITBLUEW000', verify_ssl=False)

# route to get the kali VM template
@app.route('/vms', method=['GET'])
def get_vms():
    try:
        node = 'ufsit01'
        vms = proxmox.nodes(node).qemu.get()
        kali_vms = [vm for vm in vms if vm['vmid'] == 2001 or 'kali' in vm['name'].lower()]
        return jsonify(kali_vms), 200
    except Exception as e:
        return jsonify({'error':str(e)}), 500

# route to start new VM
@app.route('/vms', methods=['POST'])
def create_vm():
    try:
        vmid = proxmox.nodes('ufsit01').qemu.post(
                newid=None, vmid=2001, clone=True, name=f'kali-{os.urandom(4).hex()}'
        )
        return jsonify({'message': 'VM created', 'vmid': vmid}), 200
    except Exception as e:
        return jsonify({'error':str(e)}), 500

# route to stop a VM
@app.route('/vms<int:vmid>/stop', methods=['POST'])
def stop_vm(vmid):
    try:
        proxmox.modes('ufsit01').qemu(vmid).status.shutdown.post()
        return jsonify({'message': 'VM stopped'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
