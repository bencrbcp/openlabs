import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Button, Grid, Card, CardContent, Divider, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom'; // Import the `useNavigate` hook

const ManageNetworks = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize the navigation function

  const fetchPools = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/pools`);
      const poolsData = response.data;

      // Fetch VMs for each pool
      for (let pool of poolsData) {
        const vmResponse = await axios.get(`${API_BASE_URL}/pools/${pool.poolid}`);
        const members = vmResponse.data.members || [];
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
        }));
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

  const handleManageClick = (poolid) => {
    navigate(`/manage-networks/${poolid}/machines`); // Navigate to the pool's detail page
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
      <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', textAlign: 'center' }}>
        Manage Existing Networks
      </Typography>

      <Box sx={{ marginBottom: 4 }}>
        {loading ? (
          <CircularProgress color="primary" />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : pools.length === 0 ? (
          <Typography>No pools found.</Typography>
        ) : (
          <Grid container spacing={3} sx={{ display: 'flex', justifyContent: 'center' }}>
            {pools.map((pool) => (
              <Grid key={pool.poolid} item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {pool.poolid}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {pool.comment || 'No description provided.'}
                    </Typography>

                    {pool.vms && pool.vms.length > 0 ? (
                      <List>
                        {pool.vms.map((vm) => (
                          <ListItem key={vm.vmid} sx={{ paddingLeft: 0, paddingRight: 0 }}>
                            <ListItemText
                              primary={<Typography variant="body2">VM: {vm.name}</Typography>}
                              secondary={<Typography variant="body2" color="text.secondary">Status: {vm.status}</Typography>}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No VMs in this pool.
                      </Typography>
                    )}
                    <Divider sx={{ my: 2 }} />
                    <Button variant="outlined" color="primary" fullWidth onClick={() => handleManageClick(pool.poolid)}>
                      Manage
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default ManageNetworks;
