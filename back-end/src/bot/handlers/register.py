from .user import register_user_handlers
from .admin import register_admin_handlers
from aiogram import Dispatcher, Router

from ..middlewares.admin import AdminMiddleware

def register_handlers(dp: Dispatcher):
    user_router = Router(name="user_router")
    register_user_handlers(user_router)
    admin_router = Router(name="admin_router")
    register_admin_handlers(admin_router)
    admin_router.callback_query.middleware.register(AdminMiddleware())
    admin_router.message.middleware.register(AdminMiddleware())
    dp.include_routers(user_router, admin_router)

