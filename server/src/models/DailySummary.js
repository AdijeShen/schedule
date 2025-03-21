import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DailySummary = sequelize.define('DailySummary', {
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
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
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
  indexes: [{
    unique: true,
    fields: ['userId', 'date'],
    name: 'unique_user_date_summary'
  }]
});

export default DailySummary; 