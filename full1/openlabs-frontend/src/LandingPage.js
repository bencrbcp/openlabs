import React, { useState } from 'react';
import { getHealthCheck } from '../services/api';

const LandingPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    // Implement authentication logic here
    const health = await getHealthCheck();
    console.log('Health Check:', health.data);
  };

  return (
    <div>
      <h1>OpenLabs</h1>
      <form onSubmit={handleLogin}>
        <label>User Name</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default LandingPage;
