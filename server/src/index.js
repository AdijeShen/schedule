import express from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import TimeBlock from './models/TimeBlock.js';
import DailySummary from './models/DailySummary.js';

// 创建Express应用
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method !== 'GET' && req.body) {
    console.log('请求体大小:', JSON.stringify(req.body).length);
  }
  next();
});

// 导入路由
import taskRoutes from './routes/tasks.js';
import timeBlockRoutes from './routes/timeBlocks.js';
import timeBlockLabelRoutes from './routes/timeBlockLabels.js';
import reminderRoutes from './routes/reminders.js';
import authRoutes from './routes/auth.js';
import authMiddleware from './middleware/auth.js';

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/time-blocks', authMiddleware, timeBlockRoutes);
app.use('/api/time-block-labels', authMiddleware, timeBlockLabelRoutes);
app.use('/api/reminders', authMiddleware, reminderRoutes);

// 设置端口
const PORT = process.env.PORT || 3001;

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});