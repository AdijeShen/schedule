import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TimeBlock = sequelize.define('TimeBlock', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  blockIndex: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  // 修复联合唯一索引定义，确保正确包含所有三个字段
  indexes: [{
    unique: true,
    fields: ['userId', 'date', 'blockIndex'],
    name: 'unique_user_date_block' // 添加明确的索引名称
  }]
});

// 移除单独的同步调用
// TimeBlock.sync({ alter: true });

export default TimeBlock;