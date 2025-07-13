from aiogram.dispatcher.middlewares.base import BaseMiddleware
from typing import Dict, Any, Callable, Union
from aiogram.types import CallbackQuery, Message

class AdminMiddleware(BaseMiddleware):
    async def __call__(self, handler: Callable, event: Union[CallbackQuery, Message], data: Dict[str, Any]): 
        if data["user"].is_admin: return await handler(event, data)
