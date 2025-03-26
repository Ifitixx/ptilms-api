// ptilms-api/models/Level.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Level extends Model {
    static associate(models) {
      Level.hasMany(models.Course, {
        foreignKey: 'levelId',
        as: 'courses',
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE',
      });
    }
  }

  Level.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Level',
      tableName: 'levels',
      paranoid: true,
    }
  );

  return Level;
};