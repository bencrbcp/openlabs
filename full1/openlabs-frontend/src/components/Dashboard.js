import React, { useState, useEffect } from 'react';
import { getVms, cloneVm, manageVm } from '../services/api';

const Dashboard = () => {
  const [vms, setVms] = useState([]);
  const [newVmName, setNewVmName] = useState('');

  useEffect(() => {
    fetchVms();
  }, []);

  const fetchVms = async () => {
    try {
      const response = await getVms();
      console.log("VMs data:", response.data);  // Log the response data for debugging
      setVms(response.data);
    } catch (error) {
      console.error("Error fetching VMs:", error);
      setVms([]);  // Ensure `vms` is always an array, even on error
    }
  };
  

  const handleClone = async () => {
    if (newVmName) {
      await cloneVm(newVmName);
      fetchVms();  // Refresh the VM list
    }
  };
  

  const handleVmAction = async (vmId, action) => {
    await manageVm(vmId, action);
    fetchVms();  // Refresh the VM list
  };

  return (
    <div className="container">
      <h2>VM Dashboard</h2>
      <div>
        <input
          type="text"
          placeholder="New VM Name"
          value={newVmName}
          onChange={(e) => setNewVmName(e.target.value)}
        />
        <button className="button" onClick={handleClone}>
          Clone Template
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {vms.map((vm) => (
            <tr key={vm.vmid}>
              <td>{vm.vmid}</td>
              <td>{vm.name}</td>
              <td>{vm.status}</td>
              <td>
                <button onClick={() => handleVmAction(vm.vmid, 'start')}>Start</button>
                <button onClick={() => handleVmAction(vm.vmid, 'stop')}>Stop</button>
                <button onClick={() => handleVmAction(vm.vmid, 'delete')}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
