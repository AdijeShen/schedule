import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Card, CardContent, Chip } from '@mui/material';
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
    const dayTasks = await getTasksByDate(selectedDate.format('YYYY-MM-DD'));
    setTasks(dayTasks);
  };

  // 判断任务状态
  const getTaskStatus = (task) => {
    const selectedDateObj = selectedDate.toDate();
    selectedDateObj.setHours(0, 0, 0, 0);
    
    const startDate = new Date(task.startTime);
    startDate.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate.getTime() === selectedDateObj.getTime()) {
      return { text: "今日截止", color: "#f44336" };  // 红色表示今天截止
    } else if (startDate.getTime() === selectedDateObj.getTime()) {
      return { text: "今日开始", color: "#4caf50" };  // 绿色表示今天开始
    } else {
      return { text: "进行中", color: "#2196f3" };    // 蓝色表示进行中
    }
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
            {selectedDate.format('YYYY年MM月DD日')}的相关任务
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {tasks.length === 0 ? (
              <Typography color="text.secondary">暂无任务</Typography>
            ) : (
              tasks.map((task) => {
                const taskStatus = getTaskStatus(task);
                return (
                  <Card
                    key={task.id}
                    sx={{
                      backgroundColor: `${TaskTypeColors[task.type]}22`,
                      borderLeft: `4px solid ${TaskTypeColors[task.type]}`
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {task.title}
                        </Typography>
                        <Chip 
                          label={taskStatus.text} 
                          size="small" 
                          sx={{ 
                            backgroundColor: taskStatus.color,
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                        />
                      </Box>
                      {task.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {task.description}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        开始时间: {new Date(task.startTime).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        截止时间: {new Date(task.dueDate).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default CalendarView;