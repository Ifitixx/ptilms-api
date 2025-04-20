// ptilms-api/config/sequelize.mjs
import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect:        'mysql',
  logging:        console.log,
  dialectOptions: { bigNumberStrings: true }
});

export default sequelize;
