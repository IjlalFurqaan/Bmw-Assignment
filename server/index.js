import express from 'express';
import cors from 'cors';
import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bmw_electric_cars';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema and Model
const vehicleSchema = new mongoose.Schema({
  brand: String,
  model: String,
  accelSec: Number,
  topSpeedKmH: Number,
  rangeKm: Number,
  efficiencyWhKm: Number,
  fastChargeKmH: Number,
  rapidCharge: String,
  powerTrain: String,
  plugType: String,
  bodyStyle: String,
  segment: String,
  seats: Number,
  priceEuro: Number,
  date: String
}, { timestamps: true });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// Import CSV Data
const importCSVData = async () => {
  try {
    const count = await Vehicle.countDocuments();
    
    if (count === 0) {
      console.log('Importing CSV data...');
      const csvFilePath = join(__dirname, '../BMW_Aptitude_Test_Test_Data_ElectricCarData.csv');
      
      if (!fs.existsSync(csvFilePath)) {
        console.log('CSV file not found, creating sample data...');
        const sampleData = [
          {
            brand: "BMW",
            model: "iX3",
            accelSec: 6.8,
            topSpeedKmH: 180,
            rangeKm: 460,
            efficiencyWhKm: 186,
            fastChargeKmH: 560,
            rapidCharge: "Yes",
            powerTrain: "RWD",
            plugType: "Type2 CCS",
            bodyStyle: "SUV",
            segment: "D",
            seats: 5,
            priceEuro: 68040,
            date: "2021-01-01"
          },
          {
            brand: "BMW",
            model: "i4",
            accelSec: 5.7,
            topSpeedKmH: 190,
            rangeKm: 590,
            efficiencyWhKm: 165,
            fastChargeKmH: 630,
            rapidCharge: "Yes",
            powerTrain: "RWD",
            plugType: "Type2 CCS",
            bodyStyle: "Sedan",
            segment: "D",
            seats: 5,
            priceEuro: 58300,
            date: "2021-01-01"
          }
        ];
        
        await Vehicle.insertMany(sampleData);
        console.log('Sample data imported successfully');
      } else {
        const results = [];
        fs.createReadStream(csvFilePath)
          .pipe(csv())
          .on('data', (data) => {
            results.push({
              brand: data.Brand?.trim(),
              model: data.Model?.trim(),
              accelSec: parseFloat(data.AccelSec) || 0,
              topSpeedKmH: parseInt(data.TopSpeed_KmH) || 0,
              rangeKm: parseInt(data.Range_Km) || 0,
              efficiencyWhKm: parseInt(data.Efficiency_WhKm) || 0,
              fastChargeKmH: parseInt(data.FastCharge_KmH) || 0,
              rapidCharge: data.RapidCharge?.trim(),
              powerTrain: data.PowerTrain?.trim(),
              plugType: data.PlugType?.trim(),
              bodyStyle: data.BodyStyle?.trim(),
              segment: data.Segment?.trim(),
              seats: parseInt(data.Seats) || 0,
              priceEuro: parseInt(data.PriceEuro) || 0,
              date: data.Date?.trim()
            });
          })
          .on('end', async () => {
            await Vehicle.insertMany(results);
            console.log(`Imported ${results.length} vehicles from CSV`);
          });
      }
    }
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

// Import data on startup
setTimeout(importCSVData, 1000);

// Routes

// Get all vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const sortField = req.query.sortField || 'brand';
    const sortDirection = req.query.sortDirection === 'desc' ? -1 : 1;

    // Build query
    const query = search ? {
      $or: [
        { brand: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { bodyStyle: new RegExp(search, 'i') },
        { powerTrain: new RegExp(search, 'i') },
        { plugType: new RegExp(search, 'i') },
        { segment: new RegExp(search, 'i') }
      ]
    } : {};

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit),
      Vehicle.countDocuments(query)
    ]);

    res.json({
      vehicles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single vehicle
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create vehicle
app.post('/api/vehicles', async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    const savedVehicle = await vehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update vehicle
app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete vehicle
app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});