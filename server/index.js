import express from 'express';
import cors from 'cors';
import fs from 'fs';
import csv from 'csv-parser';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite database setup
const dbPath = join(__dirname, 'vehicles.db');
const db = new sqlite3.Database(dbPath);

// Create vehicles table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT,
    model TEXT,
    accelSec REAL,
    topSpeedKmH INTEGER,
    rangeKm INTEGER,
    efficiencyWhKm INTEGER,
    fastChargeKmH INTEGER,
    rapidCharge TEXT,
    powerTrain TEXT,
    plugType TEXT,
    bodyStyle TEXT,
    segment TEXT,
    seats INTEGER,
    priceEuro INTEGER,
    date TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Import CSV data on server start (only if table is empty)
const importCSVData = async () => {
  try {
    db.get("SELECT COUNT(*) as count FROM vehicles", (err, row) => {
      if (err) {
        console.error('Error checking vehicle count:', err);
        return;
      }
      
      if (row.count === 0) {
        console.log('Importing CSV data...');
        const csvFilePath = join(__dirname, '../BMW_Aptitude_Test_Test_Data_ElectricCarData.csv');
        
        if (!fs.existsSync(csvFilePath)) {
          console.log('CSV file not found, creating sample data...');
          // Create sample data if CSV file is not available
          const sampleData = [
            {
              brand: 'Tesla',
              model: 'Model 3 Long Range Dual Motor',
              accelSec: 4.6,
              topSpeedKmH: 233,
              rangeKm: 450,
              efficiencyWhKm: 161,
              fastChargeKmH: 940,
              rapidCharge: 'Yes',
              powerTrain: 'AWD',
              plugType: 'Type 2 CCS',
              bodyStyle: 'Sedan',
              segment: 'D',
              seats: 5,
              priceEuro: 55480,
              date: '8/24/16'
            },
            {
              brand: 'BMW',
              model: 'iX3',
              accelSec: 6.8,
              topSpeedKmH: 180,
              rangeKm: 360,
              efficiencyWhKm: 206,
              fastChargeKmH: 560,
              rapidCharge: 'Yes',
              powerTrain: 'RWD',
              plugType: 'Type 2 CCS',
              bodyStyle: 'SUV',
              segment: 'D',
              seats: 5,
              priceEuro: 68040,
              date: '8/29/16'
            },
            {
              brand: 'Volkswagen',
              model: 'ID.3 Pure',
              accelSec: 10,
              topSpeedKmH: 160,
              rangeKm: 270,
              efficiencyWhKm: 167,
              fastChargeKmH: 250,
              rapidCharge: 'Yes',
              powerTrain: 'RWD',
              plugType: 'Type 2 CCS',
              bodyStyle: 'Hatchback',
              segment: 'C',
              seats: 5,
              priceEuro: 30000,
              date: '8/25/16'
            },
            {
              brand: 'Audi',
              model: 'e-tron GT',
              accelSec: 3.9,
              topSpeedKmH: 245,
              rangeKm: 488,
              efficiencyWhKm: 194,
              fastChargeKmH: 780,
              rapidCharge: 'Yes',
              powerTrain: 'AWD',
              plugType: 'Type 2 CCS',
              bodyStyle: 'Coupe',
              segment: 'F',
              seats: 4,
              priceEuro: 99800,
              date: '9/15/16'
            },
            {
              brand: 'Mercedes',
              model: 'EQS 450+',
              accelSec: 6.2,
              topSpeedKmH: 210,
              rangeKm: 770,
              efficiencyWhKm: 157,
              fastChargeKmH: 720,
              rapidCharge: 'Yes',
              powerTrain: 'RWD',
              plugType: 'Type 2 CCS',
              bodyStyle: 'Sedan',
              segment: 'F',
              seats: 5,
              priceEuro: 106374,
              date: '9/20/16'
            }
          ];
          
          const stmt = db.prepare(`INSERT INTO vehicles (
            brand, model, accelSec, topSpeedKmH, rangeKm, efficiencyWhKm,
            fastChargeKmH, rapidCharge, powerTrain, plugType, bodyStyle,
            segment, seats, priceEuro, date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
          
          sampleData.forEach(vehicle => {
            stmt.run([
              vehicle.brand, vehicle.model, vehicle.accelSec, vehicle.topSpeedKmH,
              vehicle.rangeKm, vehicle.efficiencyWhKm, vehicle.fastChargeKmH,
              vehicle.rapidCharge, vehicle.powerTrain, vehicle.plugType,
              vehicle.bodyStyle, vehicle.segment, vehicle.seats,
              vehicle.priceEuro, vehicle.date
            ]);
          });
          
          stmt.finalize();
          console.log('Sample data imported successfully');
        } else {
          const results = [];
          fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => {
              const vehicle = {
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
              };
              results.push(vehicle);
            })
            .on('end', () => {
              try {
                const stmt = db.prepare(`INSERT INTO vehicles (
                  brand, model, accelSec, topSpeedKmH, rangeKm, efficiencyWhKm,
                  fastChargeKmH, rapidCharge, powerTrain, plugType, bodyStyle,
                  segment, seats, priceEuro, date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                
                results.forEach(vehicle => {
                  stmt.run([
                    vehicle.brand, vehicle.model, vehicle.accelSec, vehicle.topSpeedKmH,
                    vehicle.rangeKm, vehicle.efficiencyWhKm, vehicle.fastChargeKmH,
                    vehicle.rapidCharge, vehicle.powerTrain, vehicle.plugType,
                    vehicle.bodyStyle, vehicle.segment, vehicle.seats,
                    vehicle.priceEuro, vehicle.date
                  ]);
                });
                
                stmt.finalize();
                console.log(`Imported ${results.length} vehicles from CSV`);
              } catch (error) {
                console.error('Error importing CSV data:', error);
              }
            });
        }
      }
    });
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

// Import data on startup
setTimeout(importCSVData, 1000);

// Helper function to build WHERE clause
const buildWhereClause = (search, columnFilters) => {
  const conditions = [];
  const params = [];
  
  if (search) {
    conditions.push(`(
      brand LIKE ? OR 
      model LIKE ? OR 
      bodyStyle LIKE ? OR 
      powerTrain LIKE ? OR 
      plugType LIKE ? OR 
      segment LIKE ?
    )`);
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam, searchParam, searchParam, searchParam);
  }
  
  if (columnFilters) {
    Object.keys(columnFilters).forEach(field => {
      const filter = columnFilters[field];
      if (filter && filter.value) {
        switch (filter.type) {
          case 'equals':
            conditions.push(`${field} = ?`);
            params.push(filter.value);
            break;
          case 'contains':
            conditions.push(`${field} LIKE ?`);
            params.push(`%${filter.value}%`);
            break;
          case 'startsWith':
            conditions.push(`${field} LIKE ?`);
            params.push(`${filter.value}%`);
            break;
          case 'endsWith':
            conditions.push(`${field} LIKE ?`);
            params.push(`%${filter.value}`);
            break;
          case 'isEmpty':
            conditions.push(`(${field} IS NULL OR ${field} = '')`);
            break;
        }
      }
    });
  }
  
  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
};

// Routes

// Get all vehicles with pagination, search, and filtering
app.get('/api/vehicles', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const sortField = req.query.sortField || 'brand';
    const sortDirection = req.query.sortDirection || 'asc';
    const columnFilters = req.query.columnFilters ? JSON.parse(req.query.columnFilters) : {};
    
    const { whereClause, params } = buildWhereClause(search, columnFilters);
    const offset = (page - 1) * limit;
    
    // Get total count
    db.get(`SELECT COUNT(*) as total FROM vehicles ${whereClause}`, params, (err, countRow) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      const total = countRow.total;
      
      // Get paginated results
      const dataQuery = `
        SELECT * FROM vehicles 
        ${whereClause}
        ORDER BY ${sortField} ${sortDirection.toUpperCase()}
        LIMIT ? OFFSET ?
      `;
      
      db.all(dataQuery, [...params, limit, offset], (err, vehicles) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        
        res.json({
          vehicles,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single vehicle
app.get('/api/vehicles/:id', (req, res) => {
  try {
    db.get('SELECT * FROM vehicles WHERE id = ?', [req.params.id], (err, vehicle) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      res.json(vehicle);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new vehicle
app.post('/api/vehicles', (req, res) => {
  try {
    const {
      brand, model, accelSec, topSpeedKmH, rangeKm, efficiencyWhKm,
      fastChargeKmH, rapidCharge, powerTrain, plugType, bodyStyle,
      segment, seats, priceEuro, date
    } = req.body;
    
    const stmt = db.prepare(`INSERT INTO vehicles (
      brand, model, accelSec, topSpeedKmH, rangeKm, efficiencyWhKm,
      fastChargeKmH, rapidCharge, powerTrain, plugType, bodyStyle,
      segment, seats, priceEuro, date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    stmt.run([
      brand, model, accelSec, topSpeedKmH, rangeKm, efficiencyWhKm,
      fastChargeKmH, rapidCharge, powerTrain, plugType, bodyStyle,
      segment, seats, priceEuro, date
    ], function(err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      // Get the created vehicle
      db.get('SELECT * FROM vehicles WHERE id = ?', [this.lastID], (err, vehicle) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        res.status(201).json(vehicle);
      });
    });
    
    stmt.finalize();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update vehicle
app.put('/api/vehicles/:id', (req, res) => {
  try {
    const {
      brand, model, accelSec, topSpeedKmH, rangeKm, efficiencyWhKm,
      fastChargeKmH, rapidCharge, powerTrain, plugType, bodyStyle,
      segment, seats, priceEuro, date
    } = req.body;
    
    const stmt = db.prepare(`UPDATE vehicles SET
      brand = ?, model = ?, accelSec = ?, topSpeedKmH = ?, rangeKm = ?,
      efficiencyWhKm = ?, fastChargeKmH = ?, rapidCharge = ?, powerTrain = ?,
      plugType = ?, bodyStyle = ?, segment = ?, seats = ?, priceEuro = ?,
      date = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?`);
    
    stmt.run([
      brand, model, accelSec, topSpeedKmH, rangeKm, efficiencyWhKm,
      fastChargeKmH, rapidCharge, powerTrain, plugType, bodyStyle,
      segment, seats, priceEuro, date, req.params.id
    ], function(err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      // Get the updated vehicle
      db.get('SELECT * FROM vehicles WHERE id = ?', [req.params.id], (err, vehicle) => {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        res.json(vehicle);
      });
    });
    
    stmt.finalize();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete vehicle
app.delete('/api/vehicles/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM vehicles WHERE id = ?');
    
    stmt.run([req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      
      res.json({ message: 'Vehicle deleted successfully' });
    });
    
    stmt.finalize();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unique values for filter dropdowns
app.get('/api/vehicles/filters/:field', (req, res) => {
  try {
    const field = req.params.field;
    const allowedFields = ['brand', 'bodyStyle', 'powerTrain', 'plugType', 'segment', 'rapidCharge'];
    
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field' });
    }
    
    db.all(`SELECT DISTINCT ${field} FROM vehicles WHERE ${field} IS NOT NULL AND ${field} != '' ORDER BY ${field}`, (err, rows) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      
      const values = rows.map(row => row[field]);
      res.json(values);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});