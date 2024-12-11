import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';

const RemoteAccessTab = () => {
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
        Remote Access
      </Typography>
      <Typography variant="body1" gutterBottom>
        This is a placeholder for the Remote Access tab.
      </Typography>
      <Typography variant="body2" gutterBottom>
        Here you can manage remote access settings, configurations, and related tasks.
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemText primary="Configure VPN" />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary="Set up SSH" />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText primary="Manage remote desktop settings" />
        </ListItem>
      </List>
    </Box>
  );
};

export default RemoteAccessTab;
