// 检查浏览器是否支持通知
export const checkNotificationSupport = () => {
  return 'Notification' in window;
};

// 请求通知权限
export const requestNotificationPermission = async () => {
  if (!checkNotificationSupport()) {
    console.warn('此浏览器不支持通知功能');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('请求通知权限失败:', error);
    return false;
  }
};

// 查询通知权限状态
export const getNotificationPermission = () => {
  if (!checkNotificationSupport()) return 'unsupported';
  return Notification.permission;
};

// 发送通知
export const sendNotification = (title, options = {}) => {
  if (!checkNotificationSupport()) {
    console.warn('此浏览器不支持通知功能');
    return null;
  }
  
  if (Notification.permission !== 'granted') {
    console.warn('通知权限未授予');
    return null;
  }
  
  try {
    // 设置默认选项
    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      body: '',
      vibrate: [200, 100, 200],
      requireInteraction: true  // 通知不会自动关闭
    };
    
    // 合并用户选项
    const notificationOptions = { ...defaultOptions, ...options };
    
    // 创建并返回通知对象
    const notification = new Notification(title, notificationOptions);
    
    // 点击通知时的回调
    notification.onclick = function() {
      window.focus();
      if (options.onClick) options.onClick();
      notification.close();
    };
    
    return notification;
  } catch (error) {
    console.error('发送通知失败:', error);
    return null;
  }
}; 