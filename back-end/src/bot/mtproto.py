from hydrogram import Client
from hydrogram.types import Message
from hydrogram.raw.types import InputMessageID
from hydrogram.raw.functions.messages.get_messages import GetMessages
from config import TelegramSettings

from io import BytesIO

from minio import get_minio_instance

# Hydrogram mtrpoto provider

client = Client(
    "bot", 
    TelegramSettings.api_id, 
    TelegramSettings.api_hash, 
    bot_token=TelegramSettings.telegram_token
) 

async def get_message_by_id(app: Client, user_id: int, message_id: int) -> Message:
    """
    Get message by id from telegram chats or user
    """
    return (await app.get_messages(user_id, message_ids=[message_id]))[0]

async def download_media_from_message(app: Client, message: Message, in_memory: bool = True) -> BytesIO:
    """
    Download media from message telegram: Video, Photo.
    """
    data = await app.download_media(message=message, in_memory=in_memory)
    data.seek(0)
    return data

async def upload_to_minio(bucket: str, filename: str, data: BytesIO, content_type: str) -> str:
    """
    Uploads file to minio and returns presigned url this file
    """
    minio = await get_minio_instance()
    await minio.put_object(bucket, filename, data, data.getbuffer().nbytes, content_type=content_type)
    return await minio.presigned_get_object(bucket, filename)

async def download_media_to_minio(bucket: str, user_id: int, message_id: int, filename: str, content_type: str) -> str:
    """
    Download file and upload it to minio
    """
    async with client as app:
        message = await get_message_by_id(app, user_id, message_id)
        data = await download_media_from_message(app, message)
        return await upload_to_minio(bucket, filename, data, content_type)
