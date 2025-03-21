import express from 'express';
import TimeBlock from '../models/TimeBlock.js';
import { Op } from 'sequelize';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 添加认证中间件
router.use(authMiddleware);

// 获取指定日期的时间块
router.get('/date/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const timeBlocks = await TimeBlock.findAll({
      where: { 
        date,
        userId: req.userId
      },
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
        where: { 
          date,
          userId: req.userId
        },
        transaction: t
      });

      // 创建新的时间块
      const newBlocks = blocks
        .filter(block => block.status !== null)
        .map(block => ({
          ...block,
          date,
          userId: req.userId
        }));

      if (newBlocks.length > 0) {
        await TimeBlock.bulkCreate(newBlocks, { transaction: t });
      }
    });

    res.json({ message: '时间块更新成功' });
  } catch (error) {
    console.error('更新时间块失败:', error);
    res.status(500).json({ error: '更新时间块失败' });
  }
});

// 更新时间块备注
router.put('/note/:date/:blockIndex', async (req, res) => {
  try {
    const { date, blockIndex } = req.params;
    const { note } = req.body;

    const [updated] = await TimeBlock.update(
      { note },
      {
        where: {
          date,
          blockIndex,
          userId: req.userId
        }
      }
    );

    if (updated) {
      res.json({ message: '备注更新成功' });
    } else {
      res.status(404).json({ error: '时间块不存在或无权访问' });
    }
  } catch (error) {
    console.error('更新备注失败:', error);
    res.status(500).json({ error: '更新备注失败' });
  }
});

// 获取时间块统计信息
router.get('/stats', async (req, res) => {
  try {
    const stats = await TimeBlock.findAll({
      where: { userId: req.userId },
      attributes: [
        'status',
        [TimeBlock.sequelize.fn('COUNT', TimeBlock.sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    const formattedStats = stats.reduce((acc, stat) => {
      if (stat.status !== null) {
        acc[stat.status] = stat.get('count');
      }
      return acc;
    }, {});

    res.json(formattedStats);
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({ error: '获取统计信息失败' });
  }
});

export default router;