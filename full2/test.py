from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

# Proxmox API credentials (stored securely as environment variables)
PROXMOX_API_URL = "https://proxmox.red.ufsit.club/api2/json"
PROXMOX_NODE = "ufsit01"
VM_TEMPLATE_ID = 2001
PROXMOX_USER = os.getenv('PROXMOX_USER', 'root@pam')
PROXMOX_PASSWORD = os.getenv('PROXMOX_PASSWORD')

# Function to authenticate to Proxmox API
def get_proxmox_token():
    response = requests.post(
        f"{PROXMOX_API_URL}/access/ticket",
        data={'username': PROXMOX_USER, 'password': PROXMOX_PASSWORD}
    )
    result = response.json()['data']
    return result['ticket'], result['CSRFPreventionToken']

# Function to get all VM IDs
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

# Function to find the next available VM ID in the range 2002-2999
def find_next_available_vm_id():
    existing_vm_ids = get_all_vm_ids()
    for vm_id in range(2002, 3000):  # Iterate over the desired range
        if vm_id not in existing_vm_ids:
            return vm_id
    return None  # If no available ID is found

# Function to clone a VM
@app.route('/clone_vm', methods=['POST'])
def clone_vm():
    data = request.get_json()
    clone_name = data.get('name')

    # Validate VM name (alphanumeric and up to 40 characters)
    if not clone_name.isalnum() or len(clone_name) > 40:
        return jsonify({'error': 'Invalid VM name. Must be alphanumeric and <= 40 characters'}), 400

    try:
        # Find the next available VM ID
        clone_vm_id = find_next_available_vm_id()

        if clone_vm_id is None:
            return jsonify({'error': 'No available VM IDs in the 2002-2999 range'}), 500

        # Get auth token and CSRF token
        ticket, csrf_token = get_proxmox_token()

        # Create clone of VM 2001
        clone_payload = {
            "newid": clone_vm_id,
            "name": clone_name,
            "target": PROXMOX_NODE,
            "full": True  # Full clone
        }
        clone_response = requests.post(
            f"{PROXMOX_API_URL}/nodes/{PROXMOX_NODE}/qemu/{VM_TEMPLATE_ID}/clone",
            headers={'CSRFPreventionToken': csrf_token},
            cookies={'PVEAuthCookie': ticket},
            data=clone_payload
        )

        # Handle clone response
        if clone_response.status_code == 200:
            return jsonify({'status': 'success', 'vm_id': clone_vm_id}), 200
        else:
            return jsonify({'error': 'Failed to clone VM', 'details': clone_response.text}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# List all VMs
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

# Delete a VM
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
