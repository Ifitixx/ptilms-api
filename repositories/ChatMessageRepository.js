// ptilms-api/repositories/ChatMessageRepository.js
class ChatMessageRepository {
    constructor(chatMessageModel, chatModel, userModel) {
      this.chatMessageModel = chatMessageModel;
      this.chatModel = chatModel;
      this.userModel = userModel;
    }
  
    async getAllChatMessages() {
      return await this.chatMessageModel.findAll({
        include: [
          {
            model: this.chatModel,
            as: 'chat',
          },
          {
            model: this.userModel,
            as: 'sender',
          },
        ],
      });
    }
  
    async getChatMessageById(id) {
      return await this.chatMessageModel.findByPk(id, {
        include: [
          {
            model: this.chatModel,
            as: 'chat',
          },
          {
            model: this.userModel,
            as: 'sender',
          },
        ],
      });
    }
  
    async createChatMessage(data) {
      return await this.chatMessageModel.create(data);
    }
  
    async updateChatMessage(id, data) {
      const chatMessage = await this.chatMessageModel.findByPk(id);
      if (!chatMessage) return null;
      return await chatMessage.update(data);
    }
  
    async deleteChatMessage(id) {
      const chatMessage = await this.chatMessageModel.findByPk(id);
      if (!chatMessage) return false;
      await chatMessage.destroy();
      return true;
    }
    async getChatMessagesByChatId(chatId) {
      return await this.chatMessageModel.findAll({
        where: { chatId: chatId },
        include: [
          {
            model: this.chatModel,
            as: 'chat',
          },
          {
            model: this.userModel,
            as: 'sender',
          },
        ],
      });
    }
  }
  
  export default ChatMessageRepository;