import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Box, Container, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { ListAlt, ViewModule, CalendarMonth, AccessTime, Notifications } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import RequestToast from './components/RequestToast';

// 导入页面组件
import TaskList from './pages/TaskList';
import QuadrantView from './pages/QuadrantView';
import CalendarView from './pages/CalendarView';
import TimeBlockView from './pages/TimeBlockView';
import ReminderView from './pages/ReminderView';

function App() {
  const [value, setValue] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  // 监听窗口大小变化以响应式调整布局
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RequestToast />
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 2 }}>
        <Routes>
          <Route path="/" element={<TaskList />} />
          <Route path="/quadrant" element={<QuadrantView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/timeblock" element={<TimeBlockView />} />
          <Route path="/reminder" element={<ReminderView />} />
        </Routes>
      </Box>

      <Paper sx={{ position: 'sticky', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction 
            component={Link} 
            to="/" 
            label="任务列表" 
            icon={<ListAlt />} 
          />
          <BottomNavigationAction 
            component={Link} 
            to="/quadrant" 
            label="四象限" 
            icon={<ViewModule />} 
          />
          <BottomNavigationAction 
            component={Link} 
            to="/calendar" 
            label="日历" 
            icon={<CalendarMonth />} 
          />
          <BottomNavigationAction 
            component={Link} 
            to="/timeblock" 
            label="时间块" 
            icon={<AccessTime />} 
          />
          <BottomNavigationAction 
            component={Link} 
            to="/reminder" 
            label="提醒" 
            icon={<Notifications />} 
          />
        </BottomNavigation>
      </Paper>
    </Container>
  );
}

export default App;