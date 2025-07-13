from .user import UserMiddleware
from aiogram import Dispatcher

def register_middlewares(dp: Dispatcher):
    dp.message.middleware.register(UserMiddleware())
    dp.callback_query.middleware.register(UserMiddleware())
