import express from 'express';
import TimeBlock from '../models/TimeBlock.js';
import { Op } from 'sequelize';

const router = express.Router();

// 获取指定日期的时间块
router.get('/date/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const timeBlocks = await TimeBlock.findAll({
      where: { date },
      order: [['blockIndex', 'ASC']]
    });

    // 如果没有数据，返回96个空的时间块
    if (timeBlocks.length === 0) {
      const emptyBlocks = Array(96).fill({
        date,
        status: null,
        note: ''
      }).map((block, index) => ({
        ...block,
        blockIndex: index
      }));
      return res.json(emptyBlocks);
    }

    res.json(timeBlocks);
  } catch (error) {
    console.error('获取时间块失败:', error);
    res.status(500).json({ error: '获取时间块失败' });
  }
});

// 更新时间块
router.put('/date/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const blocks = req.body;

    // 使用事务确保数据一致性
    await TimeBlock.sequelize.transaction(async (t) => {
      // 删除该日期的所有时间块
      await TimeBlock.destroy({
        where: { date },
        transaction: t
      });

      // 创建新的时间块
      await TimeBlock.bulkCreate(
        blocks.map((block, index) => ({
          date,
          blockIndex: index,
          status: block.status,
          note: block.note || ''
        })),
        { transaction: t }
      );
    });

    const updatedBlocks = await TimeBlock.findAll({
      where: { date },
      order: [['blockIndex', 'ASC']]
    });

    res.json(updatedBlocks);
  } catch (error) {
    console.error('更新时间块失败:', error);
    res.status(500).json({ error: '更新时间块失败' });
  }
});

// 更新时间块备注
router.put('/date/:date/block/:index/note', async (req, res) => {
  try {
    const { date, index } = req.params;
    const { note } = req.body;

    const [block] = await TimeBlock.findOrCreate({
      where: { date, blockIndex: index },
      defaults: {
        status: null,
        note: ''
      }
    });

    block.note = note;
    await block.save();

    res.json(block);
  } catch (error) {
    console.error('更新时间块备注失败:', error);
    res.status(500).json({ error: '更新时间块备注失败' });
  }
});

// 获取所有日期的时间块统计
router.get('/stats', async (req, res) => {
  try {
    const blocks = await TimeBlock.findAll({
      attributes: ['date', 'status'],
      where: {
        status: {
          [Op.ne]: null
        }
      },
      raw: true
    });

    const stats = {};
    blocks.forEach(block => {
      try {
        const dateStr = block.date.split('T')[0];
        if (!stats[dateStr]) {
          stats[dateStr] = {};
        }
        stats[dateStr][block.status] = (stats[dateStr][block.status] || 0) + 1;
      } catch (error) {
        console.error('处理时间块日期失败:', error);
      }
    });

    // 计算每个日期的主要状态
    Object.keys(stats).forEach(date => {
      let maxStatus = null;
      let maxCount = 0;
      Object.entries(stats[date]).forEach(([status, count]) => {
        if (count > maxCount) {
          maxStatus = parseInt(status);
          maxCount = count;
        }
      });
      stats[date] = maxStatus;
    });

    res.json(stats);
  } catch (error) {
    console.error('获取时间块统计失败:', error);
    res.status(500).json({ error: '获取时间块统计失败', details: error.message });
  }
});

export default router;