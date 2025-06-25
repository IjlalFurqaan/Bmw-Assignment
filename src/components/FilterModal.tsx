import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Stack,
  IconButton,
  Typography,
} from '@mui/material';
import { X, Plus } from 'lucide-react';
import { GridColumn } from './GenericDataGrid';

interface FilterRule {
  field: string;
  type: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'isEmpty';
  value: string;
}

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  columns: GridColumn[];
  onApplyFilters: (filters: Record<string, any>) => void;
  currentFilters: Record<string, any>;
}

const FilterModal: React.FC<FilterModalProps> = ({
  open,
  onClose,
  columns,
  onApplyFilters,
  currentFilters,
}) => {
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);

  useEffect(() => {
    
    if (open) {
      // Convert current filters to filter rules
      const rules: FilterRule[] = Object.entries(currentFilters).map(([field, filter]) => ({
        field,
        type: filter.type,
        value: filter.value,
      }));
      setFilterRules(rules.length > 0 ? rules : [{ field: '', type: 'contains', value: '' }]);
    }
  }, [open, currentFilters]);

  const filterTypes = [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'isEmpty', label: 'Is Empty' },
  ];

  const handleAddRule = () => {
    setFilterRules([...filterRules, { field: '', type: 'contains', value: '' }]);
  };

  const handleRemoveRule = (index: number) => {
    setFilterRules(filterRules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index: number, key: keyof FilterRule, value: string) => {
    const updatedRules = [...filterRules];
    updatedRules[index] = { ...updatedRules[index], [key]: value };
    setFilterRules(updatedRules);
  };

  const handleApply = () => {
    const filters: Record<string, any> = {};
    
    filterRules.forEach(rule => {
      if (rule.field && (rule.value || rule.type === 'isEmpty')) {
        filters[rule.field] = {
          type: rule.type,
          value: rule.value,
        };
      }
    });
    
    onApplyFilters(filters);
  };

  const handleClear = () => {
    setFilterRules([{ field: '', type: 'contains', value: '' }]);
    onApplyFilters({});
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Filter Data</Typography>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {filterRules.map((rule, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Field</InputLabel>
                <Select
                  value={rule.field}
                  label="Field"
                  onChange={(e) => handleRuleChange(index, 'field', e.target.value)}
                >
                  {columns.map(col => (
                    <MenuItem key={col.field} value={col.field}>
                      {col.headerName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={rule.type}
                  label="Condition"
                  onChange={(e) => handleRuleChange(index, 'type', e.target.value as any)}
                >
                  {filterTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {rule.type !== 'isEmpty' && (
                <TextField
                  size="small"
                  label="Value"
                  value={rule.value}
                  onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
              )}
              
              <IconButton
                onClick={() => handleRemoveRule(index)}
                disabled={filterRules.length === 1}
                size="small"
                color="error"
              >
                <X size={18} />
              </IconButton>
            </Box>
          ))}
          
          <Button
            startIcon={<Plus size={18} />}
            onClick={handleAddRule}
            variant="outlined"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Filter Rule
          </Button>
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClear} color="secondary">
          Clear All
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleApply} variant="contained">
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterModal;