from bot.main import start_telegram_bot

from config import Settings, TelegramSettings

from database import init_db

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from games.router import games_api_router
from auth.router import auth_api_router

from realtime.chat import socket_app

from aiogram import Bot
from aiogram.client.default import DefaultBotProperties

import asyncio

async def on_startup():
    pgsql_url = "asyncpg://{}:{}@{}:{}/{}".format(
        Settings.pgsql_user,
        Settings.pgsql_password,
        Settings.pgsql_host,
        Settings.pgsql_port,
        Settings.pgsql_name,
    )
    await init_db(pgsql_url)
    asyncio.ensure_future(start_telegram_bot())

app = FastAPI(on_startup=[on_startup], root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter()
api_router.include_router(games_api_router)
api_router.include_router(auth_api_router)
app.include_router(api_router)
app.mount("/", socket_app)



