// ptilms-api/repositories/UserRepository.js
const { Op } = require('sequelize');

class UserRepository {
  constructor(userModel, roleModel) {
    this.userModel = userModel;
    this.roleModel = roleModel;
  }

  async getUserByEmail(email) {
    return await this.userModel.scope('withSensitive').findOne({
      where: { email },
      include: {
        model: this.roleModel,
        as: 'role', // Use the alias here
      },
    });
  }

  async getUserByUsername(username) {
    return await this.userModel.findOne({ where: { username } });
  }

  async getUserById(id) {
    return await this.userModel.findByPk(id, {
      include: {
        model: this.roleModel,
        as: 'role', // Use the alias here
      },
    });
  }

  async createUser(data) {
    return await this.userModel.create(data);
  }

  async updateUser(id, data) {
    const user = await this.userModel.findByPk(id);
    if (!user) return null;
    return await user.update(data);
  }

  async deleteUser(id) {
    const user = await this.userModel.findByPk(id);
    if (!user) return false;
    await user.destroy();
    return true;
  }

  async findByEmailOrUsername(email, username) {
    return await this.userModel.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });
  }

  async getModifiedUsers(since) {
    return await this.userModel.findAll({
      where: {
        updatedAt: {
          [Op.gt]: since,
        },
      },
    });
  }
}

module.exports = UserRepository;