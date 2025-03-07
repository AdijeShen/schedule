import express from 'express';
import Task from '../models/Task.js';

const router = express.Router();

// 获取所有任务
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.json(tasks);
  } catch (error) {
    console.error('获取任务失败:', error);
    res.status(500).json({ error: '获取任务失败' });
  }
});

// 添加新任务
router.post('/', async (req, res) => {
  try {
    const task = await Task.create(req.body);
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
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedTask = await Task.findByPk(req.params.id);
      res.json(updatedTask);
    } else {
      res.status(404).json({ error: '任务不存在' });
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
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: '任务不存在' });
    }
  } catch (error) {
    console.error('删除任务失败:', error);
    res.status(500).json({ error: '删除任务失败' });
  }
});

// 按日期获取任务
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const tasks = await Task.findAll({
      where: {
        dueDate: date
      }
    });
    res.json(tasks);
  } catch (error) {
    console.error('按日期获取任务失败:', error);
    res.status(500).json({ error: '按日期获取任务失败' });
  }
});

export default router;