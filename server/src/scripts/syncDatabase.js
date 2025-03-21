/**
 * 数据库同步脚本
 * 用于手动同步数据库结构，在模型定义变更后使用
 * 
 * 使用方法:
 * - 基本同步 (alter 模式): node syncDatabase.js
 * - 完全重建 (force 模式): node syncDatabase.js --force
 */

import sequelize from '../config/database.js';

// 导入所有模型确保它们已注册
import '../models/TimeBlock.js';
import '../models/DailySummary.js';
import '../models/Task.js';
import '../models/Reminder.js';
import '../models/TimeBlockLabel.js';
import '../models/User.js';

// 检查命令行参数
const args = process.argv.slice(2);
const force = args.includes('--force');

// 设置环境变量
process.env.SYNC_DB = 'true';
if (force) {
  process.env.FORCE_SYNC = 'true';
}

async function syncDatabase() {
  try {
    console.log('开始同步数据库...');
    
    if (force) {
      console.log('警告: 将使用 FORCE 模式，所有数据将被清除!');
      console.log('3秒后开始操作，按 Ctrl+C 取消...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    if (force) {
      await sequelize.sync({ force: true });
      console.log('数据库表已完全重建');
    } else {
      await sequelize.sync({ alter: true });
      console.log('数据库结构已更新');
    }
    
    console.log('数据库同步完成');
    process.exit(0);
  } catch (error) {
    console.error('数据库同步失败:', error);
    process.exit(1);
  }
}

syncDatabase(); 