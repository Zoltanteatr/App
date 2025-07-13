from types import NoneType
from typing import Self
from tortoise import Model, fields
from aiogram.types import User as TelegramUser, file
from datetime import datetime

from tortoise.fields import data

from bot.bot import bot

from uuid import uuid4

from minio import get_minio_instance, PHOTOS_BUCKET

import logging

class Promo(Model):
    id = fields.UUIDField(default=uuid4, primary_key=True)
    code = fields.CharField(max_length=255)
    discount = fields.IntField(default=15)
    users: fields.ManyToManyRelation["User"]
    used_users: fields.ManyToManyRelation["User"]

class Subscription(Model):
    id = fields.UUIDField(default=uuid4, primary_key=True)
    expire = fields.DatetimeField(default=datetime.now)
    user = fields.OneToOneField("models.User", related_name="subscription")

class User(Model):
    id = fields.UUIDField(default=uuid4, primary_key=True)
    telegram_id = fields.BigIntField()
    balance = fields.DecimalField(max_digits=100, decimal_places=2, default=0.00)
    is_admin = fields.BooleanField(default=False)
    email = fields.CharField(max_length=255, null=True)
    phone = fields.CharField(max_length=255, null=True)
    avatar_path = fields.CharField(max_length=255, null=True)
    first_name = fields.CharField(max_length=255, null=True)
    username = fields.CharField(max_length=255, null=True)
    bought_games: fields.ReverseRelation["Game"]
    games: fields.ReverseRelation["Game"]
    results: fields.ReverseRelation["GameResult"]
    subscription: fields.OneToOneRelation["Subscription"]

    promos = fields.ManyToManyField("models.Promo", related_name="users")
    promos_used = fields.ManyToManyField("models.Promo", related_name="used_users", through="users_used_promos") 
   
    async def get_avatar_url(self) -> str:
        if not self.avatar_path: return self.avatar_path
        minio = await get_minio_instance()
        return await minio.presigned_get_object(
            PHOTOS_BUCKET,
            self.avatar_path
        )

    @staticmethod
    async def get_avatar_path_by_telegram(telegram_user: TelegramUser) -> str:
        photos = await telegram_user.get_profile_photos()
        if len(photos.photos) < 1:
            return
        photo_id = photos.photos[0][0].file_id
        result = await bot.download(photo_id)
        result.seek(0)
        minio = await get_minio_instance()
        filename = f"{photo_id}.jpg"
        await minio.put_object(
            PHOTOS_BUCKET, 
            filename, 
            result,
            result.getbuffer().nbytes,
            content_type="image/jpeg"
        )
        return filename

    @classmethod
    async def create_or_get_by_telegram(cls: Self, telegram_user: TelegramUser) -> Self:
        user = await cls.get_or_create(
            telegram_id=telegram_user.id,
            defaults={
                "avatar_path":await cls.get_avatar_path_by_telegram(telegram_user),
                "username":telegram_user.username,
                "first_name":telegram_user.first_name,
            }
        )
        logging.critical(user[0].subscription.exists())
        if user[0].subscription.exists():
            await Subscription.create(user=user[0])
        return user[0]

    class Meta:
        table = "users"

    def __str__(self):
        return f"<{self.id} {self.username or self.first_name} {self.telegram_id} {'admin' if self.is_admin else 'default'}>"

