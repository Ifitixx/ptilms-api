// ptilms-api/controllers/ChatMessageController.js
import {
    ChatMessageNotFoundError,
    BadRequestError,
    ValidationError,
} from '../utils/errors.js';
import validator from 'validator';

class ChatMessageController {
    constructor({ chatMessageService }) {
        this.chatMessageService = chatMessageService;
    }

    async getAllChatMessages(req, res, next) {
        try {
            const chatMessages = await this.chatMessageService.getAllChatMessages();
            res.json(chatMessages);
        } catch (error) {
            next(error);
        }
    }

    async getChatMessageById(req, res, next) {
        try {
            const { id } = req.params;
            // Validate id format
            if (!validator.isUUID(id)) {
                throw new ValidationError([{ field: 'id', message: 'Invalid chat message id format' }]);
            }
            const chatMessage = await this.chatMessageService.getChatMessageById(id);
            if (!chatMessage) {
                throw new ChatMessageNotFoundError();
            }
            res.json(chatMessage);
        } catch (error) {
            next(error);
        }
    }

    // Add this method
    async getChatMessagesByChatId(req, res, next) {
        try {
            const { chatId } = req.params;
            // Validate chatId format
            if (!validator.isUUID(chatId)) {
                throw new ValidationError([{ field: 'chatId', message: 'Invalid chatId format' }]);
            }
            const chatMessages = await this.chatMessageService.getChatMessagesByChatId(chatId);
            res.json(chatMessages);
        } catch (error) {
            next(error);
        }
    }

    async createChatMessage(req, res, next) {
        try {
            const { content, chatId, userId } = req.body;
            if (!content || !chatId || !userId) {
                throw new BadRequestError('Content, chatId, and userId are required');
            }
            // Validate chatId format
            if (!validator.isUUID(chatId)) {
                throw new ValidationError([{ field: 'chatId', message: 'Invalid chatId format' }]);
            }
            // Validate userId format
            if (!validator.isUUID(userId)) {
                throw new ValidationError([{ field: 'userId', message: 'Invalid userId format' }]);
            }
            const chatMessage = await this.chatMessageService.createChatMessage(req.body);
            res.status(201).json(chatMessage);
        } catch (error) {
            next(error);
        }
    }

    async updateChatMessage(req, res, next) {
        try {
            const { id } = req.params;
            // Validate id format
            if (!validator.isUUID(id)) {
                throw new ValidationError([{ field: 'id', message: 'Invalid chat message id format' }]);
            }
            const chatMessage = await this.chatMessageService.updateChatMessage(id, req.body);
            if (!chatMessage) {
                throw new ChatMessageNotFoundError();
            }
            res.json(chatMessage);
        } catch (error) {
            next(error);
        }
    }

    async deleteChatMessage(req, res, next) {
        try {
            const { id } = req.params;
            // Validate id format
            if (!validator.isUUID(id)) {
                throw new ValidationError([{ field: 'id', message: 'Invalid chat message id format' }]);
            }
            const chatMessage = await this.chatMessageService.getChatMessageById(id);
            if (!chatMessage) {
                throw new ChatMessageNotFoundError();
            }
            await this.chatMessageService.deleteChatMessage(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default ChatMessageController;