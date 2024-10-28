import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dialog from './Dialog';

function ActiveRanges({ setActiveRange, setPage }) {
  const [ranges, setRanges] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newRangeName, setNewRangeName] = useState('');

  useEffect(() => {
    // Fetch the list of active VMs (ranges)
    axios.get('http://localhost:5000/list_vms')
    .then(response => setRanges(response.data.vms))
    .catch(error => console.error(error));  
  }, []);

  const handleCreateRange = () => {
    // Allow alphanumeric, underscores, and dashes in the name
    if (newRangeName.length > 40 || !/^[a-zA-Z0-9_-]+$/.test(newRangeName)) {
      alert('Range name must be alphanumeric and may include underscores, dashes, and up to 40 characters.');
      return;
    }
  
    // Send request to create new range (VM clone)
    axios.post('http://localhost:5000/clone_vm', { name: newRangeName })
    .then(() => {
      setShowDialog(false);
      setNewRangeName('');
      window.location.reload();  // Refresh page to see new range
    })
    .catch(error => console.log(error));
  };

  const handleDeleteRange = (vmId) => {
    if (window.confirm('Are you sure you want to delete this range?')) {
        axios.delete(`http://localhost:5000/delete_vm/${vmId}`)
            .then(() => {
                setRanges(ranges.filter(range => range.vmid !== vmId));
            })
            .catch(error => console.error(error));
    }
  };

  return (
    <div>
      <h2>Select a Range</h2>
      <table>
        <thead>
          <tr>
            <th>Range Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ranges.map(range => (
            <tr key={range.vmid}>
              <td>{range.name}</td>
              <td>
                <button onClick={() => { setActiveRange(range); setPage('rangeDetails'); }}>Manage</button>
                <button onClick={() => handleDeleteRange(range.vmid)} style={{ marginLeft: '10px', color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setShowDialog(true)}>Deploy New Range</button>

      {showDialog && (
        <Dialog
          title="Deploy New Range"
          onClose={() => setShowDialog(false)}
          onSubmit={handleCreateRange}
          inputValue={newRangeName}
          setInputValue={setNewRangeName}
        />
      )}
    </div>
  );
}

export default ActiveRanges;
