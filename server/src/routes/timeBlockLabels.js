import express from 'express';
import TimeBlockLabel from '../models/TimeBlockLabel.js';

const router = express.Router();

// 获取所有时间块标签
router.get('/', async (req, res) => {
  try {
    const labels = await TimeBlockLabel.findAll();
    res.json(labels);
  } catch (error) {
    console.error('获取时间块标签失败:', error);
    res.status(500).json({ error: '获取时间块标签失败' });
  }
});

// 添加新时间块标签
router.post('/', async (req, res) => {
  try {
    const label = await TimeBlockLabel.create(req.body);
    res.status(201).json(label);
  } catch (error) {
    console.error('添加时间块标签失败:', error);
    res.status(500).json({ error: '添加时间块标签失败' });
  }
});

// 更新时间块标签
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await TimeBlockLabel.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedLabel = await TimeBlockLabel.findByPk(req.params.id);
      res.json(updatedLabel);
    } else {
      res.status(404).json({ error: '时间块标签不存在' });
    }
  } catch (error) {
    console.error('更新时间块标签失败:', error);
    res.status(500).json({ error: '更新时间块标签失败' });
  }
});

// 删除时间块标签
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await TimeBlockLabel.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: '时间块标签不存在' });
    }
  } catch (error) {
    console.error('删除时间块标签失败:', error);
    res.status(500).json({ error: '删除时间块标签失败' });
  }
});

export default router;