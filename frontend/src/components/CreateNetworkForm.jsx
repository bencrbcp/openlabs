import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const CreateNetworkForm = ({ onNetworkCreated }) => {
  const [poolName, setPoolName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  axios.defaults.withCredentials = true;

  const handleCreate = async () => {
    setError('');
    if (!poolName.trim()) {
      setError('Pool name is required.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/pools/add`, {
        poolid: poolName,
        comment: description || null,
      });

      if (response.status === 200) {
        onNetworkCreated();
        setPoolName('');
        setDescription('');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating pool.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: 3,
        border: '1px solid #333',
        borderRadius: 2,
        maxWidth: 400,
        margin: 'auto',
        backgroundColor: 'background.paper',
      }}
    >
      <TextField
        label="Pool Name"
        fullWidth
        value={poolName}
        onChange={(e) => setPoolName(e.target.value)}
        error={!!error}
        helperText={error}
        InputLabelProps={{ style: { color: 'text.secondary' } }}
        InputProps={{
          style: {
            color: 'text.primary',
          },
        }}
      />
      <TextField
        label="Description (Optional)"
        fullWidth
        multiline
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        InputLabelProps={{ style: { color: 'text.secondary' } }}
        InputProps={{
          style: {
            color: 'text.primary',
          },
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreate}
        sx={{ width: '100%' }}
      >
        Create Pool
      </Button>
    </Box>
  );
};

export default CreateNetworkForm;
