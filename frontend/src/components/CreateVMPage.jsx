import React from 'react';
import CreateVMForm from './CreateVMForm';
import { Box, Typography } from '@mui/material';

const CreateVMPage = () => {
  const handleVMCreated = () => {
    alert('VM Created!'); // Or navigate to another page if needed
  };

  return (
    <Box
    sx={{
      padding: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'background.default',
      minHeight: '100vh',
    }}
  >
    <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
      Create a New Virtual Machine
    </Typography>
    <Box
      sx={{
        width: '100%',
        maxWidth: '600px',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
        padding: 3,
      }}
    >
      <CreateVMForm onVMCreated={handleVMCreated} />
    </Box>
  </Box>
  
  );
};

export default CreateVMPage;
