import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
    const [vms, setVms] = useState([]);

    useEffect(() => {
        //fetch vms on 'mount' component
        fetchVms();
    }, []);

    const fetchVms = async () => {
        try {
            const response = await axios.get('http://localhost:5000/vms');
            setVms(response.data);
        } catch (error) {
            console.error("Error fetching VMs:", error);
        }
    };

    const stopVm = async (vmid) => {
        try {
            await axios.post(`http://localhost:5000/vms/${vmid}/stop`);
            fetchVms(); // refresh after stopping
        } catch (error) {
            console.error("Error stopping VM:", error);
        }
    };

    const createVm = () => {
        console.log("VM creation logic goes here");
      };
      

    return (
        <div>
          <h1>Proxmox Kali VM Manager</h1>
          <button onClick={createVm}>Launch New Kali VM</button>
          <div className="vm-grid">
            {vms.map((vm) => (
              <div key={vm.vmid} className="vm-card">
                <h2>{vm.name}</h2>
                <p>Status: {vm.status}</p>
                <button onClick={() => stopVm(vm.vmid)}>Stop</button>
              </div>
            ))}
          </div>
        </div>
    );
};

export default App;