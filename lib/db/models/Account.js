import { DataTypes } from 'sequelize'

export default function initAccount(sequelize) {
  const Account = sequelize.define('account', {
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    providerAccountId: {
      type: DataTypes.STRING,
      field: 'provider_account_id',
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    token_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    scope: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    session_state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    freezeTableName: true,
    timestamps: true,
  })
  
  return Account
}