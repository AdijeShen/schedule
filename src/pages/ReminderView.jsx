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
  TextField
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getAllReminders, addReminder, updateReminder, deleteReminder } from '../services/reminderService';
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

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const allReminders = await getAllReminders();
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
      loadReminders();
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
    loadReminders();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        提醒
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
                  <Typography variant="body2" color="text.secondary">
                    提醒时间: {new Date(reminder.remindTime).toLocaleString()}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
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
    </Box>
  );
}

export default ReminderView;