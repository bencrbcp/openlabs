import React from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import NetworkManagerTabs from './NetworkManagerTabs';
import MachinesTab from './network_tabs/MachinesTab'; // Component for the "Machines" tab
import RemoteAccessTab from './network_tabs/RemoteAccessTab'; // Ensure this import path is correct
import SnapshotsTab from './network_tabs/SnapshotsTab';
import NetworkConfigurationTab from './network_tabs/NetworkConfigurationTab';

const ManageNetworkDetail = () => {
  const location = useLocation();

  const currentTab = [
    '/manage-networks/:poolid/machines',
    '/manage-networks/:poolid/remote',
    '/manage-networks/:poolid/snapshots',
    '/manage-networks/:poolid/network',
  ].findIndex((path) => location.pathname.startsWith(path));

  const tabIndex = currentTab !== -1 ? currentTab : 0;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <NetworkManagerTabs currentTab={tabIndex} />
      <Box sx={{ padding: 3 }}>
        <Routes>
          <Route path="machines" element={<MachinesTab />} />
          <Route path="remote" element={<RemoteAccessTab />} />
          <Route path="snapshots" element={<SnapshotsTab />} />
          <Route path="network" element={<NetworkConfigurationTab />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default ManageNetworkDetail;
