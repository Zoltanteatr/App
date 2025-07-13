from fastapi import Header ,HTTPException, Depends, Query
from typing import Annotated

from aiogram.utils.web_app import check_webapp_signature, parse_webapp_init_data, WebAppUser
from json import JSONDecodeError

from config import TelegramSettings

async def user_init_data_validate(
    initdata: Annotated[str, Header()] = None,
) -> bool:
    if not initdata:
        raise HTTPException(status_code=400, detail="Please set Initdata header.")
    try:
        token = TelegramSettings.telegram_token
        result = check_webapp_signature(token=token, init_data=initdata)
        return result
    except JSONDecodeError:
        raise HTTPException(status_code=400, detail="Incorrect initdata.")

async def get_user_by_init_data(
    initdata: Annotated[str, Header()],
    result: Annotated[bool, Depends(user_init_data_validate)],
) -> WebAppUser:
    if not result:
        raise HTTPException(status_code=401, detail="Unauthorized initdata.")
    user = parse_webapp_init_data(init_data=initdata).user
    return user

async def get_user_id(
    user_id: Annotated[str, Query()]
):
    return user_id

