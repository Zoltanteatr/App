from fastapi import APIRouter, HTTPException, Path, Query, Body
from .models import Game, GameResult, DemoGame, Stage
from auth.models import User
from typing import List, Annotated
from .schemas import BaseGame, FullGame, AnswerInBase, AnswerOut, GameResultOut, BaseDemo, FullDemo, FullStage, UUID4, AnswerIn
from .services import build_game_response, build_full_game_response, build_demo_game_response
from datetime import datetime

import asyncio

games_api_router = APIRouter(prefix="/games")

def _get_points_by_place(place: int) -> int:
    if place == 1: return 100
    if place == 2: return 50
    if place == 3: return 25
    if place <= 20: return 10
    return 5

@games_api_router.get("/demo", response_model=List[BaseDemo])
async def read_demo_games() -> List[BaseDemo]:
    games = await DemoGame.all()
    return await asyncio.gather(*[build_demo_game_response(game) for game in games])

@games_api_router.get("/demo/{game_id}", response_model=FullDemo)
async def read_demo_game(
    game_id: Annotated[UUID4, Path(description="ID from the demo.")]
) -> FullDemo:
    game = await DemoGame.get_or_none(id=game_id).prefetch_related("stages")
    if not game:
        raise HTTPException(status_code=404, detail="Demo game not found!")
    stages = [
        FullStage(
            id=stage.id,
            video_url=await stage.get_video_url(),
            tips=await stage.tips.all(),
            next_correct_answer=await stage.next_true.first(),
            next_wrong_answer=await stage.next_false.first(),
            end=stage.end,
            start=stage.start,
        ) for stage in game.stages
    ]
    return FullDemo(id=game.id,stages=stages)

@games_api_router.get("/", response_model=List[BaseGame], description="Returns all games")
async def read_games(
    until_today: Annotated[bool, Query(description="All games until today.")] = False,    
):
    query = Game.filter(date__lte=datetime.now()) if until_today else Game.all()
    games = await query.prefetch_related("owner")
    return await asyncio.gather(*[build_game_response(game) for game in games])

@games_api_router.get("/{game_id}", response_model=FullGame)
async def read_game(game_id: Annotated[UUID4, Path(description="ID from the game.")]):
    game = await Game.get(id=game_id).prefetch_related("owner", "tips")
    return await build_full_game_response(game)

@games_api_router.post("/{game_id}/answer", response_model=AnswerOut)
async def answer(
    game_id: Annotated[UUID4, Path(description="ID from the game.")], 
    answer: Annotated[AnswerIn, Body(description="Payload for the game, contains 'telegram_id', 'answer'")]
):
    user = await User.get_or_none(telegram_id=answer.telegram_id)
    if not user: raise HTTPException(status_code=401, detail="User doesn't exists.")
    game = await Game.get_or_none(id=game_id).prefetch_related("users")
    if not game:
        raise HTTPException(status_code=404, detail="Game doesn't exists")
    if user not in game.users and user.subscription.expire < datetime.now(): 
        raise HTTPException(status_code=403, detail="The user did not buy this game")
    if game.answer.lower() == answer.answer.lower():
        result = await GameResult.get_or_none(user=user, game=game)
        if result:
            raise HTTPException(status_code=403, detail="The user has already responded to the game")
        result_count = await GameResult.all().count()
        place = result_count + 1
        result = await GameResult.create(place=place, points=_get_points_by_place(place), user=user, game=game)
        await result.save()
        video_consequences = await game.get_video_consequences_url()
        return AnswerOut(success=True, consequences_video=video_consequences, place=place, points=_get_points_by_place(place))
    return AnswerOut(success=False)

@games_api_router.post("/stage/{stage_id}/answer", response_model=AnswerOut)
async def answer_stage(
    stage_id: Annotated[UUID4, Path(description="ID from the stage.")], 
    answer: Annotated[AnswerInBase, Body(description="Payload for the answer, contains 'answer'")]
):
    stage = await Stage.get_or_none(id=stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found.")
    if stage.answer.lower() == answer.answer.lower(): return AnswerOut(success=True)
    return AnswerOut(success=False)

@games_api_router.get("/{game_id}/leaderboard")
async def read_game_leaderboard(
    game_id: Annotated[UUID4, Path(description="ID from the game.")]
) -> List[GameResultOut]:
    game = await Game.get_or_none(id=game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game doesn't exists")
    game_results = await GameResult.filter(game=game).all().prefetch_related("user")
    return game_results
