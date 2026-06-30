import { DataTypes } from 'sequelize'

export default function initSession(sequelize) {
  const Session = sequelize.define('session', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id',
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sessionToken: {
      type: DataTypes.STRING,
      field: 'session_token',
      unique: true,
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    timestamps: true,
  })
  
  return Session
}