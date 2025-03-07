import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Chip } from '@mui/material';
import { getAllTasks, TaskType, TaskTypeColors, TaskTypeNames } from '../services/taskService';

function QuadrantView() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const allTasks = await getAllTasks();
    setTasks(allTasks);
  };

  const getQuadrantTasks = (type) => {
    return tasks.filter(task => task.type === type);
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
          sx={{
            backgroundColor: TaskTypeColors[type],
            color: 'white',
            '& .MuiChip-label': { whiteSpace: 'normal' }
          }}
          title={`${task.description}\n截止日期: ${new Date(task.dueDate).toLocaleDateString()}`}
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
    </Box>
  );
}

export default QuadrantView;