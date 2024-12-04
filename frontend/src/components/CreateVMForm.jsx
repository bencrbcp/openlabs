import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config';


const CreateVMForm = ({ onVMCreated }) => {
  const [templateID, setTemplateID] = useState('');
  const [name, setName] = useState('');
  axios.defaults.withCredentials = true;

  const handleCreate = async () => {
    try {
      await axios.post(`${API_BASE_URL}/vms/create`, { template_vmid: templateID, name });
      onVMCreated();
    } catch (error) {
      alert('Error creating VM: ' + error.message);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2, // Adds spacing between elements
        padding: 3, // Adds padding inside the box
        border: '1px solid #ddd',
        borderRadius: 2,
        maxWidth: 400, // Limits the form width
        margin: 'auto', // Horizontally centers the form
      }}
    >
      <TextField
        label="Template VM ID"
        fullWidth
        value={templateID}
        onChange={(e) => setTemplateID(e.target.value)}
      />
      <TextField
        label="VM Name"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button variant="contained" onClick={handleCreate}>
        Create VM
      </Button>
    </Box>
  );
};

export default CreateVMForm;
