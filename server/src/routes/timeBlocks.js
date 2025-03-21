import express from 'express';
import TimeBlock from '../models/TimeBlock.js';
import { Op } from 'sequelize';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';
import DailySummary from '../models/DailySummary.js';

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
      const emptyBlocks = Array(96).fill().map((_, index) => ({
        date,
        blockIndex: index,
        status: null,
        color: null,
        note: ''
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
    
    // 打印传入的数据进行调试
    console.log('更新时间块 - 日期:', date);
    console.log('更新时间块 - 用户ID:', req.userId);
    console.log('更新时间块 - 块数量:', blocks.length);

    // 验证数据格式
    if (!Array.isArray(blocks)) {
      return res.status(400).json({ error: '无效的数据格式，预期为数组' });
    }

    try {
      // 使用事务确保数据一致性
      await TimeBlock.sequelize.transaction(async (t) => {
        // 删除该日期的所有时间块
        const deletedCount = await TimeBlock.destroy({
          where: { 
            date,
            userId: req.userId
          },
          transaction: t
        });
        
        console.log(`删除了 ${deletedCount} 个时间块`);

        // 创建时间块预处理数组 - 保留所有索引位置
        const processedBlocks = blocks.map((block, index) => {
          return {
            blockIndex: index,
            status: block.status === undefined ? null : block.status,
            color: block.color || null,
            note: (block.note || '').toString(),
            date,
            userId: req.userId,
            // 添加标记，表示这是否是有效的块
            isValid: block.status !== null || block.color || block.note
          };
        });

        // 计算有效块的数量
        const validCount = processedBlocks.filter(block => block.isValid).length;
        console.log(`总共有 ${validCount} 个有效时间块，准备创建`);

        // 批量创建所有有效块，使用 bulkCreate 并在事务中处理
        const validBlocks = processedBlocks
          .filter(block => block.isValid)
          .map(block => {
            // 移除我们添加的自定义属性
            const { isValid, ...blockData } = block;
            return blockData;
          });

        if (validBlocks.length > 0) {
          try {
            await TimeBlock.bulkCreate(validBlocks, { 
              transaction: t,
              // 添加忽略选项，如果出现唯一约束冲突则忽略
              ignoreDuplicates: true,
              fields: ['blockIndex', 'status', 'color', 'note', 'date', 'userId'] 
            });
            console.log(`成功创建了 ${validBlocks.length} 个时间块`);
          } catch (bulkError) {
            console.error('批量创建失败，尝试逐个创建:', bulkError);
            
            // 如果批量创建失败，回退到逐个创建
            for(const block of validBlocks) {
              try {
                await TimeBlock.create(block, { 
                  transaction: t,
                  fields: ['blockIndex', 'status', 'color', 'note', 'date', 'userId']
                });
              } catch (createError) {
                // 记录错误但继续处理其他块
                console.error(`创建时间块失败 (blockIndex=${block.blockIndex}):`, createError.message);
              }
            }
          }
        }
      });

      res.json({ message: '时间块更新成功' });
    } catch (txError) {
      console.error('事务执行失败:', txError);
      // 提供更详细的错误信息
      if (txError.name === 'SequelizeUniqueConstraintError') {
        console.error('唯一约束错误，可能存在重复数据');
      }
      throw txError; // 重新抛出异常，会被外层 catch 捕获
    }
  } catch (error) {
    console.error('更新时间块失败:', error);
    // 返回更详细的错误信息
    res.status(500).json({ 
      error: '更新时间块失败', 
      message: error.message,
      code: error.name || 'UnknownError',
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// 更新时间块备注
router.put('/date/:date/block/:blockIndex/note', async (req, res) => {
  try {
    const { date, blockIndex } = req.params;
    const { note } = req.body;
    const block = await TimeBlock.findOne({
      where: {
        date,
        blockIndex,
        userId: req.userId
      }
    });

    if (block) {
      // 更新已存在的时间块
      block.note = note;
      await block.save();
      res.json({ message: '备注更新成功' });
    } else {
      // 创建新的时间块
      await TimeBlock.create({
        date,
        blockIndex,
        userId: req.userId,
        note,
        status: null,
        color: null
      });
      res.json({ message: '备注创建成功' });
    }
  } catch (error) {
    console.error('更新备注失败:', error);
    res.status(500).json({ error: '更新备注失败' });
  }
});

// 获取时间块统计信息
router.get('/stats', async (req, res) => {
  try {
    // 简化查询，只获取必要的字段
    const allBlocks = await TimeBlock.findAll({
      where: { 
        userId: req.userId,
        [Op.or]: [
          { color: { [Op.not]: null } },
          { status: { [Op.not]: null } }
        ]
      },
      attributes: ['date', 'color', 'status'],
      raw: true
    });

    // 按日期分组统计
    const dateStats = {};
    
    allBlocks.forEach(block => {
      const date = block.date;
      if (!dateStats[date]) {
        dateStats[date] = {
          colorCount: {},
          totalBlocks: 0
        };
      }

      // 优先使用颜色字段
      if (block.color) {
        if (!dateStats[date].colorCount[block.color]) {
          dateStats[date].colorCount[block.color] = 0;
        }
        dateStats[date].colorCount[block.color]++;
        dateStats[date].totalBlocks++;
      }
      // 兼容旧数据（使用状态ID）
      else if (block.status !== null) {
        const oldColorMap = {
          0: '#ff4d4f', // 红色
          1: '#faad14', // 黄色
          2: '#52c41a'  // 绿色
        };
        const color = oldColorMap[block.status] || '#f0f0f0';
        
        if (!dateStats[date].colorCount[color]) {
          dateStats[date].colorCount[color] = 0;
        }
        dateStats[date].colorCount[color]++;
        dateStats[date].totalBlocks++;
      }
    });

    // 将每个日期的最常见颜色作为该日期的颜色
    const result = {};
    for (const [date, stats] of Object.entries(dateStats)) {
      if (stats.totalBlocks > 0) {
        // 找出最常见的颜色
        let mostCommonColor = null;
        let maxCount = 0;
        
        for (const [color, count] of Object.entries(stats.colorCount)) {
          if (count > maxCount) {
            maxCount = count;
            mostCommonColor = color;
          }
        }
        
        result[date] = mostCommonColor;
      }
    }

    res.json(result);
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({ error: '获取统计信息失败' });
  }
});

// 获取指定日期的每日总结
router.get('/summary/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    const summary = await DailySummary.findOne({
      where: {
        userId: req.userId,
        date
      }
    });
    
    if (!summary) {
      return res.status(404).json({ message: '该日期没有总结' });
    }
    
    res.json({ 
      content: summary.content || '', 
      rating: summary.rating || 0 
    });
  } catch (error) {
    console.error('获取每日总结失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新指定日期的每日总结
router.put('/summary/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { content, rating } = req.body;
    
    // 验证评分范围
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      return res.status(400).json({ message: '评分必须在0-5之间' });
    }
    
    // 使用 upsert 选项来创建或更新
    const [summary, created] = await DailySummary.findOrCreate({
      where: {
        userId: req.userId,
        date
      },
      defaults: {
        content: content || '',
        rating: rating || 0
      }
    });
    
    // 如果记录已存在，则更新它
    if (!created) {
      summary.content = content || '';
      summary.rating = rating || 0;
      await summary.save();
    }
    
    res.json({ 
      content: summary.content, 
      rating: summary.rating
    });
  } catch (error) {
    console.error('更新每日总结失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;