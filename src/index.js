// 注册 Service Worker
if ('serviceWorker' in navigator && import.meta.env.MODE === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker 注册成功:', registration);
      })
      .catch(error => {
        console.log('Service Worker 注册失败:', error);
      });
  });
} 