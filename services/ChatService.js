// ptilms-api/services/ChatService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class ChatService {
  constructor({ chatRepository }) {
    this.chatRepository = chatRepository;
  }

  async getAllChats() {
    try {
      return await this.chatRepository.getAllChats();
    } catch (error) {
      _error(`Error in getAllChats: ${error.message}`);
      throw error;
    }
  }

  async getChatById(id) {
    try {
      const chat = await this.chatRepository.getChatById(id);
      if (!chat) {
        throw new NotFoundError('Chat not found');
      }
      return chat;
    } catch (error) {
      _error(`Error in getChatById: ${error.message}`);
      throw error;
    }
  }

  async createChat(data) {
    try {
      return await this.chatRepository.createChat(data);
    } catch (error) {
      _error(`Error in createChat: ${error.message}`);
      throw error;
    }
  }

  async updateChat(id, data) {
    try {
      const chat = await this.chatRepository.updateChat(id, data);
      if (!chat) {
        throw new NotFoundError('Chat not found');
      }
      return chat;
    } catch (error) {
      _error(`Error in updateChat: ${error.message}`);
      throw error;
    }
  }

  async deleteChat(id) {
    try {
      const success = await this.chatRepository.deleteChat(id);
      if (!success) {
        throw new NotFoundError('Chat not found');
      }
    } catch (error) {
      _error(`Error in deleteChat: ${error.message}`);
      throw error;
    }
  }
  async getChatsByUserId(userId) {
    try {
      return await this.chatRepository.getChatsByUserId(userId);
    } catch (error) {
      _error(`Error in getChatsByUserId: ${error.message}`);
      throw error;
    }
  }
}

export default ChatService;