import { getAllReminders } from './reminderService';
import { sendNotification, requestNotificationPermission } from './notificationService';

// 存储活跃的提醒
let activeReminders = [];
// 存储轮询间隔ID
let checkInterval = null;
// 默认检查间隔（毫秒）
const DEFAULT_CHECK_INTERVAL = 30000; // 30秒

// 初始化提醒管理器
export const initReminderManager = async () => {
  // 请求通知权限
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('提醒功能需要通知权限才能正常工作');
  }
  
  // 加载所有提醒
  await refreshReminders();
  
  // 设置定期检查
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  
  checkInterval = setInterval(() => {
    checkReminders();
  }, DEFAULT_CHECK_INTERVAL);
  
  // 立即检查一次
  checkReminders();
  
  return hasPermission;
};

// 刷新提醒列表
export const refreshReminders = async () => {
  try {
    const reminders = await getAllReminders();
    activeReminders = reminders.filter(reminder => {
      // 只保留未来的提醒
      const remindTime = new Date(reminder.remindTime);
      return remindTime > new Date();
    });
    console.log(`已加载 ${activeReminders.length} 个待触发的提醒`);
    return true;
  } catch (error) {
    console.error('刷新提醒列表失败:', error);
    return false;
  }
};

// 检查并触发提醒
export const checkReminders = () => {
  const now = new Date();
  const triggeredReminders = [];
  
  activeReminders.forEach(reminder => {
    const remindTime = new Date(reminder.remindTime);
    
    // 如果提醒时间在现在之前，但在30秒内，则触发
    const timeDiff = now - remindTime;
    if (timeDiff >= 0 && timeDiff <= DEFAULT_CHECK_INTERVAL) {
      triggerReminder(reminder);
      triggeredReminders.push(reminder.id);
    }
  });
  
  // 从活跃列表中移除已触发的提醒
  if (triggeredReminders.length > 0) {
    activeReminders = activeReminders.filter(reminder => 
      !triggeredReminders.includes(reminder.id)
    );
    console.log(`已触发 ${triggeredReminders.length} 个提醒`);
  }
};

// 触发提醒通知
export const triggerReminder = (reminder) => {
  const { title, content, remindTime } = reminder;
  const formattedTime = new Date(remindTime).toLocaleTimeString();
  
  sendNotification(title, {
    body: `${content}\n提醒时间: ${formattedTime}`,
    onClick: () => {
      // 点击通知后跳转到提醒页面
      window.location.href = '#/reminders';
    }
  });
  
  // 如果浏览器支持语音合成，朗读提醒内容
  if ('speechSynthesis' in window) {
    const speech = new SpeechSynthesisUtterance();
    speech.text = `提醒：${title}，${content}`;
    speech.lang = 'zh-CN';
    window.speechSynthesis.speak(speech);
  }
  
  // 播放提醒声音
  playReminderSound();
};

// 播放提醒声音
export const playReminderSound = () => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => {
      console.warn('无法播放提醒声音:', err);
    });
  } catch (error) {
    console.warn('播放提醒声音失败:', error);
  }
};

// 清理资源
export const cleanupReminderManager = () => {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}; 