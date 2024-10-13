import React from 'react';

const Home = () => {
  return (
    <div className="container">
      <h2>Console Connections</h2>
      <table className="connection-table">
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
            <td><button className="connect-btn">🔗</button></td>
            <td><button className="edit-btn">🔧</button></td>
          </tr>
          <tr>
            <td>Kali</td>
            <td>172.31.16.33</td>
            <td>SSH</td>
            <td>root</td>
            <td><button className="connect-btn">🔗</button></td>
            <td><button className="edit-btn">🔧</button></td>
          </tr>
          <tr>
            <td>Kali Desktop</td>
            <td>172.31.16.33</td>
            <td>VNC</td>
            <td>root</td>
            <td><button className="connect-btn">🔗</button></td>
            <td><button className="edit-btn">🔧</button></td>
          </tr>
        </tbody>
      </table>

      <button className="new-console-btn">New Console Connection</button>

      <h2>VPN Configs</h2>
      <table className="vpn-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Client OS</th>
            <th>Download</th>
            <th>Revoke</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Windows Testing 1</td>
            <td>Windows</td>
            <td><button className="download-btn">⬇</button></td>
            <td><button className="revoke-btn">❌</button></td>
          </tr>
          <tr>
            <td>My VPN</td>
            <td>Linux</td>
            <td><button className="download-btn">⬇</button></td>
            <td><button className="revoke-btn">❌</button></td>
          </tr>
        </tbody>
      </table>

      <button className="new-vpn-btn">New VPN Config</button>
    </div>
  );
}

export default Home;
