import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface VehicleParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  columnFilters?: Record<string, any>;
}

export interface VehicleResponse {
  vehicles: any[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export const vehicleService = {
  async getVehicles(params: VehicleParams = {}): Promise<VehicleResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params.columnFilters) queryParams.append('columnFilters', JSON.stringify(params.columnFilters));

    const response = await api.get(`/vehicles?${queryParams.toString()}`);
    return response.data;
  },

  async getVehicle(id: string): Promise<any> {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  async createVehicle(vehicleData: any): Promise<any> {
    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  },

  async updateVehicle(id: string, vehicleData: any): Promise<any> {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  async deleteVehicle(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },

  async getFilterValues(field: string): Promise<string[]> {
    const response = await api.get(`/vehicles/filters/${field}`);
    return response.data;
  },
};