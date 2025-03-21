import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '请先登录' });
    }

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 将用户ID添加到请求对象中
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('认证失败:', error);
    res.status(401).json({ error: '认证失败' });
  }
};

export default authMiddleware;