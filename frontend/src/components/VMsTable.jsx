import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config';

axios.defaults.withCredentials = true;

const VMsTable = ({ vms, onVMAction }) => {
  const handleStop = async (vmid) => {
    try {
      await axios.post(`${API_BASE_URL}/vms/${vmid}/stop`);
      onVMAction();
    } catch (error) {
      alert('Error stopping VM: ' + error.message);
    }
  };

  const handleDelete = async (vmid) => {
    try {
      await axios.delete(`${API_BASE_URL}/vms/${vmid}/delete`);
      onVMAction();
    } catch (error) {
      alert('Error deleting VM: ' + error.message);
    }
  };

  return (
    <Table>
  <TableHead>
    <TableRow>
      <TableCell sx={{ color: 'text.primary' }}>Name</TableCell>
      <TableCell sx={{ color: 'text.primary' }}>VM ID</TableCell>
      <TableCell sx={{ color: 'text.primary' }}>Status</TableCell>
      <TableCell sx={{ color: 'text.primary' }}>Actions</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {vms.map((vm) => (
      <TableRow key={vm.vmid} sx={{ backgroundColor: 'background.default' }}>
        <TableCell sx={{ color: 'text.secondary' }}>{vm.name}</TableCell>
        <TableCell sx={{ color: 'text.secondary' }}>{vm.vmid}</TableCell>
        <TableCell sx={{ color: 'text.secondary' }}>{vm.status}</TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleStop(vm.vmid)}
            sx={{ mr: 1 }}
          >
            Stop
          </Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(vm.vmid)}>
            Delete
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
  );
};

export default VMsTable;
