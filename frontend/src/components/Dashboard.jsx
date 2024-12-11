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
        minHeight: '100vh',
        backgroundColor: 'background.default',  // Apply background color to the full screen
        padding: 3,
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
          padding: 0,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
          overflowY: 'auto', // Allows scrolling in case of a long table
          height: 'calc(100vh - 220px)',  // Ensures the table is scrollable if needed
        }}
      >
        <VMsTable vms={vms} onVMAction={fetchActiveVMs} />
      </Box>
    </Box>
  );
};

export default Dashboard;