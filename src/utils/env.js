/**
 * 环境变量工具函数
 * 为应用提供统一的环境变量访问方式
 */

// API 基础URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 当前环境
export const ENV = import.meta.env.VITE_ENV || 'development';

// 判断是否为生产环境
export const isProduction = ENV === 'production';

// 判断是否为开发环境
export const isDevelopment = ENV === 'development';

/**
 * 获取环境变量
 * @param {string} key - 环境变量键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 环境变量值
 */
export const getEnv = (key, defaultValue = undefined) => {
  const envKey = `VITE_${key}`;
  return import.meta.env[envKey] !== undefined ? import.meta.env[envKey] : defaultValue;
};

// 日志函数
export const logEnvironment = () => {
  if (isDevelopment) {
    console.log('环境信息:', {
      API_URL,
      ENV,
      MODE: import.meta.env.MODE,
    });
  }
}; 