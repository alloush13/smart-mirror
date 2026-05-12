import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';

export function createChatRouter(controller: ChatController) {
  const router = Router();
  router.post('/chat', controller.handleChat.bind(controller));
  return router;
}
