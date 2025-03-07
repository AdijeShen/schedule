import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const TimeBlock = sequelize.define('TimeBlock', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  // 添加联合唯一索引，确保每个日期的每个时间块只有一条记录
  indexes: [{
    unique: true,
    fields: ['date', 'blockIndex']
  }]
});

// 同步模型到数据库
TimeBlock.sync();

export default TimeBlock;