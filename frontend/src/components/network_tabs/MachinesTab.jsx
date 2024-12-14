import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Divider, List, ListItem, ListItemText, Button, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const MachinesTab = () => {
  const { poolid } = useParams();
  const [poolData, setPoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPoolDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/pools/${poolid}`);
      setPoolData(response.data);
    } catch (err) {
      setError('Failed to fetch pool details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoolDetails();
  }, [poolid]);

  if (loading) return <CircularProgress color="primary" />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Grid container spacing={3}>
      {poolData?.members.map((vm) => (
        <Grid key={vm.id} item xs={12} sm={6} md={4}>
          <Card sx={{ backgroundColor: 'background.paper', color: 'text.primary' }}>
            <CardContent>
              <Typography variant="h6">{vm.name}</Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                <ListItem>
                  <ListItemText primary="Status" secondary={vm.status} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="CPU" secondary={vm.cpu} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Memory" secondary={vm.mem} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Disk" secondary={vm.disk} />
                </ListItem>
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="contained" color="primary" size="small">
                  Start
                </Button>
                <Button variant="contained" color="secondary" size="small">
                  Stop
                </Button>
                <Button variant="outlined" color="error" size="small">
                  Delete
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MachinesTab;
