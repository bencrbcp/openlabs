import React from 'react';

function RangeDetails({ activeRange }) {
  return (
    <div>
      <h2>Range: {activeRange.name}</h2>
      <div>
        <p>VM ID: {activeRange.vmid}</p>
        <p>Status: {activeRange.status === 'running' ? 'Running' : 'Stopped'}</p>
        {/* Add more details as necessary */}
      </div>
    </div>
  );
}

export default RangeDetails;