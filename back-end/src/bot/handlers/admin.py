from aiogram.types import Message, CallbackQuery, message
from typing import cast

from aiogram import Router, F, Bot

from ..filters.callback_data import YesNoAction, TipAction, ChatAction
from ..kbs.games import is_test_kb, cancel as game_create_cancel, tip_kb, CANCEL

from aiogram import Router, F, Bot

from ..filters.callback_data import YesNoAction, TipAction, ChatAction
from ..kbs.games import is_test_kb, cancel as game_create_cancel, tip_kb
from aiogram.filters.command import Command

from games.models import Game, GameTip
from aiogram.filters.command import CommandObject
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.context import FSMContext

from .commands.create_demo import register_create_demo_command

from auth.models import User

from minio import PHOTOS_BUCKET, VIDEOS_BUCKET
from ..mtproto import download_media_to_minio

from minio import PHOTOS_BUCKET, VIDEOS_BUCKET
from ..mtproto import download_media_to_minio

from datetime import datetime

import re
import logging

float_pattern = r"^-?\d+\.\d+$"

class GameCreateStates(StatesGroup):
    is_test = State()
    name = State()
    description = State()
    preview_photo = State()
    video = State()
    consequences_video = State()
    price = State()
    tip = State()
    date = State()
    answer = State()

class ChatState(StatesGroup):
    chat = State()

async def cancel(callback_query: CallbackQuery, state: FSMContext):
    current_state = await state.get_state()
    if current_state is None:
        return
    await state.clear()
    await callback_query.message.answer("Отменено!")
    await callback_query.message.delete()

async def create_game(message: Message, state: FSMContext):
    response = (
        "🦺 *Тестовая ли игра?*\n"
        "_Чтобы ответить нажмите кнопки ниже_"
    )
    await state.set_state(GameCreateStates.is_test)
    await message.answer(response, reply_markup=is_test_kb())

async def is_test_handler(callback_query: CallbackQuery, callback_data: YesNoAction, state: FSMContext):
    decide = callback_data.decide
    await state.update_data({"is_test":decide})
    response = (
        "📝 *Отправьте название игры*\n"
        "_Чтобы отменить создание игры нажмите кнопку снизу_"
    )
    await state.set_state(GameCreateStates.name)
    await callback_query.message.answer(response, reply_markup=game_create_cancel())
    await callback_query.message.delete()

async def name_handler(message: Message, state: FSMContext):
    name = message.text
    await state.update_data({"name":name})
    response = (
        "📄 *Отправьте описание игры*\n"
        "_Чтобы отменить создание игры нажмите на кнопку снизу_"
    )
    await state.set_state(GameCreateStates.description)
    await message.answer(response, reply_markup=game_create_cancel())

async def description_handler(message: Message, state: FSMContext):
    description = message.text
    await state.update_data({"description":description})
    response = (
        "📸 *Отправьте превью фото игры*\n"
        "_Чтобы отменить создание игры нажмите на кнопку снизу_"
    )
    await state.set_state(GameCreateStates.preview_photo)
    await message.answer(response, reply_markup=game_create_cancel())

async def preview_photo_handler(message: Message, bot: Bot, state: FSMContext):
    file = await bot.get_file(message.photo[0].file_id)
    filename = file.file_path.split("/")[-1]
    extension = filename.split(".")[-1]
    minio_filename = f"{message.from_user.id}-{message.message_id}.{extension}"
    url = await download_media_to_minio(
        PHOTOS_BUCKET,
        message.from_user.id, 
        message.message_id, 
        minio_filename,
        "image/" + extension,
    )
    await state.update_data({"photo_path":minio_filename})
    response = (
        "🎞 *Отправьте видео игры*\n"
        "_Чтобы отменить создание игры нажмите на кнопку снизу_"
    )
    logging.critical(f"{url}")
    await state.set_state(GameCreateStates.video)
    await message.answer(response, reply_markup=game_create_cancel())

async def video_handler(message: Message, state: FSMContext): 
    await message.answer("⏳ Загружаю видео...")
    filename = message.video.file_name
    extension = filename.split(".")[-1]
    minio_filename = f"{message.from_user.id}-{message.message_id}.{extension}"
    url = await download_media_to_minio(
        VIDEOS_BUCKET,
        message.from_user.id, 
        message.message_id, 
        minio_filename,
        "video/" + extension,
    )
    await message.answer(f"📥 Видео загрузилось! [Клик чтобы проверить]({url})")
    await state.update_data({"video_path":minio_filename})
    response = (
        "🎞 *Отправьте видео последствий*\n"
        "_Чтобы отменить создание игры нажмите на кнопку снизу_"
    )
    await state.set_state(GameCreateStates.consequences_video)
    await message.answer(response, reply_markup=game_create_cancel())

async def video_consequences_handler(message: Message, state: FSMContext):
    await message.answer("⏳ Загружаю видео...")
    filename = message.video.file_name
    extension = filename.split(".")[-1]
    minio_filename = f"{message.from_user.id}-{message.message_id}.{extension}"
    url = await download_media_to_minio(
        VIDEOS_BUCKET,
        message.from_user.id, 
        message.message_id, 
        minio_filename,
        "video/" + extension,
    )
    await message.answer(f"📥 Видео загрузилось! [Клик чтобы проверить]({url})")
    await state.update_data({"video_consequences_path":minio_filename})
    response = (
        "🎞 *Отправьте видео последствий*\n"
        "_Чтобы отменить создание игры нажмите на кнопку снизу_"
    )
    await state.set_state(GameCreateStates.consequences_video)
    await message.answer(response, reply_markup=game_create_cancel())

async def video_consequences_handler(message: Message, state: FSMContext):
    await message.answer("⏳ Загружаю видео...")
    filename = message.video.file_name
    extension = filename.split(".")[-1]
    minio_filename = f"{message.from_user.id}-{message.message_id}.{extension}"
    url = await download_media_to_minio(
        VIDEOS_BUCKET,
        message.from_user.id, 
        message.message_id, 
        minio_filename,
        "video/" + extension,
    )
    await message.answer(f"📥 Видео загрузилось! [Клик чтобы проверить]({url})")
    await state.update_data({"video_consequences_path":minio_filename})
    response = (
        "💸 *Отправьте цену игры*\n"
        "_Чтобы отменить создание игры нажмите на кнопку снизу_"
    )
    await state.set_state(GameCreateStates.price)
    await message.answer(response, reply_markup=game_create_cancel())

async def price_handler(message: Message, state: FSMContext):
    price = message.text
    if not price.isdecimal() and not re.match(float_pattern, price):
        return await message.answer("Отправьте число!")
    await state.update_data({"price":float(price)})
    response = (
        "🧐 *Добавить или создать подсказку? (Необязательно)*\n"
        "_Если вы добавили все подсказки нажмите продолжить или если хотите пропустить этот этап_"
    )
    await state.set_state(GameCreateStates.tip)
    await message.answer(response, reply_markup=tip_kb())

async def tip_handler(message: Message, state: FSMContext):
    content = message.text
    data = await state.get_data()
    tips = data.get("tips")
    if not tips:
        data["tips"] = [{"content":content}]
    else:
        data["tips"].append({"content":content})
    await state.update_data(data)
    tips = "".join(["{}. {}\n".format(idx + 1, tip["content"]) for idx, tip in enumerate(data["tips"])])
    response = (
        "🧐 *Добавить или создать подсказку? (Необязательно)*\n"
        f"{tips}"
        "_Если вы добавили все подсказки нажмите продолжить или если хотите пропустить этот этап_"
    )
    await message.answer(response, reply_markup=tip_kb())

async def tip_is_continue_handler(callback_query: CallbackQuery, callback_data: TipAction, state: FSMContext):
    current_state = await state.get_state()
    if current_state == GameCreateStates.tip and not callback_data.is_continue:
        response = (
            "📅 *Отправьте дату игры*\n"
            "_В формате xx.xx.xxxx xx:xx (10.10.2010 06:48)_\n"
            "_Чтобы отменить создание игры нажмите на кнопку снизу_"
        )
        await state.set_state(GameCreateStates.date)
        await callback_query.message.answer(response, reply_markup=game_create_cancel())
        await callback_query.message.delete()
    else:
        response = (
            "💡 *Отправьте контент подсказки*\n"
             "_Чтобы отменить создание игры нажмите на кнопку снизу_"
        )
        await callback_query.message.answer(response, reply_markup=game_create_cancel())
        await callback_query.message.delete()
 
async def date_handler(message: Message, state: FSMContext):
    try:
        date = datetime.strptime(message.text, "%d.%m.%Y %H:%M")
        if date < datetime.now():
            return await message.answer("Вы не можете указать прошлое время.")
    except ValueError:
        return await message.answer("Некоректная дата!")
    await state.update_data({"date":date})
    response = (
        "🗳 *Отправьте правильный ответ игры*\n"
        "_Чтобы отменить создание игры нажмите на кнопку снизу_"
    )
    await state.set_state(GameCreateStates.answer)
    await message.answer(response, reply_markup=game_create_cancel())

async def answer_handler(message: Message, state: FSMContext, user: User):
    answer = message.text
    await state.update_data({"answer":answer})
    data = await state.get_data() 
    tips = data.get("tips")
    if tips: data.pop("tips")
    game = await Game.create(owner=user,**data)
    if tips:
        for tip in tips:
            await GameTip.create(content=tip["content"], game=game)
    response = (
        "🎉 *Вы успешно создали игру!*\n"
        f"ID: {game.id}"
    )
    await message.answer(response)
    await state.clear()

async def chat(callback_query: CallbackQuery, callback_data: ChatAction, state: FSMContext, user: User):
    await callback_query.message.answer("Вы успешно начали чат с юзером. Просто отправьте сообщение.\nЧтобы остановить чат пропишите *exit*")
    await state.set_state(ChatState.chat)
    await state.set_data({"sid":callback_data.sid})
    chats.update({callback_data.sid:user})
    await sio.emit("chat-started", to=callback_data.sid)
    await callback_query.message.delete()

async def chat_message(message: Message, state: FSMContext):
    data = await state.get_data()
    text = message.text
    if text == "exit":
        await message.answer("Вы остановили чат.")
        chats.pop(data["sid"])
        await state.clear()
        return await sio.emit("chat-ended", to=data["sid"])
    logging.critical(data["sid"])
    await sio.emit("chat-message", {"content":text}, to=data["sid"])

async def check_game(message: Message, command: CommandObject):
    game_id = command.args
    if not game_id:
        return await message.answer("Укажите уникальный индетификатор игры: /checkgame :gameid:")
    game = await Game.get_or_none(id=game_id).prefetch_related("results", "owner")
    if not game:
        return await message.answer("Такой игры не существует.")
    response = (
        f"🧩 Игра: {game.name}\n"
        f"👥 Всего игроков: {len(game.results)}\n"
        f"📅 Дата: {game.date.strftime('%d.%m.%Y')}\n"
        f"👤 Создатель: @{game.owner.username}\n"
        "🏆 Лидерборд:"
    )
    results = game.results
    for result in results[:9]:
        user = await result.user.first()
        response += f"\n{result.place}. @{user.username} - {result.points} очков"
    await message.answer(response)

async def admin(message: Message):
    response = (
        "👋 Привет! Админ панель:\n"
        "/creategame - создание игры\n"
        "/createdemo - создание демо игры\n"
        "/checkgame <game-id> - просмотр статистики игры"
    )
    await message.answer(response)

def register_admin_handlers(router: Router):
    router.message.register(check_game, Command("checkgame"))
    router.message.register(create_game, Command("creategame")) 
    router.message.register(admin, Command("admin"))
    router.callback_query.register(cancel, F.data == CANCEL)
    router.callback_query.register(is_test_handler, GameCreateStates.is_test, YesNoAction.filter())
    router.callback_query.register(tip_is_continue_handler, GameCreateStates.tip, TipAction.filter())
    router.message.register(name_handler, GameCreateStates.name)
    router.message.register(description_handler, GameCreateStates.description)
    router.message.register(preview_photo_handler, GameCreateStates.preview_photo, F.photo)
    router.message.register(video_handler, GameCreateStates.video, F.video)
    router.message.register(video_consequences_handler, GameCreateStates.consequences_video, F.video)
    router.message.register(price_handler, GameCreateStates.price)
    router.message.register(tip_handler, GameCreateStates.tip)
    router.message.register(date_handler, GameCreateStates.date)
    router.message.register(answer_handler, GameCreateStates.answer)
    router.callback_query.register(chat, ChatAction.filter()) 
    router.message.register(chat_message, ChatState.chat)
    register_create_demo_command(router)
