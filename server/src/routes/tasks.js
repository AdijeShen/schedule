import express from 'express';
import Task from '../models/Task.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 添加认证中间件
router.use(authMiddleware);

// 获取所有任务
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.userId },
      order: [['dueDate', 'ASC']]
    });
    res.json(tasks);
  } catch (error) {
    console.error('获取任务失败:', error);
    res.status(500).json({ error: '获取任务失败' });
  }
});

// 添加新任务
router.post('/', async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('添加任务失败:', error);
    res.status(500).json({ error: '添加任务失败' });
  }
});

// 更新任务
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Task.update(req.body, {
      where: { 
        id: req.params.id,
        userId: req.userId
      }
    });
    if (updated) {
      const updatedTask = await Task.findOne({
        where: { 
          id: req.params.id,
          userId: req.userId
        }
      });
      res.json(updatedTask);
    } else {
      res.status(404).json({ error: '任务不存在或无权访问' });
    }
  } catch (error) {
    console.error('更新任务失败:', error);
    res.status(500).json({ error: '更新任务失败' });
  }
});

// 删除任务
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Task.destroy({
      where: { 
        id: req.params.id,
        userId: req.userId
      }
    });
    if (deleted) {
      res.json({ message: '任务已删除' });
    } else {
      res.status(404).json({ error: '任务不存在或无权访问' });
    }
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({ error: '删除任务失败' });
  }
});

export default router;