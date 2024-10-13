import requests
import os
import random

# Fetch Proxmox credentials from environment variables
PROXMOX_API_URL = "https://proxmox.red.ufsit.club/api2/json"
PROXMOX_USERNAME = os.getenv('PROXMOX_USERNAME')
PROXMOX_PASSWORD = os.getenv('PROXMOX_PASSWORD')
PROXMOX_REALM = os.getenv('PROXMOX_REALM', 'pam')

TEMPLATE_VM_ID = "9001"
NODE = "ufsit01"

def get_auth_token():
    # Authentication to get Proxmox API token
    auth_url = f"{PROXMOX_API_URL}/access/ticket"
    payload = {
        'username': PROXMOX_USERNAME,
        'password': PROXMOX_PASSWORD,
        'realm': PROXMOX_REALM
    }
    response = requests.post(auth_url, data=payload, verify=False)
    return response.json().get('data')

def get_cloned_vms():
    token = get_auth_token()
    headers = {
        'Authorization': f"PVEAPIToken={token["ticket"]}'"
            }
    vms_url = f"{PROXMOX_API_URL}/nodes/{NODE}/qemu"
    response = requests.get(vms_url, headers=headers, verify=False)

    # Print for debugging
    print("Response Status Code:", response.status_code)
    print("Response Content:", response.text)

    if response.status_code == 200:
        return response.json().get('data', [])
    else:
        return []  # Return an empty array if the response is not successful



def clone_vm(new_vm_name):
    # Clone the kali-test VM template (id 9001)
    token = get_auth_token()
    headers = {
        'Authorization': f"PVEAPIToken={token['ticket']}"
    }
    clone_url = f"{PROXMOX_API_URL}/nodes/{NODE}/qemu/{TEMPLATE_VM_ID}/clone"

    # Generate a unique VM ID without depending on the name
    new_vm_id = random.randint(9000, 9999)  # Use a random ID in the range

    payload = {
        'newid': new_vm_id,  # Use the random ID
        'name': new_vm_name,
        'full': 1  # Full clone
    }
    
    response = requests.post(clone_url, json=payload, headers=headers, verify=False)

    # Print response details for debugging
    print("Response Status Code:", response.status_code)
    print("Response Content:", response.text)

    # Handle response appropriately
    try:
        response_data = response.json()
    except ValueError:
        # Return error details if response is not JSON
        return {"error": f"Failed to parse JSON response: {response.text}"}

    # Check if response status is successful and contains expected data
    if response.status_code == 200:
        return response_data
    else:
        return {"error": f"Failed to clone VM: {response.status_code} - {response_data}"}


  


def manage_vm(vm_id, action):
    # Start, stop, or delete a VM based on action
    token = get_auth_token()
    headers = {
        'Authorization': f"PVEAPIToken={token['ticket']}"
    }
    action_url = f"{PROXMOX_API_URL}/nodes/{NODE}/qemu/{vm_id}/status/{action}"
    response = requests.post(action_url, headers=headers, verify=False)
    return response.json()
