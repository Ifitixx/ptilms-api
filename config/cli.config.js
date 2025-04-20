// config/cli.config.js
import 'dotenv/config';

const commonDefine = {
  underscored:   true,
  timestamps:    true,
  createdAt:     'created_at',
  updatedAt:     'updated_at',
  deletedAt:     'deleted_at',
  paranoid:      true
};

export default {
  development: {
    url:             process.env.DATABASE_URL,
    dialect:         'mysql',
    dialectOptions:  { bigNumberStrings: true },
    define:          commonDefine
  },
  test: {
    url:             process.env.DATABASE_URL,
    dialect:         'mysql',
    dialectOptions:  { bigNumberStrings: true },
    define:          commonDefine
  },
  production: {
    url:             process.env.DATABASE_URL,
    dialect:         'mysql',
    dialectOptions:  {
      bigNumberStrings: true,
      ssl: { require: true, rejectUnauthorized: false }
    },
    define:          commonDefine,
    pool: {
      max:     20,
      min:     5,
      acquire: 30000,
      idle:    10000
    }
  }
};
