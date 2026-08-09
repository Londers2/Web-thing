// lib/db/models/EventParticipant.js
import { DataTypes } from 'sequelize'

export default function initEventParticipant(sequelize) {
  const EventParticipant = sequelize.define('event_participant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.UUID,
      field: 'event_id',
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('manager', 'measurer', 'assembler', 'driver', 'technician'),
      allowNull: false,
      comment: 'Роль участника в событии',
    },
  }, {
    freezeTableName: true,
    timestamps: true,
  })
  
  return EventParticipant
}