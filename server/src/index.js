import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';

// 初始化数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功。');
  } catch (error) {
    console.error('无法连接到数据库:', error);
  }
}

testConnection();

// 创建Express应用
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 导入路由
import taskRoutes from './routes/tasks.js';
import timeBlockRoutes from './routes/timeBlocks.js';

// 使用路由
app.use('/api/tasks', taskRoutes);
app.use('/api/time-blocks', timeBlockRoutes);

// 设置端口
const PORT = process.env.PORT || 3001;

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

// 导出sequelize实例供模型使用
export { sequelize };