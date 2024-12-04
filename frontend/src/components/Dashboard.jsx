import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VMsTable from './VMsTable';
import CreateVMForm from './CreateVMForm';
import { API_BASE_URL } from '../config';
import { Box, Typography } from '@mui/material';
import logo from '../assets/images/logo.png'; // Import the logo
import activeBackground from '../assets/images/activebackground.jpeg'; // Import the active background

axios.defaults.withCredentials = true;

const Dashboard = () => {
  const [vms, setVMs] = useState([]);

  const fetchActiveVMs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vms/active`);
      setVMs(response.data);
    } catch (error) {
      alert('Error fetching VMs: ' + error.message);
    }
  };

  useEffect(() => {
    fetchActiveVMs();
  }, []);

  return (
    <Box
      sx={{
        height: '100vh',
        padding: 3,
      }}
    >
      <Box display="flex" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ mr: 1 }}>
          Machine Dashboard
        </Typography>
        <img src={logo} alt="Logo" style={{ height: '40px' }} />
      </Box>
      <CreateVMForm onVMCreated={fetchActiveVMs} />
      <VMsTable vms={vms} onVMAction={fetchActiveVMs} />
    </Box>
  );
};

export default Dashboard;
