// ptilms-api/controllers/ChatController.js
import {
    ChatNotFoundError,
    BadRequestError,
    ValidationError,
} from '../utils/errors.js';
import validator from 'validator';

class ChatController {
    constructor({ chatService }) {
        this.chatService = chatService;
    }

    async getAllChats(req, res, next) {
        try {
            const chats = await this.chatService.getAllChats();
            res.json(chats);
        } catch (error) {
            next(error);
        }
    }

    async getChatById(req, res, next) {
        try {
            const { id } = req.params;
            // Validate id format
            if (!validator.isUUID(id)) {
                throw new ValidationError([{ field: 'id', message: 'Invalid chat id format' }]);
            }
            const chat = await this.chatService.getChatById(id);
            if (!chat) {
                throw new ChatNotFoundError();
            }
            res.json(chat);
        } catch (error) {
            next(error);
        }
    }

    async getChatsByUserId(req, res, next) {
        try {
            const { userId } = req.params;
            // Validate userId format
            if (!validator.isUUID(userId)) {
                throw new ValidationError([{ field: 'userId', message: 'Invalid userId format' }]);
            }
            const chats = await this.chatService.getChatsByUserId(userId);
            res.json(chats);
        } catch (error) {
            next(error);
        }
    }

    async createChat(req, res, next) {
        try {
            const { name, type, departmentId, levelId } = req.body;
            if (!name || !type || !departmentId || !levelId) {
                throw new BadRequestError('Name, type, departmentId, and levelId are required');
            }
            // Validate departmentId format
            if (!validator.isUUID(departmentId)) {
                throw new ValidationError([{ field: 'departmentId', message: 'Invalid departmentId format' }]);
            }
            // Validate levelId format
            if (!validator.isUUID(levelId)) {
                throw new ValidationError([{ field: 'levelId', message: 'Invalid levelId format' }]);
            }
            const chat = await this.chatService.createChat(req.body);
            res.status(201).json(chat);
        } catch (error) {
            next(error);
        }
    }

    async updateChat(req, res, next) {
        try {
            const { id } = req.params;
            // Validate id format
            if (!validator.isUUID(id)) {
                throw new ValidationError([{ field: 'id', message: 'Invalid chat id format' }]);
            }
            const chat = await this.chatService.updateChat(id, req.body);
            if (!chat) {
                throw new ChatNotFoundError();
            }
            res.json(chat);
        } catch (error) {
            next(error);
        }
    }

    async deleteChat(req, res, next) {
        try {
            const { id } = req.params;
            // Validate id format
            if (!validator.isUUID(id)) {
                throw new ValidationError([{ field: 'id', message: 'Invalid chat id format' }]);
            }
            const chat = await this.chatService.getChatById(id);
            if (!chat) {
                throw new ChatNotFoundError();
            }
            await this.chatService.deleteChat(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default ChatController;