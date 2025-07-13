from typing import Any, Callable, Dict, Union
from aiogram.dispatcher.middlewares.base import BaseMiddleware
from aiogram.types import Message, CallbackQuery
from auth.models import User

class UserMiddleware(BaseMiddleware):
    async def __call__(self, handler: Callable, event: Union[Message, CallbackQuery], data: Dict[str, Any]) -> Any:
        from_user = event.from_user
        data["user"] = await User.create_or_get_by_telegram(from_user)
        return await handler(event, data)
