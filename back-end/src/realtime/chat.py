from socketio import AsyncServer, AsyncNamespace
from socketio.asgi import ASGIApp

from aiogram import Bot, Dispatcher, Router
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from auth.models import User

from minio import get_minio_instance, PHOTOS_BUCKET

from bot.filters.callback_data import ChatAction

from config import TelegramSettings

from bot.kbs.games import accept_chat

from bot.bot import bot, dp

from typing import Dict
import logging
import json

sio = AsyncServer(cors_allowed_origins=[], async_mode='asgi')
socket_app = ASGIApp(sio)

ERROR = "error"
AUTH_SUCCESS = "auth-success"
SEACRH_STARTED = "search-started"
SENT_MESSAGE = "sent-message"
NEW_MESSAGE = "new-message"
CHAT_FOUND = "chat-found"
CHAT_CLOSED = "chat-closed"

class ChatNamespace(AsyncNamespace):
    """
    NameSpace chat integration
    """
    
    def __init__(self, bot: Bot, dp: Dispatcher, *args, **kwargs) -> None:
        self.dp = dp
        self.bot = bot
        super().__init__(*args, **kwargs)

    async def on_auth(self, sid: str, data) -> None:
        logging.critical(data)
        user_id = data.get("user_id")
        if not user_id: return await self.emit(ERROR, {"message":"Bad Request, User Id not found"}, to=sid)
        user = await User.get_or_none(telegram_id=user_id)
        if not user: return await self.emit(ERROR, {"message":f"Not Found, User not found with {user_id} id"}, to=sid)
        await self.save_session(sid, {"user":user, "searching":False})
        await self.emit(AUTH_SUCCESS, {"message":"Successfully authenticated!", "username":user.username, "id":user.telegram_id}, to=sid)

async def on_search(self, sid: str, data) -> None:
    try:
        logging.info(f"Search request from sid: {sid}, data: {data}")
        session = await self.get_session(sid)
        if not session:
            logging.warning(f"No session found for sid: {sid}")
            return await self.emit(ERROR, {"message":"Forbidden not authenticated"}, to=sid)
        
        chat = session.get("chat")
        if chat:
            logging.warning(f"User already in chat: {chat}")
            return await self.emit(ERROR, {"message":"User in chat"}, to=sid)
        
        user = session["user"]
        logging.info(f"Starting search for user: {user.username} (id: {user.telegram_id})")
        
        admins = await User.filter(is_admin=True).all()
        for admin in admins:
            response = (
                "☎️ Юзер открыл запрос на чат с администратором.\n"
                f"#️⃣ Айди: {user.telegram_id}\n"
                f"🚹 Ник: {user.username}\n"
            )
            await self.bot.send_message(chat_id=admin.telegram_id, text=response, reply_markup=accept_chat(sid))
        
        session["searching"] = True
        await self.save_session(sid, session)
        
        logging.info(f"Emitting search-started to sid: {sid}")
        await self.emit(SEACRH_STARTED, {
            "message": "Search started!",
            "searching": True
        }, to=sid)
    except Exception as e:
        logging.error(f"Error in on_search: {str(e)}", exc_info=True)
        await self.emit(ERROR, {"message": f"Internal server error: {str(e)}"}, to=sid)

    async def on_send_message(self, sid: str, data) -> None:
        session = await self.get_session(sid)
        if not session: return await self.emit(ERROR, {"message":"Forbidden not authenticated"})
        chat = session.get("chat")
        if not chat: return await self.emit(ERROR, {"message":"Forbidden User does not have chat"})
        text = data.get("text")
        if not text: return await self.emit(ERROR, {"message":"Bad request, text is required"})
        admin_id = session["chat"]["admin_id"]
        await self.bot.send_message(chat_id=admin_id, text=str(text))
        await self.emit(SENT_MESSAGE, {"message":"Successfully sent message"}, to=sid)

    async def on_chat_close(self, sid: str, data) -> None:
        session = await self.get_session(sid)
        admin_id = session["chat"]["admin_id"]
        state = self.dp.fsm.get_context(
            bot=bot,
            user_id=admin_id,
            chat_id=admin_id
        )
        await state.clear()
        session.pop("chat")
        await self.save_session(sid, session)
        await self.bot.send_message(chat_id=admin_id, text="🦺 Юзер закрыл текущий чат!")
        await self.emit(CHAT_CLOSED, {"message":"Chat successfully closed!"}, to=sid)
            
chat_name_space = ChatNamespace(namespace="/chat", bot=bot, dp=dp)

sio.register_namespace(chat_name_space)

class ChatState(StatesGroup):
    chat = State()

async def on_accept(callback_query: CallbackQuery, callback_data: ChatAction, state: FSMContext, user: User):
    await callback_query.message.answer("🎯 *Вы успешно начали чат с юзером* \n_Чтобы остановить чат пропишите *exit*_")
    session = await chat_name_space.get_session(callback_data.sid)
    if not session:
        await callback_query.answer("🧳 Чат уже закрыт.")
        return await callback_query.message.delete()
    if session.get("chat"):
        await callback_query.answer("🧳 Чат уже занят.")
        return await callback_query.message.delete()
    await state.set_state(ChatState.chat)
    await state.set_data({"sid":callback_data.sid})
    session["chat"] = {"admin_id":callback_query.from_user.id}
    await chat_name_space.save_session(callback_data.sid, session)
    await sio.emit(CHAT_FOUND, {"admin_id":callback_query.from_user.id}, to=callback_data.sid)
    await callback_query.message.delete()

async def on_message(message: Message, state: FSMContext, bot: Bot):
    minio = await get_minio_instance()
    user_sid = await state.get_value("sid")
    if not user_sid:
        return await message.answer("error")
    text = message.text or message.caption
    photo = message.photo
    if photo:
        photo = photo[0]
        file = await bot.download(photo)
        file.seek(0)
        await minio.put_object(PHOTOS_BUCKET, f"{photo.file_id}.jpeg", file, file.getbuffer().nbytes, content_type="image/jpeg")
        photo = await minio.presigned_get_object(PHOTOS_BUCKET, f"{photo.file_id}.jpeg")
    if text == "exit":
        await state.clear()
        session = await chat_name_space.get_session(user_sid)
        session.pop("chat")
        await chat_name_space.save_session(user_sid, session)
        return await chat_name_space.emit(CHAT_CLOSED, {"message":"Chat closed by admin"}, to=user_sid)
    await chat_name_space.emit(NEW_MESSAGE, {"text":text, "photo":photo}, to=user_sid)

def register_chat_handlers(router: Router):
    router.callback_query.register(on_accept, ChatAction.filter()) 
    router.message.register(on_message, ChatState.chat)
 
