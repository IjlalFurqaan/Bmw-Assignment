import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, ColumnApi, GridReadyEvent } from 'ag-grid-community';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  Alert,
  Toolbar,
  Chip,
  Stack,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search, Filter, RefreshCw, Download } from 'lucide-react';
import ActionsCellRenderer from './ActionsCellRenderer';
import FilterModal from './FilterModal';
import { vehicleService } from '../services/vehicleService';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export interface GridColumn {
  field: string;
  headerName: string;
  width?: number;
  type?: 'text' | 'number' | 'date' | 'boolean';
  sortable?: boolean;
  filter?: boolean;
  resizable?: boolean;
}

interface GenericDataGridProps {
  columns: GridColumn[];
  onView?: (data: any) => void;
  onEdit?: (data: any) => void;
  onDelete?: (data: any) => void;
  title?: string;
}

const GenericDataGrid: React.FC<GenericDataGridProps> = ({
  columns,
  onView,
  onEdit,
  onDelete,
  title = "Data Grid"
}) => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [, setColumnApi] = useState<ColumnApi | null>(null);

  // Column definitions with actions column
  const columnDefs: ColDef[] = useMemo(() => {
    const baseColumns: ColDef[] = columns.map(col => ({
      field: col.field,
      headerName: col.headerName,
      width: col.width || 150,
      sortable: col.sortable !== false,
      filter: col.filter !== false,
      resizable: col.resizable !== false,
      cellRenderer: col.type === 'number' ? 
        (params: any) => params.value?.toLocaleString() : undefined,
    }));

    // Add actions column
    baseColumns.push({
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      cellRenderer: ActionsCellRenderer,
      cellRendererParams: {
        onView,
        onEdit,
        onDelete,
      },
      sortable: false,
      filter: false,
      resizable: false,
      pinned: 'right',
    });

    return baseColumns;
  }, [columns, onView, onEdit, onDelete]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await vehicleService.getVehicles({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        columnFilters: activeFilters,
      });
      
      setRowData(response.vehicles);
      setTotalRecords(response.total);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, activeFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    setColumnApi(params.columnApi);
  };

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleExport = () => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: 'vehicle-data.csv',
      });
    }
  };

  const handleApplyFilters = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    setFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title} ({totalRecords} records)
        </Typography>
        
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          
          <Tooltip title="Filter Data">
            <IconButton 
              onClick={() => setFilterModalOpen(true)}
              color={activeFilterCount > 0 ? 'primary' : 'default'}
            >
              <Filter size={20} />
              {activeFilterCount > 0 && (
                <Chip 
                  label={activeFilterCount} 
                  size="small" 
                  color="primary"
                  sx={{ position: 'absolute', top: -8, right: -8, minWidth: 20, height: 20 }}
                />
              )}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={loading ? "Refreshing..." : "Refresh Data"}>
            <span>
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshCw size={20} />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Export to CSV">
            <IconButton onClick={handleExport}>
              <Download size={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              Active Filters:
            </Typography>
            {Object.entries(activeFilters).map(([field, filter]) => (
              <Chip
                key={field}
                label={`${field}: ${filter.type} "${filter.value}"`}
                size="small"
                onDelete={() => {
                  const newFilters = { ...activeFilters };
                  delete newFilters[field];
                  setActiveFilters(newFilters);
                }}
              />
            ))}
            <Button size="small" onClick={handleClearFilters}>
              Clear All
            </Button>
          </Stack>
        </Box>
      )}

      {/* Data Grid */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1
          }}>
            <CircularProgress />
          </Box>
        )}
        
        <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            onGridReady={onGridReady}
            pagination={true}
            paginationPageSize={pageSize}
            suppressPaginationPanel={true}
            animateRows={true}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            rowSelection="single"
            suppressRowClickSelection={true}
          />
        </div>
      </Box>

      {/* Pagination Info */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalRecords)} - {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <Button 
            size="small" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </Button>
          <Button 
            size="small" 
            disabled={currentPage * pageSize >= totalRecords}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </Stack>
      </Box>

      {/* Filter Modal */}
      <FilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        columns={columns}
        onApplyFilters={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </Paper>
  );
};

export default GenericDataGrid;