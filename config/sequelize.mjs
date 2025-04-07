// ptilms-api/config/sequelize.mjs
import config from './config.cjs';

const sequelizeConfig = {
  [config.env]: {
    ...config.database,
    logging: (msg) => console.log(msg), // Keep logging within the config
  },
};

export default sequelizeConfig;