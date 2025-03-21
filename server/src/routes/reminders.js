import express from 'express';
import { Reminder } from '../models/Reminder.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 添加认证中间件
router.use(authMiddleware);

// 获取所有提醒
router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
      where: { userId: req.userId },
      order: [['remindTime', 'ASC']]
    });
    res.json(reminders);
  } catch (error) {
    console.error('获取提醒列表失败:', error);
    res.status(500).json({ error: '获取提醒列表失败' });
  }
});

// 创建新提醒
router.post('/', async (req, res) => {
  try {
    const reminder = await Reminder.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json(reminder);
  } catch (error) {
    console.error('创建提醒失败:', error);
    res.status(500).json({ error: '创建提醒失败' });
  }
});

// 更新提醒
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Reminder.update(req.body, {
      where: { 
        id: req.params.id,
        userId: req.userId
      }
    });
    if (updated) {
      const updatedReminder = await Reminder.findOne({
        where: { 
          id: req.params.id,
          userId: req.userId
        }
      });
      res.json(updatedReminder);
    } else {
      res.status(404).json({ error: '提醒不存在或无权访问' });
    }
  } catch (error) {
    console.error('更新提醒失败:', error);
    res.status(500).json({ error: '更新提醒失败' });
  }
});

// 删除提醒
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Reminder.destroy({
      where: { 
        id: req.params.id,
        userId: req.userId
      }
    });
    if (deleted) {
      res.json({ message: '提醒已删除' });
    } else {
      res.status(404).json({ error: '提醒不存在或无权访问' });
    }
  } catch (error) {
    console.error('删除提醒失败:', error);
    res.status(500).json({ error: '删除提醒失败' });
  }
});

export default router;