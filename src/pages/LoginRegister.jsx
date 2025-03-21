import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Tab,
  Tabs,
  Alert
} from '@mui/material';

const LoginRegister = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = tab === 0 ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '操作失败');
      }

      // 保存token和用户信息
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // 跳转到主页
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            任务规划器
          </Typography>

          <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label="登录" />
            <Tab label="注册" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="用户名"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="密码"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
            />
            {tab === 1 && (
              <TextField
                margin="normal"
                fullWidth
                name="email"
                label="邮箱（选填）"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {tab === 0 ? '登录' : '注册'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginRegister;