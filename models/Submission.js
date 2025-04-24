// ptilms-api/models/Submission.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Submission = sequelize.define('Submission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assignmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Assignments',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    submissionText: {
      type: DataTypes.TEXT,
      allowNull: true, // Allow null if submission is only a file
    },
    fileKey: { // Added fileKey
      type: DataTypes.STRING,
      allowNull: true, // Allow null if submission is only text
      comment: 'Stores MinIO file key',
    },
    originalFilename: { // Added originalFilename
      type: DataTypes.STRING,
      allowNull: true, // Allow null if submission is only text
      comment: 'Stores the original name of the uploaded file',
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    grade: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    // Add indexes for performance
    indexes: [
      {
        fields: ['assignmentId', 'userId'],
        unique: true, // Ensure only one submission per user per assignment
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['submittedAt'],
      },
    ],
  });

  Submission.associate = (models) => {
    Submission.belongsTo(models.Assignment, { foreignKey: 'assignmentId', as: 'assignment' });
    Submission.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Submission;
};