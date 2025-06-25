import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Car, Plus, Grid3X3 } from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Car size={32} style={{ marginRight: 16 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            BMW IT - Vehicle DataGrid
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/')}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            startIcon={<Grid3X3 size={18} />}
          >
            Data Grid
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/create')}
            variant={location.pathname === '/create' ? 'outlined' : 'text'}
            startIcon={<Plus size={18} />}
          >
            Add Vehicle
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;