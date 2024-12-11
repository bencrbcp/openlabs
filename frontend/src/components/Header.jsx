import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { API_BASE_URL } from '../config';

axios.defaults.withCredentials = true;

const Header = () => {
  const [proxmoxUsername, setProxmoxUsername] = useState(null);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Get the username from localStorage
  const storedUsername = localStorage.getItem('username');

  useEffect(() => {
    if (storedUsername) {
      setProxmoxUsername(storedUsername); // Set the username from localStorage
    }
  }, [storedUsername]);

  useEffect(() => {
    if (proxmoxUsername) {
      axios.get(`${API_BASE_URL}/users/${proxmoxUsername}`)
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user details:", error);
        });
    }
  }, [proxmoxUsername]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Send the logout request to the backend
      await axios.get(`${API_BASE_URL}/logout`);
      
      // Remove the username from localStorage after successful logout
      localStorage.removeItem('username');
      
      // Redirect to the homepage (or login page)
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleProfile = () => {
    navigate(`/profile`); // Navigate to the profile page
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleCreateVM = () => {
    navigate('/create-vm'); 
  };
  
  const handleCreateNetwork = () => {
    navigate('/create-network'); 
  };

  const handleManageNetworks = () => {
    navigate('/manage-networks'); 
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          OpenLabs
        </Typography>
        {/* Add Dashboard and Create VM buttons */}
        <Button color="inherit" onClick={handleDashboard}>Dashboard</Button>
        <Button color="inherit" onClick={handleCreateVM}>Create VM</Button>
        <Button color="inherit" onClick={handleCreateNetwork}>Create Network</Button>
        <Button color="inherit" onClick={handleManageNetworks}>Manage Networks</Button>

        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ marginLeft: 5 }}>
              {user.username || storedUsername} {/* Display the logged-in user's username */}
            </Typography>
            
            <IconButton onClick={handleMenuOpen} color="inherit">
              <AccountCircleIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
