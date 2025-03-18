import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Button,
  Tooltip,
  Divider
} from '@mui/material';
import { Menu as MenuIcon, Lock as LockOpen } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleLogout = async () => {
    handleCloseUserMenu();
    await dispatch(logout());
    navigate('/login');
  };
  
  // Navigation items
  const pages = [
    { title: 'Home', path: '/' },
    { title: 'Dashboard', path: '/dashboard', auth: true }
  ];
  
  // User menu items
  const userMenuItems = [
    { title: 'Profile', path: '/profile', action: () => navigate('/profile') },
    { title: 'Settings', path: '/settings', action: () => navigate('/settings') },
    { title: 'Logout', action: handleLogout }
  ];
  
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - Desktop */}
          <LockOpen sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            MERN Auth
          </Typography>
          
          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' }
              }}
            >
              {pages
                .filter(page => !page.auth || isAuthenticated)
                .map((page) => (
                  <MenuItem 
                    key={page.title} 
                    onClick={() => {
                      handleCloseNavMenu();
                      navigate(page.path);
                    }}
                  >
                    <Typography textAlign="center">{page.title}</Typography>
                  </MenuItem>
                ))}
            </Menu>
          </Box>
          
          {/* Logo - Mobile */}
          <LockOpen sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            MERN Auth
          </Typography>
          
          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages
              .filter(page => !page.auth || isAuthenticated)
              .map((page) => (
                <Button
                  key={page.title}
                  component={RouterLink}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.title}
                </Button>
              ))}
          </Box>
          
          {/* User menu or login/register buttons */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar 
                      alt={user?.name || 'User'} 
                      src={user?.profilePicture || ''} 
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1">{user?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  {userMenuItems.map((item) => (
                    <MenuItem key={item.title} onClick={item.action}>
                      <Typography textAlign="center">{item.title}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  sx={{ bgcolor: 'white', color: 'primary.main' }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;