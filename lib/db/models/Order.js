import { DataTypes } from 'sequelize'

export default function initOrder(sequelize) {
  const Order = sequelize.define('order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('new', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'new',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'delivery_date',
    },
    assemblyDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'assembly_date',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'total_amount',
    },
    clientId: {
      type: DataTypes.UUID,
      field: 'client_id',
      allowNull: true,
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
  
  return Order
}