from .schemas import BaseGame, FullGame, BaseDemo
from .models import Game, DemoGame
from aiogram.utils.deep_linking import create_start_link
from bot.bot import bot
 
async def build_game_response(game: Game) -> BaseGame:
    """
    Helper for response building Game
    """
    url = await game.get_photo_url()
    basegame = BaseGame.from_orm(game)
    return basegame.copy(update={"photo_url":url})

async def build_demo_game_response(game: DemoGame) -> BaseDemo:
    """
    Helper for response building Demo Game
    """
    url = await game.get_photo_url()
    basedemo = BaseDemo.from_orm(game)
    return basedemo.copy(update={"photo_url":url})

async def build_full_game_response(game: Game) -> FullGame:
    """
    Helper for response building FullGame
    """
    photo_url = await game.get_photo_url()
    video_url = await game.get_video_url()
    fullgame = FullGame.from_orm(game)
    return fullgame.copy(update={"photo_url":photo_url, "video_url":video_url, "buy_url":await create_start_link(bot, game.id)})
