import { Sequelize } from 'sequelize';

// 初始化数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

// 测试数据库连接
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功。');
  } catch (error) {
    console.error('无法连接到数据库:', error);
  }
}

testConnection();

export { sequelize };