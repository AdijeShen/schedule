import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Reminder = sequelize.define('Reminder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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

// 同步模型到数据库
Reminder.sync();

export { Reminder };