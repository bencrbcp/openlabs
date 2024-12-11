import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { API_BASE_URL } from '../config';

axios.defaults.withCredentials = true;

const Header = () => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the logged-in user details when the component mounts
    axios.get(`${API_BASE_URL}/users/root@pam`) // Assuming you create this endpoint to return the logged-in user info
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    axios.get(`${API_BASE_URL}/logout`)
      .then(() => {
        navigate('/')
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  const handleProfile = () => {
    navigate(`/profile`); // Navigate to the profile page
  };

  const handleDashboard = () => {
    navigate('/dashboard'); // Navigate to the dashboard
  };

  const handleCreateVM = () => {
    navigate('/create-vm'); // Navigate to the create VM page
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          OpenLabs
        </Typography>
        {/* Add Dashboard and Create VM buttons */}
        <Button color="inherit" onClick={handleDashboard}>Dashboard</Button>
        <Button color="inherit" onClick={handleCreateVM}>Create VM</Button>
        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ marginRight: 2 }}>
              {user.username} {/* Display the logged-in user's username */}
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
