import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TimeBlockLabel = sequelize.define('TimeBlockLabel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// 同步模型到数据库
TimeBlockLabel.sync();

export default TimeBlockLabel;