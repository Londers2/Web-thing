import { User, Account, Session } from './models/index.js'

export async function findUserByEmail(email) {
  return await User.findOne({ where: { email } })
}

export async function findUserById(id) {
  return await User.findByPk(id)
}

export async function getAllUsers() {
  return await User.findAll({
    attributes: ['id', 'name', 'email', 'phone', 'birthday', 'createdAt'],
    order: [['createdAt', 'DESC']]
  })
}

export async function deleteUser(id) {
  return await User.destroy({ where: { id } })
}

export default {
  findUserByEmail,
  findUserById,
  getAllUsers,
  deleteUser,
}