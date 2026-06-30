// lib/db/models/Client.js
import { DataTypes } from 'sequelize'

export default function initClient(sequelize) {
  const Client = sequelize.define('client', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    freezeTableName: true,
    timestamps: true,
  })
  
  return Client
}