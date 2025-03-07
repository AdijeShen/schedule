import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Label as LabelIcon } from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { getTimeBlocksByDate, updateTimeBlocks, getTimeBlockLabels, addTimeBlockLabel, deleteTimeBlockLabel } from '../services/timeBlockService';

const BLOCKS_PER_HOUR = 4; // 15分钟一个时间块
const HOURS_PER_DAY = 24;
const TOTAL_BLOCKS = BLOCKS_PER_HOUR * HOURS_PER_DAY;

function TimeBlockGrid({ date }) {
  const [timeBlocks, setTimeBlocks] = useState(Array(TOTAL_BLOCKS).fill(null));
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [labels, setLabels] = useState([]);
  const [openLabelDialog, setOpenLabelDialog] = useState(false);
  const [newLabel, setNewLabel] = useState({ name: '', color: '#000000' });

  useEffect(() => {
    loadTimeBlocks();
    loadLabels();
  }, [date]);

  const loadTimeBlocks = async () => {
    const blocks = await getTimeBlocksByDate(date);
    setTimeBlocks(blocks.length ? blocks : Array(TOTAL_BLOCKS).fill(null));
  };

  const loadLabels = async () => {
    const allLabels = await getTimeBlockLabels();
    setLabels(allLabels);
  };

  const handleBlockClick = (index) => {
    setSelectedBlock(index);
  };

  const handleLabelSelect = async (label) => {
    if (selectedBlock !== null) {
      const newBlocks = [...timeBlocks];
      newBlocks[selectedBlock] = label;
      setTimeBlocks(newBlocks);
      await updateTimeBlocks(date, newBlocks);
      setSelectedBlock(null);
    }
  };

  const handleAddLabel = async () => {
    await addTimeBlockLabel(newLabel);
    setNewLabel({ name: '', color: '#000000' });
    setOpenLabelDialog(false);
    loadLabels();
  };

  const formatTime = (blockIndex) => {
    const hour = Math.floor(blockIndex / BLOCKS_PER_HOUR);
    const minute = (blockIndex % BLOCKS_PER_HOUR) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">时间块</Typography>
        <IconButton onClick={() => setOpenLabelDialog(true)}>
          <AddIcon />
        </IconButton>
      </Box>

      <Grid container spacing={0.5}>
        {timeBlocks.map((block, index) => (
          <Grid item xs={1} key={index}>
            <Tooltip title={formatTime(index)}>
              <Paper
                sx={{
                  height: 20,
                  backgroundColor: block?.color || '#f5f5f5',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 },
                  border: selectedBlock === index ? '2px solid #000' : 'none'
                }}
                onClick={() => handleBlockClick(index)}
              />
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      {selectedBlock !== null && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography gutterBottom>
            选择标签 ({formatTime(selectedBlock)})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {labels.map((label) => (
              <Chip
                key={label.id}
                label={label.name}
                onClick={() => handleLabelSelect(label)}
                sx={{ backgroundColor: label.color, color: 'white' }}
              />
            ))}
          </Box>
        </Paper>
      )}

      <Dialog open={openLabelDialog} onClose={() => setOpenLabelDialog(false)}>
        <DialogTitle>添加新标签</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="标签名称"
              value={newLabel.name}
              onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
              fullWidth
            />
            <Typography gutterBottom>选择颜色</Typography>
            <ChromePicker
              color={newLabel.color}
              onChange={(color) => setNewLabel({ ...newLabel, color: color.hex })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLabelDialog(false)}>取消</Button>
          <Button
            onClick={handleAddLabel}
            variant="contained"
            disabled={!newLabel.name}
          >
            添加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TimeBlockGrid;