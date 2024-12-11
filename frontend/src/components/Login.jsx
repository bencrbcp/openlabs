import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import { API_BASE_URL } from '../config';
import logo from '../assets/images/logo.png'; // Import the logo
import loginBackground from '../assets/images/loginbackground.jpeg'; // Import the login background

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
      if (response.data.message === 'Login successful') {
        navigate('/dashboard');
      }
    } catch (error) {
      alert('Login failed: ' + error.response.data.error);
    }
  };

  return (
    <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundImage: `url(${loginBackground})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(1)',
  }}
>
  <Container
    maxWidth="xs"
    sx={{
      background: 'rgba(30, 30, 30, 0.9)', // Dark semi-transparent background
      padding: 4,
      borderRadius: 2,
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)', // Add a shadow for depth
    }}
  >
    <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
      <Typography variant="h4" sx={{ mr: 1, color: 'primary.main' }}>
        OpenLabs
      </Typography>
      <img src={logo} alt="Logo" style={{ height: '40px' }} />
    </Box>
    <Typography
      variant="subtitle1"
      align="center"
      sx={{ mb: 1, color: 'text.secondary' }}
    >
      Cyber Ranges for everyone
    </Typography>
    <TextField
      label="Proxmox Username"
      fullWidth
      margin="normal"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      sx={{ input: { color: 'white' } }}
    />
    <TextField
      label="Password"
      type="password"
      fullWidth
      margin="normal"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      sx={{ input: { color: 'white' } }}
    />
    <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
      Login
    </Button>
  </Container>
</Box>
  );
};

export default Login;