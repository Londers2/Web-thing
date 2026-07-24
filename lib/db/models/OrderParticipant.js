// lib/db/models/OrderParticipant.js
import { DataTypes } from 'sequelize'

export default function initOrderParticipant(sequelize) {
  const OrderParticipant = sequelize.define('order_participant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      field: 'order_id',
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('manager', 'measurer', 'assembler'),
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    timestamps: true,
  })
  
  return OrderParticipant
}