import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const NetworkConfigurationTab = () => {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderRadius: 1,
        padding: 3,
        boxShadow: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Network Configuration
      </Typography>
      <Typography variant="body1" gutterBottom>
        This is a placeholder for the Network Configuration tab.
      </Typography>
      <Typography variant="body2" gutterBottom>
        Here you can manage network settings, interfaces, and routing.
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemText primary="Configure network interfaces" />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary="Manage IP addresses" />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary="Set up routing and DNS" />
        </ListItem>
      </List>
    </Box>
  );
};

export default NetworkConfigurationTab;
