import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Task = sequelize.define('Task', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: true
    },
    dueDate: {
        type: DataTypes.DATE,
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

// 移除单独的同步调用
// Task.sync({ alter: true });

export default Task;