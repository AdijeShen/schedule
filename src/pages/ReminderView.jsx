import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { getAllReminders, addReminder, updateReminder, deleteReminder } from '../services/reminderService';
import { initReminderManager, refreshReminders } from '../services/reminderManager';
import { requestNotificationPermission, getNotificationPermission } from '../services/notificationService';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

function ReminderView() {
  const [reminders, setReminders] = useState([]);
  const [open, setOpen] = useState(false);
  const [editReminder, setEditReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    remindTime: dayjs()
  });
  const [notificationStatus, setNotificationStatus] = useState({
    permission: 'default',
    showAlert: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    loadReminders();
    checkNotificationPermission();
    initReminderManager().then(hasPermission => {
      if (!hasPermission) {
        setNotificationStatus(prev => ({
          ...prev,
          showAlert: true,
          message: '请启用通知权限以接收提醒',
          severity: 'warning'
        }));
      }
    });
  }, []);

  const checkNotificationPermission = () => {
    const permission = getNotificationPermission();
    setNotificationStatus(prev => ({
      ...prev,
      permission
    }));
    return permission === 'granted';
  };

  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationStatus(prev => ({
        ...prev,
        permission: 'granted',
        showAlert: true,
        message: '通知权限已获取，您可以接收提醒了',
        severity: 'success'
      }));
    } else {
      setNotificationStatus(prev => ({
        ...prev,
        showAlert: true,
        message: '获取通知权限失败，请在浏览器设置中允许通知',
        severity: 'error'
      }));
    }
  };

  const loadReminders = async () => {
    const allReminders = await getAllReminders();
    // 按时间排序，将最近的提醒放在前面
    allReminders.sort((a, b) => new Date(a.remindTime) - new Date(b.remindTime));
    setReminders(allReminders);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditReminder(null);
    setFormData({
      title: '',
      content: '',
      remindTime: dayjs()
    });
  };

  const handleEdit = (reminder) => {
    setEditReminder(reminder);
    setFormData({
      title: reminder.title,
      content: reminder.content,
      remindTime: dayjs(reminder.remindTime)
    });
    setOpen(true);
  };

  const handleDelete = async (reminderId) => {
    if (window.confirm('确定要删除这个提醒吗？')) {
      await deleteReminder(reminderId);
      await loadReminders();
      await refreshReminders(); // 刷新提醒管理器
    }
  };

  const handleSubmit = async () => {
    const reminderData = {
      title: formData.title,
      content: formData.content,
      remindTime: formData.remindTime.toISOString()
    };

    if (editReminder) {
      await updateReminder(editReminder.id, reminderData);
    } else {
      await addReminder(reminderData);
    }

    handleClose();
    await loadReminders();
    await refreshReminders(); // 刷新提醒管理器

    // 检查提醒时间是否过近，提示用户
    const timeToReminder = formData.remindTime.diff(dayjs(), 'minute');
    if (timeToReminder < 5 && timeToReminder > 0) {
      setNotificationStatus(prev => ({
        ...prev,
        showAlert: true,
        message: `提醒将在${timeToReminder}分钟后触发`,
        severity: 'info'
      }));
    }
  };

  const handleCloseAlert = () => {
    setNotificationStatus(prev => ({
      ...prev,
      showAlert: false
    }));
  };

  // 将日期格式化为相对时间
  const formatRelativeTime = (dateTime) => {
    const now = dayjs();
    const reminderTime = dayjs(dateTime);
    const diff = reminderTime.diff(now, 'minute');
    
    if (diff < 0) {
      return `已过期 (${reminderTime.format('YYYY-MM-DD HH:mm')})`;
    } else if (diff < 60) {
      return `${diff} 分钟后`;
    } else if (diff < 1440) { // 24小时内
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return `${hours} 小时 ${mins} 分钟后`;
    } else {
      return reminderTime.format('YYYY-MM-DD HH:mm');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        提醒
        {notificationStatus.permission !== 'granted' && (
          <Button 
            startIcon={<NotificationsIcon />} 
            variant="outlined" 
            color="warning" 
            size="small" 
            sx={{ ml: 2 }}
            onClick={requestPermission}
          >
            启用通知
          </Button>
        )}
      </Typography>

      <List>
        {reminders.map((reminder) => (
          <ListItem
            key={reminder.id}
            secondaryAction={
              <Box>
                <IconButton edge="end" onClick={() => handleEdit(reminder)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(reminder.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={reminder.title}
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    {reminder.content}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={dayjs(reminder.remindTime).isBefore(dayjs()) ? "error" : "text.secondary"}
                  >
                    提醒时间: {formatRelativeTime(reminder.remindTime)}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
        {reminders.length === 0 && (
          <ListItem>
            <ListItemText primary="暂无提醒" secondary="点击右下角按钮添加" />
          </ListItem>
        )}
      </List>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={handleClickOpen}
      >
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editReminder ? '编辑提醒' : '新建提醒'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="标题"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="内容"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
              <DateTimePicker
                label="提醒时间"
                value={formData.remindTime}
                onChange={(newValue) => setFormData({ ...formData, remindTime: newValue })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.title}>
            确定
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notificationStatus.showAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={notificationStatus.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notificationStatus.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ReminderView;