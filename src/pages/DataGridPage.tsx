import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert
} from '@mui/material';
import { Plus } from 'lucide-react';
import GenericDataGrid, { GridColumn } from '../components/GenericDataGrid';
import { vehicleService } from '../services/vehicleService';

const DataGridPage: React.FC = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Define columns for the vehicle data
  const columns: GridColumn[] = [
    { field: 'brand', headerName: 'Brand', width: 120 },
    { field: 'model', headerName: 'Model', width: 200 },
    { field: 'accelSec', headerName: 'Acceleration (sec)', width: 150, type: 'number' },
    { field: 'topSpeedKmH', headerName: 'Top Speed (km/h)', width: 150, type: 'number' },
    { field: 'rangeKm', headerName: 'Range (km)', width: 120, type: 'number' },
    { field: 'efficiencyWhKm', headerName: 'Efficiency (Wh/km)', width: 160, type: 'number' },
    { field: 'fastChargeKmH', headerName: 'Fast Charge (km/h)', width: 160, type: 'number' },
    { field: 'powerTrain', headerName: 'PowerTrain', width: 120 },
    { field: 'bodyStyle', headerName: 'Body Style', width: 120 },
    { field: 'segment', headerName: 'Segment', width: 100 },
    { field: 'seats', headerName: 'Seats', width: 80, type: 'number' },
    { field: 'priceEuro', headerName: 'Price (€)', width: 120, type: 'number' },
  ];

  const handleView = (vehicle: any) => {
    navigate(`/vehicle/${vehicle._id}`);
  };

  const handleEdit = (vehicle: any) => {
    navigate(`/vehicle/${vehicle._id}?edit=true`);
  };

  const handleDeleteClick = (vehicle: any) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;

    try {
      await vehicleService.deleteVehicle(vehicleToDelete._id);
      setSnackbar({
        open: true,
        message: 'Vehicle deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
      // Force refresh by updating a key or using a ref to the grid
      window.location.reload();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete vehicle',
        severity: 'error'
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Electric Vehicle Database
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive data management for BMW's electric vehicle portfolio
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => navigate('/create')}
          sx={{ height: 'fit-content' }}
        >
          Add New Vehicle
        </Button>
      </Box>

      {/* Data Grid */}
      <Box sx={{ flexGrow: 1 }}>
        <GenericDataGrid
          columns={columns}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          title="Electric Vehicles"
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this vehicle: {vehicleToDelete?.brand} {vehicleToDelete?.model}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataGridPage;