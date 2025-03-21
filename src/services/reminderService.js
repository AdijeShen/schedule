const API_BASE_URL = 'http://localhost:3001/api';

// 获取认证头
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// 获取所有提醒
export const getAllReminders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reminders`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('获取提醒列表失败');
    return await response.json();
  } catch (error) {
    console.error('获取提醒列表失败:', error);
    return [];
  }
};

// 添加提醒
export const addReminder = async (reminder) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reminders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminder)
    });
    if (!response.ok) throw new Error('添加提醒失败');
    return await response.json();
  } catch (error) {
    console.error('添加提醒失败:', error);
    throw error;
  }
};

// 更新提醒
export const updateReminder = async (id, reminder) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reminder)
    });
    if (!response.ok) throw new Error('更新提醒失败');
    return await response.json();
  } catch (error) {
    console.error('更新提醒失败:', error);
    throw error;
  }
};

// 删除提醒
export const deleteReminder = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reminders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('删除提醒失败');
    return true;
  } catch (error) {
    console.error('删除提醒失败:', error);
    throw error;
  }
};