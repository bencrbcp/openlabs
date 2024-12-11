import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Button, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import CreateNetworkForm from './CreateNetworkForm';

const CreateNetworkPage = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPools = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/pools`);
      const poolsData = response.data;
      // Fetch VMs for each pool
      for (let pool of poolsData) {
        const vmResponse = await axios.get(`${API_BASE_URL}/pools/${pool.poolid}`);
        const members = vmResponse.data.members || []; // Get the VMs for this pool
        pool.vms = members.map((vm) => ({
          vmid: vm.vmid,
          name: vm.name,
          status: vm.status,
          cpu: vm.cpu,
          mem: vm.mem,
          disk: vm.disk,
          node: vm.node,
          netin: vm.netin,
          netout: vm.netout,
        }));  // Store the VM data in the pool object
      }
      setPools(poolsData);
    } catch (err) {
      setError('Failed to fetch pools.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  const handleNetworkCreated = () => {
    fetchPools(); // Refresh the pool list after a new pool is created
  };

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', align: 'center' }}>
        Create a New Network
      </Typography>
      <CreateNetworkForm onNetworkCreated={handleNetworkCreated} />
      <Typography variant="h4" gutterBottom>
        Existing Networks
      </Typography>

      <Box sx={{ marginBottom: 4 }}>
        {loading ? (
          <CircularProgress color="primary" />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : pools.length === 0 ? (
          <Typography>No pools found.</Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: 2,
              backgroundColor: 'background.paper',
              borderRadius: 2,
            }}
          >
            {pools.map((pool) => (
              <Box
                key={pool.poolid}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: 2,
                  border: '1px solid #333',
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {pool.poolid}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comment: {pool.comment || 'No description provided.'}
                  </Typography>
                </Box>
                
                {/* Display the list of VMs for this pool */}
                {pool.vms && pool.vms.length > 0 ? (
                  <List>
                    {pool.vms.map((vm) => (
                      <ListItem key={vm.vmid}>
                        <ListItemText 
                          primary={`VM: ${vm.name}`} 
                          secondary={`Status: ${vm.status}, CPU: ${vm.cpu}, Mem: ${vm.mem}`} 
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No VMs in this pool.
                  </Typography>
                )}
                
                <Button variant="outlined" color="primary" size="small">
                  View
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Box>

    </Box>
  );
};

export default CreateNetworkPage;
