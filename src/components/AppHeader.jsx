import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

const AppHeader = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePasswordDialogOpen = () => {
    setOpenPasswordDialog(true);
    handleClose();
  };

  const handlePasswordDialogClose = () => {
    setOpenPasswordDialog(false);
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
  };

  const handlePasswordChange = async () => {
    // 验证新密码
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('新密码与确认密码不匹配');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '修改密码失败');
      }

      handlePasswordDialogClose();
      handleLogout(); // 修改密码后退出登录
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            任务规划器
          </Typography>
          <div>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
              <Typography variant="body1" sx={{ ml: 1 }}>
                {user.username}
              </Typography>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handlePasswordDialogOpen}>修改密码</MenuItem>
              <MenuItem onClick={handleLogout}>退出登录</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Dialog open={openPasswordDialog} onClose={handlePasswordDialogClose}>
        <DialogTitle>修改密码</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="当前密码"
              type="password"
              fullWidth
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
            />
            <TextField
              label="新密码"
              type="password"
              fullWidth
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <TextField
              label="确认新密码"
              type="password"
              fullWidth
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose}>取消</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AppHeader;