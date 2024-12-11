import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'Machines', path: 'machines' },
  { label: 'Remote Access', path: 'remote' },
  { label: 'Snapshots', path: 'snapshots' },
  { label: 'Network Configuration', path: 'network' },
];

const NetworkManagerTabs = () => {
  const navigate = useNavigate();
  const { poolid } = useParams(); // Use poolid for dynamic routing
  const location = useLocation();

  // Determine the current tab index based on the URL path
  const currentTab = tabs.findIndex(tab =>
    location.pathname.includes(`/manage-networks/${poolid}/${tab.path}`)
  );

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        padding: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" sx={{ color: 'text.primary', marginLeft: 1 }}>
        Network Manager: {poolid}
      </Typography>
      <Box>
        {tabs.map((tab, index) => (
          <Button
            key={tab.path}
            color={currentTab === index ? 'secondary' : 'primary'}
            variant={currentTab === index ? 'contained' : 'outlined'}
            onClick={() => navigate(`/manage-networks/${poolid}/${tab.path}`)}
            sx={{ mx: 1 }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default NetworkManagerTabs;
