from flask import Flask, request, jsonify
from flask_cors import CORS
import proxmox_utils
import urllib3
import random
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)



app = Flask(__name__)
CORS(app)

@app.route('/api/vms', methods=['GET'])
def get_vms():
    vms = proxmox_utils.get_cloned_vms()
    return jsonify(vms), 200

@app.route('/api/clone', methods=['POST'])
@app.route('/api/clone', methods=['POST'])
def clone_vm():
    # Extract the name from the request JSON
    data = request.json
    new_vm_name = data.get('name')

    # Ensure new_vm_name is provided
    if not new_vm_name:
        return jsonify({"error": "Missing new_vm_name parameter"}), 400

    # Call proxmox_utils to clone VM
    result = proxmox_utils.clone_vm(new_vm_name)
    return jsonify(result), 201 if 'success' in result else 500

if __name__ == '__main__':
    app.run(debug=True)


@app.route('/api/vm/<vm_id>/action', methods=['POST'])
def manage_vm(vm_id):
    data = request.json
    action = data.get('action')  # "start", "stop", or "delete"
    result = proxmox_utils.manage_vm(vm_id, action)
    return jsonify(result), 200 if result.get('status') == 'success' else 500

if __name__ == '__main__':
    app.run(debug=True)
