// lib/db/models/Image.js
import { DataTypes } from 'sequelize'

export default function initImage(sequelize) {
  const Image = sequelize.define('image', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'mime_type',
    },
    targetType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'target_type',
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'target_id',
    },
    sortOrder: { 
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order',
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      allowNull: true,
    },
  }, {
    freezeTableName: true,
    timestamps: true,
  })
  
  return Image
}