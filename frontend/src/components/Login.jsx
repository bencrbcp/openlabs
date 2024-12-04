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
        height: '100vh', // Full viewport height
        backgroundImage: `url(${loginBackground})`, // Set background image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          background: 'rgba(255, 255, 255, 0.8)', // Optional: semi-transparent background for form
          padding: 4,
          borderRadius: 2,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
          <Typography variant="h4" sx={{ mr: 1 }}>
            OpenLabs
          </Typography>
          <img src={logo} alt="Logo" style={{ height: '40px' }} />
        </Box>
        <Typography
          variant="subtitle1"
          align="center"
          color="textSecondary"
          sx={{ mb: 1 }}
        >
          Cyber Ranges for everyone
        </Typography>
        <TextField
          label="Proxmox Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
          Login
        </Button>
      </Container>
    </Box>
  );
};

export default Login;
