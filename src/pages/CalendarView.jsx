import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { getTasksByDate, TaskTypeColors } from '../services/taskService';

function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, [selectedDate]);

  const loadTasks = async () => {
    const dayTasks = await getTasksByDate(selectedDate);
    setTasks(dayTasks);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        日历视图
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
            <DateCalendar
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>
            {selectedDate.format('YYYY年MM月DD日')}的任务
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {tasks.length === 0 ? (
              <Typography color="text.secondary">暂无任务</Typography>
            ) : (
              tasks.map((task) => (
                <Chip
                  key={task.id}
                  label={task.title}
                  sx={{
                    backgroundColor: TaskTypeColors[task.type],
                    color: 'white',
                    '& .MuiChip-label': { whiteSpace: 'normal' }
                  }}
                  title={task.description}
                />
              ))
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default CalendarView;