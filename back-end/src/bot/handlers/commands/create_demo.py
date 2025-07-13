from aiogram.types import Message, CallbackQuery
from aiogram import Router, F, Bot
from ...filters.callback_data import TipAction, StagePosition
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from ...kbs.games import DEMO_GAME_STAGE_ADD, demo_game_kb, cancel as game_create_cancel, tip_kb, stage_position_choose
from aiogram.filters.command import Command
from games.models import GameTip, Game, Stage, DemoGame

from bot.mtproto import download_media_to_minio
from minio import VIDEOS_BUCKET, PHOTOS_BUCKET

import logging

class DemoGameCreateStates(StatesGroup):
    name = State()
    description = State()
    photo = State()
    video = State()
    tips = State()
    answer = State()
    stage_position = State()
    delete = State()

async def main_menu(message: Message, state: FSMContext) -> str:
    game = await state.get_value("game", None)
    stages_string = "_пусто_"
    if game:
        stages = game.stages
        if not isinstance(stages, tuple):
            stages = await game.stages.all()
        stages_string = "\n".join([f"{idx + 1}. {stage.id}" for idx, stage in enumerate(stages)])
    response = (
        f"🕹 Игра: {game.id}\n"
        "💾 Стадии:\n"
        f"{stages_string}"
    )
    return await message.answer(response, reply_markup=demo_game_kb())
    
async def create_demo_game(message: Message, state: FSMContext):
    response = (
        "📝 *Отправьте название игры*\n"
        "_Чтобы отменить создание игры нажмите кнопку снизу_"
    )
    await state.set_state(DemoGameCreateStates.name)
    await message.answer(response, reply_markup=game_create_cancel())

async def demo_name_handler(message: Message, state: FSMContext):
    name = message.text
    await state.update_data({"name":name})
    response = (
        "📄 *Отправьте описание игры*\n"
        "_Чтобы отменить создание игры нажмите на кнопку снизу_"
    )
    await state.set_state(DemoGameCreateStates.description)
    await message.answer(response, reply_markup=game_create_cancel())

async def demo_description_handler(message: Message, state: FSMContext):
    description = message.text
    await state.update_data({"description":description})
    response = (
        "📸 *Отправьте превью фото игры*\n"
        "_Чтобы отменить создание игры нажмите на кнопку снизу_"
    )
    await state.set_state(DemoGameCreateStates.photo)
    await message.answer(response, reply_markup=game_create_cancel())

async def demo_preview_photo_handler(message: Message, bot: Bot, state: FSMContext):
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
    data = await state.get_data()
    game = await DemoGame.create(**data)
    await state.set_data({"game":game})
    await main_menu(message, state)

async def add_demo_stage(callback_query: CallbackQuery, state: FSMContext):
    response = (
        "🎞 *Отправьте видео игры*\n"
        "_Чтобы отменить создание игры нажмите на кнопку снизу_"
    )
    await state.set_state(DemoGameCreateStates.video)
    await callback_query.message.answer(response, reply_markup=game_create_cancel())
    await callback_query.answer()

async def handle_demo_video(message: Message, state: FSMContext):
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
        "🧐 *Добавить или создать подсказку? (Необязательно)*\n"
        "_Если вы добавили все подсказки нажмите продолжить или если хотите пропустить этот этап_"
    )
    await state.set_state(DemoGameCreateStates.tips)
    await message.answer(response, reply_markup=tip_kb())

async def tip_demo_handler(message: Message, state: FSMContext):
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

async def tip_demo_is_continue_handler(callback_query: CallbackQuery, callback_data: TipAction, state: FSMContext):
    current_state = await state.get_state()
    logging.critical(f"{current_state}, {callback_data}")
    if current_state == DemoGameCreateStates.tips and not callback_data.is_continue:
        response = (
            "🗳 *Отправьте правильный ответ игры*\n"
            "_Чтобы отменить создание игры нажмите на кнопку снизу_"
        )
        await state.set_state(DemoGameCreateStates.answer)
        await callback_query.message.answer(response, reply_markup=game_create_cancel())
        await callback_query.message.delete()
    else:
        response = (
            "💡 *Отправьте контент подсказки*\n"
             "_Чтобы отменить создание игры нажмите на кнопку снизу_"
        )
        await callback_query.message.answer(response, reply_markup=game_create_cancel())
        await callback_query.message.delete()

async def answer_demo_handler(message: Message, state: FSMContext):
    answer = message.text
    await state.update_data({"answer":answer})
    data = await state.get_data() 
    tips = data.get("tips")
    if tips: data.pop("tips")
    game = data.get("game")
    logging.critical(data)
    stage = await Stage.create(**data)
    if tips:
        for tip in tips:
            await GameTip.create(content=tip["content"], stage=stage)
    stages_count = len(await game.stages.all())
    if stages_count > 1:
        await state.update_data({"stage":stage})
        return await message.answer("Какая позиция у стадии?", reply_markup=stage_position_choose())
    else:
        stage.start = True
        await stage.save()
    await state.set_data(data)
    await main_menu(message, state)

async def stage_position_type(callback_query: CallbackQuery, callback_data: StagePosition, state: FSMContext):
    await callback_query.answer()
    if callback_data.is_continue:
        return await main_menu(callback_query.message, state) 
    if callback_data.end:
        stage = await state.get_value("stage")
        stage.end = True
        await stage.save()
        return await main_menu(callback_query.message, state)
    await state.update_data({"position":callback_data}) 
    await state.set_state(DemoGameCreateStates.stage_position)
    response = (
        "ℹ️ *Отправьте айди стадии после которой будет эта стадия*\n"
        "_Вы можете найти айди игр выше_"
    )
    await callback_query.message.answer(response, reply_markup=game_create_cancel())
 
async def stage_position_handler(message: Message, state: FSMContext):
    prev_stage = await Stage.get_or_none(id=message.text)
    data = await state.get_data()
    demo_game = data["game"]
    position = data["position"]
    stage = data["stage"]
    if position.answer: stage.prev_true = prev_stage
    if not position.answer: stage.prev_false = prev_stage
    await stage.save()
    await message.answer("Какая позиция у стадии?", reply_markup=stage_position_choose())

def register_create_demo_command(router: Router) -> None:
    router.message.register(create_demo_game, Command("createdemo"))
    router.message.register(demo_name_handler, DemoGameCreateStates.name)
    router.message.register(demo_preview_photo_handler, DemoGameCreateStates.photo)
    router.message.register(demo_description_handler, DemoGameCreateStates.description)
    router.callback_query.register(tip_demo_is_continue_handler, DemoGameCreateStates.tips, TipAction.filter())
    router.message.register(answer_demo_handler, DemoGameCreateStates.answer)
    router.message.register(handle_demo_video, DemoGameCreateStates.video)
    router.message.register(tip_demo_handler, DemoGameCreateStates.tips)
    router.message.register(stage_position_handler, DemoGameCreateStates.stage_position)
    router.callback_query.register(stage_position_type, StagePosition.filter())
    router.callback_query.register(add_demo_stage, F.data == DEMO_GAME_STAGE_ADD)
   
