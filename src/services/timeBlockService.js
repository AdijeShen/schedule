import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';

// 初始化时间块存储
localforage.config({
  name: 'task-planner',
  storeName: 'time-blocks'
});

const API_BASE_URL = 'http://localhost:3001/api';

// 获取指定日期的时间块
export const getTimeBlocksByDate = async (date) => {
  try {
    const dateString = new Date(date).toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/time-blocks/date/${dateString}`);
    if (!response.ok) throw new Error('获取时间块失败');
    const blocks = await response.json();
    return blocks;
  } catch (error) {
    console.error('获取时间块失败:', error);
    return Array(96).fill({ status: null, note: '' });
  }
};

// 更新时间块备注
export const updateTimeBlockNote = async (date, blockIndex, note) => {
  try {
    const dateString = new Date(date).toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/time-blocks/date/${dateString}/block/${blockIndex}/note`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ note })
    });
    if (!response.ok) throw new Error('更新时间块备注失败');
    return true;
  } catch (error) {
    console.error('更新时间块备注失败:', error);
    throw error;
  }
};

// 获取所有日期的时间块统计
export const getAllTimeBlockStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/time-blocks/stats`);
    if (!response.ok) throw new Error('获取时间块统计失败');
    return await response.json();
  } catch (error) {
    console.error('获取时间块统计失败:', error);
    return {};
  }
};

// 更新指定日期的时间块
export const updateTimeBlocks = async (date, blocks) => {
  try {
    const dateString = new Date(date).toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/time-blocks/date/${dateString}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(blocks)
    });
    if (!response.ok) throw new Error('更新时间块失败');
    return true;
  } catch (error) {
    console.error('更新时间块失败:', error);
    throw error;
  }
};

// 获取所有时间块标签
export const getTimeBlockLabels = async () => {
  try {
    const labels = await localforage.getItem('time-block-labels');
    return labels || [];
  } catch (error) {
    console.error('获取时间块标签失败:', error);
    return [];
  }
};

// 添加时间块标签
export const addTimeBlockLabel = async (label) => {
  try {
    const labels = await getTimeBlockLabels();
    const newLabel = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...label
    };
    labels.push(newLabel);
    await localforage.setItem('time-block-labels', labels);
    return newLabel;
  } catch (error) {
    console.error('添加时间块标签失败:', error);
    throw error;
  }
};

// 删除时间块标签
export const deleteTimeBlockLabel = async (labelId) => {
  try {
    const labels = await getTimeBlockLabels();
    const filteredLabels = labels.filter(label => label.id !== labelId);
    await localforage.setItem('time-block-labels', filteredLabels);
    return true;
  } catch (error) {
    console.error('删除时间块标签失败:', error);
    throw error;
  }
};