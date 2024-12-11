import React, { useEffect, useState } from 'react';
import axios from 'axios';
import VMsTable from './VMsTable';
import { API_BASE_URL } from '../config';
import { Box, Typography } from '@mui/material';
import logo from '../assets/images/logo.png';

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
    backgroundColor: 'background.default',
  }}
>
  <Box display="flex" alignItems="center" mb={3}>
    <Typography variant="h4" sx={{ mr: 1, color: 'primary.main' }}>
      Machine Dashboard
    </Typography>
    <img src={logo} alt="Logo" style={{ height: '40px' }} />
  </Box>
  <Box
    sx={{
      maxWidth: '80%',
      margin: 'auto',
      padding: 2,
      backgroundColor: 'background.paper',
      borderRadius: 2,
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
    }}
  >
    <VMsTable vms={vms} onVMAction={fetchActiveVMs} />
  </Box>
</Box>
  );
};

export default Dashboard;
