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
  Chip,
  Drawer,
  ListItemButton,
  ListItemIcon
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, FileUpload as FileUploadIcon, FileDownload as FileDownloadIcon, CheckCircle as CheckCircleIcon, RadioButtonUnchecked as RadioButtonUncheckedIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { getAllTasks, addTask, updateTask, deleteTask, TaskType, TaskTypeColors, TaskTypeNames } from '../services/taskService';
import { exportTasksToCSV, importTasksFromCSV } from '../services/csvService';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('dueDate');
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('pending');
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

  const sortTasks = (taskList) => {
    const sortedTasks = [...taskList].sort((a, b) => {
      // 首先按完成状态排序
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      // 然后按选择的方式排序
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'startTime':
          return new Date(a.startTime) - new Date(b.startTime);
        case 'type':
          const typeOrder = {
            [TaskType.URGENT_IMPORTANT]: 0,
            [TaskType.URGENT_NOT_IMPORTANT]: 1,
            [TaskType.NOT_URGENT_IMPORTANT]: 2,
            [TaskType.NOT_URGENT_NOT_IMPORTANT]: 3
          };
          return typeOrder[a.type] - typeOrder[b.type];
        case 'createdAt':
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });
    setTasks(sortedTasks);
  };

  const handleSubmit = async () => {
    const taskData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startTime: formData.startTime.toISOString(),
      dueDate: formData.dueDate.toISOString(),
      status: editTask ? editTask.status : 'pending'
    };

    if (editTask) {
      await updateTask(editTask.id, taskData);
    } else {
      await addTask(taskData);
    }

    handleClose();
    loadTasks();
  };

  const handleToggleStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateTask(taskId, { status: newStatus });
    loadTasks();
  };

  const filteredTasks = tasks.filter(task => task.status === selectedStatus);

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          height: '100%',
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%'
          }
        }}
      >
        <Box sx={{ overflow: 'auto', mt: 2, height: '100%' }}>
          <List>
            <ListItemButton
              selected={selectedStatus === 'pending'}
              onClick={() => setSelectedStatus('pending')}
            >
              <ListItemIcon>
                <RadioButtonUncheckedIcon />
              </ListItemIcon>
              <ListItemText primary="未完成任务" />
            </ListItemButton>
            <ListItemButton
              selected={selectedStatus === 'completed'}
              onClick={() => setSelectedStatus('completed')}
            >
              <ListItemIcon>
                <CheckCircleIcon />
              </ListItemIcon>
              <ListItemText primary="已完成任务" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">任务列表</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>排序方式</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  sortTasks([...tasks]);
                }}
                label="排序方式"
                size="small"
              >
                <MenuItem value="dueDate">按截止日期</MenuItem>
                <MenuItem value="startTime">按开始日期</MenuItem>
                <MenuItem value="type">按紧急程度</MenuItem>
                <MenuItem value="createdAt">按创建时间</MenuItem>
              </Select>
            </FormControl>
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
        </Box>

        <List>
          {filteredTasks.map((task) => (
            <ListItem
              key={task.id}
              sx={{
                backgroundColor: task.status === 'completed' ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                '& .MuiListItemText-primary': {
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  color: task.status === 'completed' ? 'text.secondary' : 'text.primary'
                }
              }}
              secondaryAction={
                <Box>
                  <Button
                    onClick={() => handleToggleStatus(task.id, task.status)}
                    sx={{ mr: 1 }}
                  >
                    {task.status === 'completed' ? '标记未完成' : '标记完成'}
                  </Button>
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box component="div" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {task.description}
                    </Box>
                    <Box component="div" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      开始时间: {new Date(task.startTime).toLocaleString()}
                    </Box>
                    <Box component="div" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      截止时间: {new Date(task.dueDate).toLocaleString()}
                    </Box>
                  </Box>
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
    </Box>
  );
}

export default TaskList;