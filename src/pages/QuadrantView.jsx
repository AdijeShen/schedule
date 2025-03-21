import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { getAllTasks, TaskType, TaskTypeColors, TaskTypeNames } from '../services/taskService';

function QuadrantView() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const allTasks = await getAllTasks();
    setTasks(allTasks.filter(task => task.status !== 'completed'));
  };

  const getQuadrantTasks = (type) => {
    return tasks.filter(task => task.type === type);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDetailDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedTask(null);
  };

  const QuadrantBox = ({ type, title }) => (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        backgroundColor: `${TaskTypeColors[type]}22`,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: TaskTypeColors[type] }}>
        {title}
      </Typography>
      {getQuadrantTasks(type).map((task) => (
        <Chip
          key={task.id}
          label={task.title}
          onClick={() => handleTaskClick(task)}
          sx={{
            backgroundColor: TaskTypeColors[type],
            color: 'white',
            '& .MuiChip-label': { whiteSpace: 'normal' },
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9
            }
          }}
        />
      ))}
    </Paper>
  );

  return (
    <Box sx={{ height: '100%' }}>
      <Typography variant="h5" gutterBottom>
        四象限视图
      </Typography>
      <Grid container spacing={2} sx={{ height: 'calc(100% - 48px)' }}>
        <Grid item xs={12} md={6} sx={{ height: '50%' }}>
          <QuadrantBox
            type={TaskType.URGENT_IMPORTANT}
            title="紧急且重要"
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ height: '50%' }}>
          <QuadrantBox
            type={TaskType.URGENT_NOT_IMPORTANT}
            title="紧急不重要"
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ height: '50%' }}>
          <QuadrantBox
            type={TaskType.NOT_URGENT_IMPORTANT}
            title="重要不紧急"
          />
        </Grid>
        <Grid item xs={12} md={6} sx={{ height: '50%' }}>
          <QuadrantBox
            type={TaskType.NOT_URGENT_NOT_IMPORTANT}
            title="不紧急不重要"
          />
        </Grid>
      </Grid>

      <Dialog open={detailDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>任务详情</DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Typography variant="h6">{selectedTask.title}</Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedTask.description || '暂无描述'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                开始时间: {new Date(selectedTask.startTime).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                截止时间: {new Date(selectedTask.dueDate).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                任务类型: {TaskTypeNames[selectedTask.type]}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default QuadrantView;