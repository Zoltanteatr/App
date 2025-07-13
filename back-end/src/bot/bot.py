from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties

from config import TelegramSettings

dp = Dispatcher() 
bot = Bot(TelegramSettings.telegram_token, default=DefaultBotProperties(parse_mode=TelegramSettings.telegram_parse_mode))



