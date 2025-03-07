import React, { useState, useEffect } from 'react';
import {
  Box,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, FileUpload as FileUploadIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { getAllTasks, addTask, updateTask, deleteTask, TaskType, TaskTypeColors, TaskTypeNames } from '../services/taskService';
import { exportTasksToCSV, importTasksFromCSV } from '../services/csvService';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: TaskType.NOT_URGENT_NOT_IMPORTANT,
    startTime: dayjs(),
    dueDate: dayjs()
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const allTasks = await getAllTasks();
    setTasks(allTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTask(null);
    setFormData({
      title: '',
      description: '',
      type: TaskType.NOT_URGENT_NOT_IMPORTANT,
      startTime: dayjs(),
      dueDate: dayjs()
    });
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      type: task.type,
      startTime: dayjs(task.startTime || new Date()),
      dueDate: dayjs(task.dueDate)
    });
    setOpen(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      await deleteTask(taskId);
      loadTasks();
    }
  };

  const handleSubmit = async () => {
    const taskData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startTime: formData.startTime.toISOString(),
      dueDate: formData.dueDate.toISOString()
    };

    if (editTask) {
      await updateTask(editTask.id, taskData);
    } else {
      await addTask(taskData);
    }

    handleClose();
    loadTasks();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">任务列表</Typography>
        <Box>
          <input
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file-input"
            onChange={async (e) => {
              if (e.target.files?.length) {
                await importTasksFromCSV(e.target.files[0]);
                loadTasks();
                e.target.value = '';
              }
            }}
          />
          <Button
            startIcon={<FileUploadIcon />}
            onClick={() => document.getElementById('csv-file-input').click()}
          >
            导入
          </Button>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={exportTasksToCSV}
          >
            导出
          </Button>
        </Box>
      </Box>

      <List>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            secondaryAction={
              <Box>
                <IconButton edge="end" onClick={() => handleEdit(task)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(task.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>{task.title}</Typography>
                  <Chip
                    label={TaskTypeNames[task.type]}
                    size="small"
                    sx={{ backgroundColor: TaskTypeColors[task.type], color: 'white' }}
                  />
                </Box>
              }
              secondary={
                <React.Fragment>
                  <Typography variant="body2" color="text.secondary">
                    {task.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    开始时间: {new Date(task.startTime).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    截止时间: {new Date(task.dueDate).toLocaleString()}
                  </Typography>
                </React.Fragment>
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
        <DialogTitle>{editTask ? '编辑任务' : '新建任务'}</DialogTitle>
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
              label="描述"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>任务类型</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="任务类型"
              >
                {Object.entries(TaskTypeNames).map(([type, name]) => (
                  <MenuItem key={type} value={type}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
              <DatePicker
                label="开始时间"
                value={formData.startTime}
                onChange={(newValue) => setFormData({ ...formData, startTime: newValue })}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="截止时间"
                value={formData.dueDate}
                onChange={(newValue) => setFormData({ ...formData, dueDate: newValue })}
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

export default TaskList;