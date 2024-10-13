import React from 'react';

const ConsoleConnections = () => {
  return (
    <div className="container">
      <h2>Console Connections</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Host</th>
            <th>Protocol</th>
            <th>User</th>
            <th>Connect</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Windows Server 2016</td>
            <td>172.31.6.246</td>
            <td>RDP</td>
            <td>Administrator</td>
            <td><span className="action-icon connect-icon">???</span></td>
            <td><span className="action-icon edit-icon">???</span></td>
          </tr>
          <tr>
            <td>Kali</td>
            <td>172.31.16.33</td>
            <td>SSH</td>
            <td>root</td>
            <td><span className="action-icon connect-icon">???</span></td>
            <td><span className="action-icon edit-icon">???</span></td>
          </tr>
        </tbody>
      </table>
      <button className="button">New Console Connection</button>
    </div>
  );
};

export default ConsoleConnections;
