import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Reminder = sequelize.define('Reminder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  remindTime: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

// 移除单独的同步调用
// Reminder.sync({ alter: true });

export { Reminder };