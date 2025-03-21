import { Sequelize } from 'sequelize';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: console.log
});

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功。');
    // 同步所有模型到数据库
    await sequelize.sync({ alter: true });
    console.log('数据库模型同步成功。');
  } catch (error) {
    console.error('数据库操作失败:', error);
  }
}

testConnection();

export default sequelize;