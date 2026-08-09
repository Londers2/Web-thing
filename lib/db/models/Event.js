// lib/db/models/Event.js
import { DataTypes } from 'sequelize'

export default function initEvent(sequelize) {
  const Event = sequelize.define('event', {
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
    addressId: {
      type: DataTypes.UUID,
      field: 'address_id',
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('measurement', 'assembly', 'delivery', 'reclamation'),
      allowNull: false,
      comment: 'Тип события: замер, сборка, доставка, рекламация',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'scheduled_date',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_date',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Для замеров: параметры замера
    measurementData: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'measurement_data',
      comment: 'JSON с данными замеров (размеры, площади и т.д.)',
    },
    // Для рекламаций: описание проблемы
    issueDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'issue_description',
    },
    // Для рекламаций: решение
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Результат выполнения
    result: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    freezeTableName: true,
    timestamps: true,
  })
  
  return Event
}