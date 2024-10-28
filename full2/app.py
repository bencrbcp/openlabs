from flask import Flask, request, jsonify
import requests
import os
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# proxmox info
PROXMOX_API_URL = "https://proxmox.red.ufsit.club/api2/json"
PROXMOX_NODE = "ufsit01"
VM_TEMPLATE_ID = 2001
PROXMOX_USER = os.getenv('PROXMOX_USER', 'root@pam')  # default to 'root@pam'
PROXMOX_PASSWORD = os.getenv('PROXMOX_PASSWORD')  # retrieved from environment variable


# authenticate to proxmox API
def get_proxmox_token():
    response = requests.post(
        f"{PROXMOX_API_URL}/access/ticket",
        data={'username': PROXMOX_USER, 'password': PROXMOX_PASSWORD}
    )
    result=response.json()['data']
    return result['ticket'], result['CSRFPreventionToken']

# function to get all VM IDs
def get_all_vm_ids():
    ticket, csrf_token = get_proxmox_token()
    response = requests.get(
        f"{PROXMOX_API_URL}/nodes/{PROXMOX_NODE}/qemu",
        headers={'CSRFPreventionToken': csrf_token},
        cookies={'PVEAuthCookie': ticket}
    )
    if response.status_code == 200:
        vms = response.json().get('data', [])
        return [vm['vmid'] for vm in vms]
    return []

# function to find the next available VM ID in the range 2002-2999
def find_next_available_vm_id():
    existing_vm_ids = get_all_vm_ids()
    for vm_id in range(2002, 3000):  # Iterate over the desired range
        if vm_id not in existing_vm_ids:
            return vm_id
    return None  # If no available ID is found

# route to cloen VMs (aka when "deploy new range" is clicked)
@app.route('/clone_vm', methods=['POST'])
def clone_vm():
    try:
        data = request.get_json()
        clone_name = data.get('name')
        print(f"Received clone request with name: {clone_name}")

        # validate VM name
        if len(clone_name) > 40 or not re.match("^[a-zA-Z0-9_-]+$", clone_name):
            print(f"Invalid name: {clone_name}")
            return jsonify({'error': 'Invalid VM name. Must be alphanumeric, may include underscores, dashes, and <= 40 characters'}), 400

        # find the next available VM ID
        clone_vm_id = find_next_available_vm_id()
        print(f"Next available VM ID: {clone_vm_id}")

        if clone_vm_id is None:
            print("No available VM IDs")
            return jsonify({'error': 'No available VM IDs in the 2002-2999 range'}), 500

        # get auth token and CSRF token
        ticket, csrf_token = get_proxmox_token()
        print(f"Proxmox authentication ticket: {ticket}")

        # create clone of VM 2001
        clone_payload = {
            "newid": clone_vm_id,
            "name": clone_name,
            "target": PROXMOX_NODE,
            "full": True  # full clone
        }
        clone_response = requests.post(
            f"{PROXMOX_API_URL}/nodes/{PROXMOX_NODE}/qemu/{VM_TEMPLATE_ID}/clone",
            headers={'CSRFPreventionToken': csrf_token},
            cookies={'PVEAuthCookie': ticket},
            data=clone_payload
        )

        print(f"Proxmox clone response: {clone_response.text}")

        if clone_response.status_code == 200:
            return jsonify({'status': 'success', 'vm_id': clone_vm_id}), 200
        else:
            return jsonify({'error': 'Failed to clone VM', 'details': clone_response.text}), 500

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500

# list all VMs
@app.route('/list_vms', methods=['GET'])
def list_vms():
    try:
        # Get auth token and CSRF token
        ticket, csrf_token = get_proxmox_token()

        response = requests.get(
            f"{PROXMOX_API_URL}/nodes/{PROXMOX_NODE}/qemu",
            headers={'CSRFPreventionToken': csrf_token},
            cookies={'PVEAuthCookie': ticket}
        )

        if response.status_code == 200:
            vm_list = response.json().get('data', [])
            return jsonify({'vms': vm_list}), 200
        else:
            return jsonify({'error': 'Failed to retrieve VMs'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# delete a VM
@app.route('/delete_vm/<int:vm_id>', methods=['DELETE'])
def delete_vm(vm_id):
    try:
        # Get auth token and CSRF token
        ticket, csrf_token = get_proxmox_token()

        response = requests.delete(
            f"{PROXMOX_API_URL}/nodes/{PROXMOX_NODE}/qemu/{vm_id}",
            headers={'CSRFPreventionToken': csrf_token},
            cookies={'PVEAuthCookie': ticket}
        )

        if response.status_code == 200:
            return jsonify({'status': 'VM deleted'}), 200
        else:
            return jsonify({'error': 'Failed to delete VM'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
