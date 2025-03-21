import { Sequelize } from 'sequelize';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: (sql, timing) => {
    console.log(`[${new Date().toISOString()}] 执行SQL: ${sql}`);
    if (timing) console.log(`SQL执行时间: ${timing}ms`);
  }
});

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功。');
    
    // 检查是否有 SYNC_DB 环境变量，只有在明确指定时才同步数据库结构
    const shouldSync = process.env.SYNC_DB === 'true';
    const shouldForce = process.env.FORCE_SYNC === 'true';
    
    if (shouldSync) {
      console.log('开始同步数据库模型...');
      try {
        if (shouldForce) {
          console.log('警告: 正在重建数据库表，所有数据将被清除...');
          await sequelize.sync({ force: true });
          console.log('数据库表已完全重建，所有索引已更新。');
        } else {
          console.log('使用 alter 模式同步数据库结构...');
          await sequelize.sync({ alter: true });
          console.log('数据库结构已更新。');
        }
      } catch (syncError) {
        console.error('数据库同步失败:', syncError);
        console.log('尝试使用基本同步模式...');
        await sequelize.sync();
        console.log('数据库基本同步成功。');
      }
    } else {
      console.log('跳过数据库结构同步。如需同步，请设置 SYNC_DB=true 环境变量。');
    }
  } catch (error) {
    console.error('数据库操作失败:', error);
  }
}

testConnection();

export default sequelize;