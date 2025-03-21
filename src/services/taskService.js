import { v4 as uuidv4 } from 'uuid';
import { API_URL } from '../utils/env';

// 任务类型枚举
export const TaskType = {
  URGENT_IMPORTANT: 'urgent_important',
  URGENT_NOT_IMPORTANT: 'urgent_not_important',
  NOT_URGENT_IMPORTANT: 'not_urgent_important',
  NOT_URGENT_NOT_IMPORTANT: 'not_urgent_not_important'
};

// 任务类型对应的颜色
export const TaskTypeColors = {
  [TaskType.URGENT_IMPORTANT]: '#d32f2f', // 红色 - 紧急且重要
  [TaskType.URGENT_NOT_IMPORTANT]: '#f57c00', // 橙色 - 紧急不重要
  [TaskType.NOT_URGENT_IMPORTANT]: '#0288d1', // 蓝色 - 重要不紧急
  [TaskType.NOT_URGENT_NOT_IMPORTANT]: '#388e3c' // 绿色 - 不紧急不重要
};

// 任务类型对应的中文名称
export const TaskTypeNames = {
  [TaskType.URGENT_IMPORTANT]: '紧急且重要',
  [TaskType.URGENT_NOT_IMPORTANT]: '紧急不重要',
  [TaskType.NOT_URGENT_IMPORTANT]: '重要不紧急',
  [TaskType.NOT_URGENT_NOT_IMPORTANT]: '不紧急不重要'
};

export const API_BASE_URL = API_URL;

// 获取认证头部
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// 获取所有任务
export const getAllTasks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('未登录或登录已过期');
      }
      throw new Error('获取任务失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取任务失败:', error);
    throw error;
  }
};

// 添加新任务
export const addTask = async (task) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...task,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      })
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('未登录或登录已过期');
      }
      throw new Error('添加任务失败');
    }
    return await response.json();
  } catch (error) {
    console.error('添加任务失败:', error);
    throw error;
  }
};

// 更新任务
export const updateTask = async (taskId, updatedData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedData)
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('未登录或登录已过期');
      }
      throw new Error('更新任务失败');
    }
    return await response.json();
  } catch (error) {
    console.error('更新任务失败:', error);
    throw error;
  }
};

// 删除任务
export const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok && response.status !== 204) {
      if (response.status === 401) {
        throw new Error('未登录或登录已过期');
      }
      throw new Error('删除任务失败');
    }
    return true;
  } catch (error) {
    console.error('删除任务失败:', error);
    throw error;
  }
};

// 按日期获取任务
export const getTasksByDate = async (date) => {
  try {
    const allTasks = await getAllTasks();
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    return allTasks.filter(task => {
      // 获取任务的开始时间和截止时间
      const taskStartDate = new Date(task.startTime);
      const taskDueDate = new Date(task.dueDate);
      
      // 设置时间为 00:00:00 以便于日期比较
      taskStartDate.setHours(0, 0, 0, 0);
      taskDueDate.setHours(0, 0, 0, 0);
      
      // 如果所选日期在任务的开始日期和截止日期之间（包括开始日期和截止日期当天），则返回 true
      return (
        (taskStartDate.getTime() <= selectedDate.getTime() && selectedDate.getTime() <= taskDueDate.getTime())
      );
    });
  } catch (error) {
    console.error('按日期获取任务失败:', error);
    throw error;
  }
};