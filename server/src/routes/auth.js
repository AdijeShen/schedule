import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 创建新用户
    const user = await User.create({
      username,
      password,
      email
    });

    // 生成JWT令牌
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(401).json({ error: '未授权' });
  }
});

export default router;