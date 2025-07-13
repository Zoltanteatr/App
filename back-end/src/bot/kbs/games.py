from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import InlineKeyboardMarkup
from ..filters.callback_data import YesNoAction, TipAction, ChatAction, StagePosition

DEMO_GAME_STAGE_ADD = "demo_game_stage_add"

STAGE_PREV_TRUE = "stage_prev_true"
STAGE_PREV_FALSE = "stage_prev_false"
STAGE_LAST = "stage_last"

CANCEL = "cancel"

def demo_game_kb() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="➕ Добавить стадию", callback_data=DEMO_GAME_STAGE_ADD)
    builder.button(text="❌ Отменить создание демо игры", callback_data=CANCEL)
    builder.adjust(1)
    return builder.as_markup()

def stage_position_choose() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="⤵️ Идет после правильного ответа", callback_data=StagePosition(answer=True))
    builder.button(text="⤴️ Идет после не правильного ответа", callback_data=StagePosition(answer=False))
    builder.button(text="🔚 Это последняя стадия", callback_data=StagePosition(end=True))
    builder.button(text="↪️ Продолжить", callback_data=StagePosition(is_continue=True))
    builder.button(text="❌ Отменить создание демо игры", callback_data=CANCEL)
    builder.adjust(1)
    return builder.as_markup()

def is_test_kb() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="Да", callback_data=YesNoAction(decide=True))
    builder.button(text="Нет", callback_data=YesNoAction(decide=False))
    return builder.as_markup()

def tip_kb() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="Создать еще одну подсказку ➕", callback_data=TipAction(is_continue=True))
    builder.button(text="Продолжить ↪️", callback_data=TipAction(is_continue=False))
    return builder.as_markup()

def cancel() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="Отменить создание игры ☁️", callback_data=CANCEL)
    return builder.as_markup()

def accept_chat(sid) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.button(text="Принять", callback_data=ChatAction(sid=sid))
    return builder.as_markup()
