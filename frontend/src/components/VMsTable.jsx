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
          <TableCell>Name</TableCell>
          <TableCell>VM ID</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {vms.map((vm) => (
          <TableRow key={vm.vmid}>
            <TableCell>{vm.name}</TableCell>
            <TableCell>{vm.vmid}</TableCell>
            <TableCell>{vm.status}</TableCell>
            <TableCell>
              <Button onClick={() => handleStop(vm.vmid)}>Stop</Button>
              <Button onClick={() => handleDelete(vm.vmid)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default VMsTable;
