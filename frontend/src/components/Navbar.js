import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Divider,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle, 
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  SwapHoriz as SwapHorizIcon,
  Assignment as AssignmentIcon,
  ListAlt as ListAltIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, toggleRole, activeRole } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleDashboard = () => {
    handleClose();
    navigate('/dashboard');
  };

  const handleNewInvestigation = () => {
    handleClose();
    navigate('/investigations/new');
  };

  const handleInvestigationRequests = () => {
    handleClose();
    navigate('/investigation-requests');
  };

  const handleMyInvestigations = () => {
    handleClose();
    navigate('/my-investigations');
  };

  const handleToggleRole = async () => {
    try {
      setLoading(true);
      await toggleRole();
      handleClose();
      // Refresh the page to update the UI based on the new role
      window.location.reload();
    } catch (error) {
      console.error('Failed to toggle role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          Investigation Hub
        </Typography>
        
        {isAuthenticated ? (
          <>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/dashboard"
              startIcon={<DashboardIcon />}
              sx={{ mr: 2 }}
            >
              Dashboard
            </Button>
            
            {activeRole === 'client' && (
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/investigations/new"
                startIcon={<AddIcon />}
                sx={{ mr: 2 }}
              >
                New Investigation
              </Button>
            )}
            
            {activeRole === 'investigator' && (
              <>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/investigation-requests"
                  startIcon={<AssignmentIcon />}
                  sx={{ mr: 2 }}
                >
                  Investigation Requests
                </Button>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/my-investigations"
                  startIcon={<ListAltIcon />}
                  sx={{ mr: 2 }}
                >
                  My Investigations
                </Button>
              </>
            )}
            
            <Tooltip title="Account settings">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {user?.first_name ? (
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {user.first_name.charAt(0).toUpperCase()}
                  </Avatar>
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleDashboard}>
                <ListItemIcon>
                  <DashboardIcon fontSize="small" />
                </ListItemIcon>
                Dashboard
              </MenuItem>
              
              {activeRole === 'client' && (
                <MenuItem onClick={handleNewInvestigation}>
                  <ListItemIcon>
                    <AddIcon fontSize="small" />
                  </ListItemIcon>
                  New Investigation
                </MenuItem>
              )}
              
              {activeRole === 'investigator' && (
                <>
                  <MenuItem onClick={handleInvestigationRequests}>
                    <ListItemIcon>
                      <AssignmentIcon fontSize="small" />
                    </ListItemIcon>
                    Investigation Requests
                  </MenuItem>
                  <MenuItem onClick={handleMyInvestigations}>
                    <ListItemIcon>
                      <ListAltIcon fontSize="small" />
                    </ListItemIcon>
                    My Investigations
                  </MenuItem>
                </>
              )}
              
              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              
              {user?.roles?.includes('client') && user?.roles?.includes('investigator') && (
                <MenuItem onClick={handleToggleRole} disabled={loading}>
                  <ListItemIcon>
                    <SwapHorizIcon fontSize="small" />
                  </ListItemIcon>
                  Switch to {activeRole === 'client' ? 'Investigator' : 'Client'} Mode
                </MenuItem>
              )}
              
              <Divider />
              
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/login"
              sx={{ mr: 2 }}
            >
              Login
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/register"
              variant="outlined"
            >
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 