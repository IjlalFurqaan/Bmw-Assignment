import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  TextField,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ArrowLeft, Edit, Save, X, Car, Zap, Gauge, MapPin } from 'lucide-react';
import { vehicleService } from '../services/vehicleService';

interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  accelSec: number;
  topSpeedKmH: number;
  rangeKm: number;
  efficiencyWhKm: number;
  fastChargeKmH: number;
  rapidCharge: string;
  powerTrain: string;
  plugType: string;
  bodyStyle: string;
  segment: string;
  seats: number;
  priceEuro: number;
  date: string;
}

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(isEditMode);
  const [editedVehicle, setEditedVehicle] = useState<Partial<Vehicle>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVehicle(id);
    }
  }, [id]);

  const fetchVehicle = async (vehicleId: string) => {
    try {
      setLoading(true);
      const data = await vehicleService.getVehicle(vehicleId);
      setVehicle(data);
      setEditedVehicle(data);
    } catch (err) {
      setError('Failed to fetch vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedVehicle(vehicle || {});
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditedVehicle(vehicle || {});
  };

  const handleSave = async () => {
    if (!id || !editedVehicle) return;

    try {
      setSaving(true);
      const updatedVehicle = await vehicleService.updateVehicle(id, editedVehicle);
      setVehicle(updatedVehicle);
      setEditing(false);
    } catch (err) {
      setError('Failed to update vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Vehicle, value: string | number) => {
    setEditedVehicle(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !vehicle) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => navigate('/')}>
            Back to Grid
          </Button>
        }>
          {error || 'Vehicle not found'}
        </Alert>
      </Box>
    );
  }

  const InfoCard = ({ title, children, icon }: { title: string; children: React.ReactNode; icon: React.ReactNode }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          {icon}
          <Typography variant="h6" color="primary">
            {title}
          </Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );

  const EditableField = ({ 
    label, 
    field, 
    type = 'text',
    suffix = ''
  }: { 
    label: string; 
    field: keyof Vehicle; 
    type?: 'text' | 'number';
    suffix?: string;
  }) => {
    if (editing) {
      return (
        <TextField
          fullWidth
          size="small"
          label={label}
          type={type}
          value={editedVehicle[field] || ''}
          onChange={(e) => handleInputChange(field, type === 'number' ? Number(e.target.value) : e.target.value)}
          InputProps={{
            endAdornment: suffix ? <Typography variant="body2" color="text.secondary">{suffix}</Typography> : undefined
          }}
        />
      );
    }

    return (
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1">
          {vehicle[field]}{suffix}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back to Grid
        </Button>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4">
            {vehicle.brand} {vehicle.model}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip label={vehicle.bodyStyle} size="small" />
            <Chip label={vehicle.segment} size="small" />
            <Chip label={vehicle.powerTrain} size="small" color="primary" />
          </Stack>
        </Box>

        <Stack direction="row" spacing={1}>
          {editing ? (
            <>
              <Tooltip title="Cancel">
                <IconButton onClick={handleCancelEdit} disabled={saving}>
                  <X size={20} />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<Save size={20} />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              startIcon={<Edit size={20} />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
        </Stack>
      </Box>

      {/* Content */}
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <InfoCard title="Basic Information" icon={<Car size={20} />}>
            <Stack spacing={2}>
              <EditableField label="Brand" field="brand" />
              <EditableField label="Model" field="model" />
              <EditableField label="Body Style" field="bodyStyle" />
              <EditableField label="Segment" field="segment" />
              <EditableField label="Seats" field="seats" type="number" />
              <EditableField label="Price" field="priceEuro" type="number" suffix=" €" />
            </Stack>
          </InfoCard>
        </Grid>

        {/* Performance */}
        <Grid item xs={12} md={6}>
          <InfoCard title="Performance" icon={<Gauge size={20} />}>
            <Stack spacing={2}>
              <EditableField label="Acceleration (0-100 km/h)" field="accelSec" type="number" suffix=" sec" />
              <EditableField label="Top Speed" field="topSpeedKmH" type="number" suffix=" km/h" />
              <EditableField label="Range" field="rangeKm" type="number" suffix=" km" />
              <EditableField label="Efficiency" field="efficiencyWhKm" type="number" suffix=" Wh/km" />
            </Stack>
          </InfoCard>
        </Grid>

        {/* Electric Specifications */}
        <Grid item xs={12} md={6}>
          <InfoCard title="Electric Specifications" icon={<Zap size={20} />}>
            <Stack spacing={2}>
              <EditableField label="Fast Charge Speed" field="fastChargeKmH" type="number" suffix=" km/h" />
              <EditableField label="Rapid Charge" field="rapidCharge" />
              <EditableField label="Plug Type" field="plugType" />
              <EditableField label="PowerTrain" field="powerTrain" />
            </Stack>
          </InfoCard>
        </Grid>

        {/* Additional Info */}
        <Grid item xs={12} md={6}>
          <InfoCard title="Additional Information" icon={<MapPin size={20} />}>
            <Stack spacing={2}>
              <EditableField label="Date Added" field="date" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Record ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                  {vehicle._id}
                </Typography>
              </Box>
            </Stack>
          </InfoCard>
        </Grid>

        {/* Key Metrics Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h6" gutterBottom>
              Key Performance Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Typography variant="h4">{vehicle.rangeKm}</Typography>
                <Typography variant="body2">km Range</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="h4">{vehicle.accelSec}</Typography>
                <Typography variant="body2">sec 0-100</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="h4">{vehicle.topSpeedKmH}</Typography>
                <Typography variant="body2">km/h Top Speed</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="h4">{vehicle.priceEuro.toLocaleString()}</Typography>
                <Typography variant="body2">€ Price</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VehicleDetailPage;