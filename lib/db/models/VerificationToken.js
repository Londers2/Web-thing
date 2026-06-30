import { DataTypes } from 'sequelize'

export default function initVerificationToken(sequelize) {
  const VerificationToken = sequelize.define('verification_token', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    identifier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    timestamps: true,
  })
  
  return VerificationToken
}