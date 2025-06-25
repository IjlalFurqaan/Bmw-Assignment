import React from 'react';
import { IconButton, Stack, Tooltip } from '@mui/material';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface ActionsCellRendererProps {
  data: any;
  onView?: (data: any) => void;
  onEdit?: (data: any) => void;
  onDelete?: (data: any) => void;
}

const ActionsCellRenderer: React.FC<ActionsCellRendererProps> = ({
  data,
  onView,
  onEdit,
  onDelete,
}) => {
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) onView(data);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(data);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(data);
  };

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {onView && (
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={handleView}
            sx={{ 
              color: 'primary.main',
              '&:hover': { backgroundColor: 'primary.lighter' }
            }}
          >
            <Eye size={16} />
          </IconButton>
        </Tooltip>
      )}
      
      {onEdit && (
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={handleEdit}
            sx={{ 
              color: 'secondary.main',
              '&:hover': { backgroundColor: 'secondary.lighter' }
            }}
          >
            <Edit size={16} />
          </IconButton>
        </Tooltip>
      )}
      
      {onDelete && (
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={handleDelete}
            sx={{ 
              color: 'error.main',
              '&:hover': { backgroundColor: 'error.lighter' }
            }}
          >
            <Trash2 size={16} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
};

export default ActionsCellRenderer;