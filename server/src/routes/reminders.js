import express from 'express';
import { Reminder } from '../models/Reminder.js';

const router = express.Router();

// 获取所有提醒
router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
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
    const reminder = await Reminder.create(req.body);
    res.status(201).json(reminder);
  } catch (error) {
    console.error('创建提醒失败:', error);
    res.status(500).json({ error: '创建提醒失败' });
  }
});

// 更新提醒
router.put('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByPk(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: '提醒不存在' });
    }
    await reminder.update(req.body);
    res.json(reminder);
  } catch (error) {
    console.error('更新提醒失败:', error);
    res.status(500).json({ error: '更新提醒失败' });
  }
});

// 删除提醒
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByPk(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: '提醒不存在' });
    }
    await reminder.destroy();
    res.status(204).end();
  } catch (error) {
    console.error('删除提醒失败:', error);
    res.status(500).json({ error: '删除提醒失败' });
  }
});

export default router;