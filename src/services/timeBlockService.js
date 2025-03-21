import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';
import { API_URL } from '../utils/env';

// 初始化时间块存储
localforage.config({
  name: 'task-planner',
  storeName: 'time-blocks'
});

const API_BASE_URL = API_URL;

// 获取认证头
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// 获取指定日期的时间块
export const getTimeBlocksByDate = async (date) => {
  try {
    const dateString = new Date(date).toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/time-blocks/date/${dateString}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('获取时间块失败');
    const blocks = await response.json();
    
    // 确保数据按照 blockIndex 排序
    blocks.sort((a, b) => a.blockIndex - b.blockIndex);
    
    // 创建包含96个时间块的完整数组
    const completeBlocks = Array(96).fill().map((_, index) => {
      // 查找当前索引对应的时间块
      const existingBlock = blocks.find(block => block.blockIndex === index);
      
      // 如果找到就返回，否则返回一个默认的空时间块
      return existingBlock ? {
        ...existingBlock,
        color: existingBlock.color || null,
        status: existingBlock.status || null,
        note: existingBlock.note || ''
      } : { 
        blockIndex: index,
        status: null, 
        color: null, 
        note: '' 
      };
    });
    
    return completeBlocks;
  } catch (error) {
    console.error('获取时间块失败:', error);
    return Array(96).fill().map((_, index) => ({ 
      blockIndex: index,
      status: null, 
      color: null, 
      note: '' 
    }));
  }
};

// 更新时间块备注
export const updateTimeBlockNote = async (date, blockIndex, note) => {
  try {
    const dateString = new Date(date).toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/time-blocks/date/${dateString}/block/${blockIndex}/note`, {
      method: 'PUT',
      headers: getAuthHeaders(),
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
    const response = await fetch(`${API_BASE_URL}/time-blocks/stats`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('获取时间块统计失败');
    
    const stats = await response.json();
    
    // 检查是否为空对象
    if (!stats || typeof stats !== 'object' || Object.keys(stats).length === 0) {
      console.log('服务器返回了空的统计数据');
      return {};
    }
    
    // 将状态ID转换为颜色值（兼容旧数据）
    const colorStats = {};
    for (const [date, stat] of Object.entries(stats)) {
      // 如果值为 null 或 undefined，跳过
      if (stat === null || stat === undefined) continue;
      
      // 如果已经是颜色值，则直接使用
      if (typeof stat === 'string' && stat.startsWith('#')) {
        colorStats[date] = stat;
      } 
      // 如果是旧格式的状态ID，则转换为对应的颜色
      else if (typeof stat === 'number') {
        const oldColorMap = {
          0: '#ff4d4f', // 红色
          1: '#faad14', // 黄色
          2: '#52c41a'  // 绿色
        };
        colorStats[date] = oldColorMap[stat] || '#f0f0f0';
      }
      // 如果是带有 mostCommonColor 属性的对象
      else if (typeof stat === 'object' && stat.mostCommonColor) {
        colorStats[date] = stat.mostCommonColor;
      }
      // 其他情况
      else {
        console.warn(`未知的统计数据格式: ${date} => `, stat);
      }
    }
    
    console.log('处理后的颜色统计:', colorStats);
    return colorStats;
  } catch (error) {
    console.error('获取时间块统计失败:', error);
    return {};
  }
};

// 更新指定日期的时间块
export const updateTimeBlocks = async (date, blocks) => {
  try {
    if (!blocks || !Array.isArray(blocks)) {
      console.error('更新时间块失败: 无效的数据，blocks 必须是数组');
      throw new Error('无效的数据格式');
    }

    const dateString = new Date(date).toISOString().split('T')[0];
    
    // 确保保存的数据格式正确，同时保持兼容
    const formattedBlocks = blocks.map(block => ({
      status: block.status === undefined ? null : block.status,
      color: block.color || null,
      note: (block.note || '').toString()
    }));
    
    // 添加数据校验日志
    console.log(`准备提交 ${formattedBlocks.length} 个时间块更新...`);
    
    const response = await fetch(`${API_BASE_URL}/time-blocks/date/${dateString}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(formattedBlocks)
    });
    
    if (!response.ok) {
      // 获取详细错误信息
      let errorMessage = '更新时间块失败';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error('服务器错误详情:', errorData);
      } catch (jsonError) {
        // 无法解析JSON，使用默认错误消息
        console.error('无法解析服务器错误:', jsonError);
      }
      throw new Error(errorMessage);
    }
    
    return true;
  } catch (error) {
    console.error('更新时间块失败:', error);
    throw error;
  }
};

// 获取所有时间块标签
export const getTimeBlockLabels = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/time-block-labels`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('获取时间块标签失败');
    return await response.json();
  } catch (error) {
    console.error('获取时间块标签失败:', error);
    return [];
  }
};

// 添加时间块标签
export const addTimeBlockLabel = async (label) => {
  try {
    const response = await fetch(`${API_BASE_URL}/time-block-labels`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(label)
    });
    if (!response.ok) throw new Error('添加时间块标签失败');
    return await response.json();
  } catch (error) {
    console.error('添加时间块标签失败:', error);
    throw error;
  }
};

// 删除时间块标签
export const deleteTimeBlockLabel = async (labelId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/time-block-labels/${labelId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok && response.status !== 204) throw new Error('删除时间块标签失败');
    return true;
  } catch (error) {
    console.error('删除时间块标签失败:', error);
    throw error;
  }
};

// 获取每日总结
export const getDailySummary = async (date) => {
  try {
    const dateString = new Date(date).toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/time-blocks/summary/${dateString}`, {
      headers: getAuthHeaders()
    });
    
    if (response.status === 404) {
      // 如果没有找到总结，返回空对象
      return { content: '', rating: 0 };
    }
    
    if (!response.ok) throw new Error('获取每日总结失败');
    return await response.json();
  } catch (error) {
    console.error('获取每日总结失败:', error);
    return { content: '', rating: 0 };
  }
};

// 更新每日总结
export const updateDailySummary = async (date, content, rating) => {
  try {
    const dateString = new Date(date).toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/time-blocks/summary/${dateString}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, rating })
    });
    
    if (!response.ok) throw new Error('更新每日总结失败');
    return true;
  } catch (error) {
    console.error('更新每日总结失败:', error);
    throw error;
  }
};