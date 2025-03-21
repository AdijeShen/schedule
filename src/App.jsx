import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Box, Container, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { ListAlt, ViewModule, CalendarMonth, AccessTime, Notifications } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import RequestToast from './components/RequestToast';
import LoginRegister from './pages/LoginRegister';
import AppHeader from './components/AppHeader';
import { initReminderManager, cleanupReminderManager } from './services/reminderManager';
import { logEnvironment } from './utils/env';

// 导入页面组件
import TaskList from './pages/TaskList';
import QuadrantView from './pages/QuadrantView';
import CalendarView from './pages/CalendarView';
import TimeBlockView from './pages/TimeBlockView';
import ReminderView from './pages/ReminderView';

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const [value, setValue] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const location = useLocation();

  // 监听窗口大小变化以响应式调整布局
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 初始化环境
  useEffect(() => {
    logEnvironment();
  }, []);

  // 初始化提醒管理器
  useEffect(() => {
    // 只有在用户已登录的情况下初始化提醒管理器
    const token = localStorage.getItem('token');
    if (token) {
      console.log('初始化提醒管理器...');
      initReminderManager().catch(err => {
        console.error('初始化提醒管理器失败:', err);
      });
    }

    // 组件卸载时清理
    return () => {
      console.log('清理提醒管理器...');
      cleanupReminderManager();
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RequestToast />
      <AppHeader />
      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 2 }}>
        <Routes>
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/" element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          } />
          <Route path="/quadrant" element={
            <ProtectedRoute>
              <QuadrantView />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <CalendarView />
            </ProtectedRoute>
          } />
          <Route path="/timeblock" element={
            <ProtectedRoute>
              <TimeBlockView />
            </ProtectedRoute>
          } />
          <Route path="/reminder" element={
            <ProtectedRoute>
              <ReminderView />
            </ProtectedRoute>
          } />
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