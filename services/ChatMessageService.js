// ptilms-api/services/ChatMessageService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class ChatMessageService {
  constructor({ chatMessageRepository }) {
    this.chatMessageRepository = chatMessageRepository;
  }

  async getAllChatMessages() {
    try {
      return await this.chatMessageRepository.getAllChatMessages();
    } catch (error) {
      _error(`Error in getAllChatMessages: ${error.message}`);
      throw error;
    }
  }

  async getChatMessageById(id) {
    try {
      const chatMessage = await this.chatMessageRepository.getChatMessageById(id);
      if (!chatMessage) {
        throw new NotFoundError('ChatMessage not found');
      }
      return chatMessage;
    } catch (error) {
      _error(`Error in getChatMessageById: ${error.message}`);
      throw error;
    }
  }

  async createChatMessage(data) {
    try {
      return await this.chatMessageRepository.createChatMessage(data);
    } catch (error) {
      _error(`Error in createChatMessage: ${error.message}`);
      throw error;
    }
  }

  async updateChatMessage(id, data) {
    try {
      const chatMessage = await this.chatMessageRepository.updateChatMessage(id, data);
      if (!chatMessage) {
        throw new NotFoundError('ChatMessage not found');
      }
      return chatMessage;
    } catch (error) {
      _error(`Error in updateChatMessage: ${error.message}`);
      throw error;
    }
  }

  async deleteChatMessage(id) {
    try {
      const success = await this.chatMessageRepository.deleteChatMessage(id);
      if (!success) {
        throw new NotFoundError('ChatMessage not found');
      }
    } catch (error) {
      _error(`Error in deleteChatMessage: ${error.message}`);
      throw error;
    }
  }
  async getChatMessagesByChatId(chatId) {
    try {
      return await this.chatMessageRepository.getChatMessagesByChatId(chatId);
    } catch (error) {
      _error(`Error in getChatMessagesByChatId: ${error.message}`);
      throw error;
    }
  }
}

export default ChatMessageService;