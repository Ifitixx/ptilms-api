// ptilms-api/repositories/ChatRepository.js
class ChatRepository {
  constructor({ Chat, User }) { // Changed to object parameter
    this.chatModel = Chat;
    this.userModel = User;
  }

  async getAllChats() {
    return await this.chatModel.findAll({
      include: [
        {
          model: this.userModel,
          as: 'users',
          through: { attributes: [] },
        },
      ],
    });
  }

  async getChatById(id) {
    return await this.chatModel.findByPk(id, {
      include: [
        {
          model: this.userModel,
          as: 'users',
          through: { attributes: [] },
        },
      ],
    });
  }

  async createChat(data) {
    return await this.chatModel.create(data);
  }

  async updateChat(id, data) {
    const chat = await this.chatModel.findByPk(id);
    if (!chat) return null;
    return await chat.update(data);
  }

  async deleteChat(id) {
    const chat = await this.chatModel.findByPk(id);
    if (!chat) return false;
    await chat.destroy();
    return true;
  }
  async getChatsByUserId(userId) {
    return await this.chatModel.findAll({
      include: [
        {
          model: this.userModel,
          as: 'users',
          through: { attributes: [] },
          where: { id: userId },
        },
      ],
    });
  }
}

export default ChatRepository;