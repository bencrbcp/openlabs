import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Fetch all cloned VMs
export const getVms = async () => {
  return axios.get(`${API_URL}/vms`);
};

// Clone the template VM
export const cloneVm = async (name) => {
  return axios.post(`${API_URL}/clone`, { name });
};

// Manage VM (start, stop, delete)
export const manageVm = async (vmId, action) => {
  return axios.post(`${API_URL}/vm/${vmId}/action`, { action });
};
