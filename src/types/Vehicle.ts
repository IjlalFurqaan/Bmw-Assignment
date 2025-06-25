export interface Vehicle {
  _id: string;
  brand: string;
  model: string;
  accelSec: number;
  topSpeedKmH: number;
  rangeKm: number;
  efficiencyWhKm: number;
  fastChargeKmH: number;
  rapidCharge: 'Yes' | 'No';
  powerTrain: 'RWD' | 'FWD' | 'AWD';
  plugType: string;
  bodyStyle: string;
  segment: string;
  seats: number;
  priceEuro: number;
  date: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleFormData {
  brand: string;
  model: string;
  accelSec: number;
  topSpeedKmH: number;
  rangeKm: number;
  efficiencyWhKm: number;
  fastChargeKmH: number;
  rapidCharge: 'Yes' | 'No';
  powerTrain: 'RWD' | 'FWD' | 'AWD';
  plugType: string;
  bodyStyle: string;
  segment: string;
  seats: number;
  priceEuro: number;
  date: string;
}