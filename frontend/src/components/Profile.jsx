import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the user details for the profile page
    axios.get(`${API_BASE_URL}/users/root@pam`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        setError("Failed to load user data");
      });

    // Fetch the user's permissions
    axios.get(`${API_BASE_URL}/users/root@pam/permissions`)
      .then((response) => {
        setPermissions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user permissions:", error);
        setError("Failed to load user permissions");
      });
  }, []);

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  // Helper function to create permission groups for only the '/' path (Main permissions)
  const createPermissionGroups = (permissions) => {
    const groupedPermissions = {};

    // Iterate through each permission and check if it's in the '/' path (Main permissions)
    if (permissions['/']) {
      groupedPermissions['Main'] = [];
      // Add all permissions for the '/' path to the 'Main' group
      Object.keys(permissions['/']).forEach((permission) => {
        groupedPermissions['Main'].push(permission);
      });
    }

    return groupedPermissions;
  };

  const permissionGroups = createPermissionGroups(permissions);

  return (
    <Box
    sx={{
      height: '100vh',
      padding: 3,
      backgroundColor: 'background.default',
    }}
  >
    <Container sx={{ minHeight: '100vh', padding: 3, backgroundColor: 'background.default' }}>
      <Paper sx={{ padding: 3, backgroundColor: 'background.paper' }}>
        <Typography variant="h4" color="text.primary">Profile</Typography>
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h6" color="text.primary">Username: {user.username}</Typography>
          <Typography variant="h6" color="text.primary">Email: {user.email}</Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Groups Section */}
          <Typography variant="h5" color="text.primary" sx={{ marginBottom: 1 }}>Groups</Typography>
          {user.groups && user.groups.length > 0 ? (
            <Box sx={{ paddingLeft: 2 }}>
              {user.groups.map((group, index) => (
                <Typography key={index} variant="body1" color="text.secondary">
                  {group}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">No groups available</Typography>
          )}

          <Divider sx={{ my: 2 }} />
          
          {/* Permissions Section */}
          <Typography variant="h5" color="text.primary" sx={{ marginBottom: 1 }}>Permissions</Typography>
          {Object.keys(permissionGroups).length > 0 ? (
            <Box sx={{ paddingLeft: 2 }}>
              {Object.keys(permissionGroups).map((group, index) => (
                <Accordion key={index} sx={{ marginBottom: 1 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${group}-content`}
                    id={`panel-${group}-header`}
                  >
                    <Typography variant="h6" color="text.primary">{group} Permissions</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {permissionGroups[group].map((permission, idx) => (
                      <Typography key={idx} variant="body1" color="text.secondary">
                        {permission}
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">No permissions assigned</Typography>
          )}
        </Box>
      </Paper>
    </Container>
    </Box>
  );
};

export default Profile;
