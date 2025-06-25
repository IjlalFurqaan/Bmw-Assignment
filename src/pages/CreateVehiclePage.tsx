import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ArrowLeft, Save, Car } from 'lucide-react';
import { vehicleService } from '../services/vehicleService';

interface VehicleForm {
  brand: string;
  model: string;
  accelSec: string;
  topSpeedKmH: string;
  rangeKm: string;
  efficiencyWhKm: string;
  fastChargeKmH: string;
  rapidCharge: string;
  powerTrain: string;
  plugType: string;
  bodyStyle: string;
  segment: string;
  seats: string;
  priceEuro: string;
  date: string;
}

const CreateVehiclePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<VehicleForm>({
    brand: '',
    model: '',
    accelSec: '',
    topSpeedKmH: '',
    rangeKm: '',
    efficiencyWhKm: '',
    fastChargeKmH: '',
    rapidCharge: 'Yes',
    powerTrain: 'RWD',
    plugType: 'Type 2 CCS',
    bodyStyle: 'Sedan',
    segment: 'D',
    seats: '5',
    priceEuro: '',
    date: new Date().toLocaleDateString('en-US'),
  });

  const handleInputChange = (field: keyof VehicleForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert string values to appropriate types
      const vehicleData = {
        ...formData,
        accelSec: parseFloat(formData.accelSec),
        topSpeedKmH: parseInt(formData.topSpeedKmH),
        rangeKm: parseInt(formData.rangeKm),
        efficiencyWhKm: parseInt(formData.efficiencyWhKm),
        fastChargeKmH: parseInt(formData.fastChargeKmH),
        seats: parseInt(formData.seats),
        priceEuro: parseInt(formData.priceEuro),
      };

      const newVehicle = await vehicleService.createVehicle(vehicleData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate(`/vehicle/${newVehicle._id}`);
      }, 1500);
    } catch (err) {
      setError('Failed to create vehicle. Please check all fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  const powerTrainOptions = ['RWD', 'FWD', 'AWD'];
  const bodyStyleOptions = ['Sedan', 'Hatchback', 'SUV', 'Liftback', 'MPV', 'Station', 'Cabrio', 'Pickup'];
  const segmentOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'S', 'N'];
  const plugTypeOptions = ['Type 2 CCS', 'Type 2', 'Type 1 CHAdeMO', 'Type 2 CHAdeMO'];

  if (success) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="success">
          Vehicle created successfully! Redirecting to vehicle details...
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back to Grid
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Car size={24} />
          <Typography variant="h4">
            Add New Vehicle
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand"
                required
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                required
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Body Style</InputLabel>
                <Select
                  value={formData.bodyStyle}
                  label="Body Style"
                  onChange={(e) => handleInputChange('bodyStyle', e.target.value)}
                >
                  {bodyStyleOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Segment</InputLabel>
                <Select
                  value={formData.segment}
                  label="Segment"
                  onChange={(e) => handleInputChange('segment', e.target.value)}
                >
                  {segmentOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Seats"
                type="number"
                required
                value={formData.seats}
                onChange={(e) => handleInputChange('seats', e.target.value)}
                inputProps={{ min: 2, max: 9 }}
              />
            </Grid>

            {/* Performance */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                Performance
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Acceleration (0-100 km/h)"
                type="number"
                required
                value={formData.accelSec}
                onChange={(e) => handleInputChange('accelSec', e.target.value)}
                InputProps={{ endAdornment: 'sec' }}
                inputProps={{ step: 0.1, min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Top Speed"
                type="number"
                required
                value={formData.topSpeedKmH}
                onChange={(e) => handleInputChange('topSpeedKmH', e.target.value)}
                InputProps={{ endAdornment: 'km/h' }}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Range"
                type="number"
                required
                value={formData.rangeKm}
                onChange={(e) => handleInputChange('rangeKm', e.target.value)}
                InputProps={{ endAdornment: 'km' }}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Efficiency"
                type="number"
                required
                value={formData.efficiencyWhKm}
                onChange={(e) => handleInputChange('efficiencyWhKm', e.target.value)}
                InputProps={{ endAdornment: 'Wh/km' }}
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Electric Specifications */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                Electric Specifications
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fast Charge Speed"
                type="number"
                required
                value={formData.fastChargeKmH}
                onChange={(e) => handleInputChange('fastChargeKmH', e.target.value)}
                InputProps={{ endAdornment: 'km/h' }}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Rapid Charge</InputLabel>
                <Select
                  value={formData.rapidCharge}
                  label="Rapid Charge"
                  onChange={(e) => handleInputChange('rapidCharge', e.target.value)}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>PowerTrain</InputLabel>
                <Select
                  value={formData.powerTrain}
                  label="PowerTrain"
                  onChange={(e) => handleInputChange('powerTrain', e.target.value)}
                >
                  {powerTrainOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Plug Type</InputLabel>
                <Select
                  value={formData.plugType}
                  label="Plug Type"
                  onChange={(e) => handleInputChange('plugType', e.target.value)}
                >
                  {plugTypeOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                required
                value={formData.priceEuro}
                onChange={(e) => handleInputChange('priceEuro', e.target.value)}
                InputProps={{ endAdornment: '€' }}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Save size={20} />}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Vehicle'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateVehiclePage;