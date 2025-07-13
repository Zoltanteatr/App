from tortoise import Model, fields
from uuid import uuid4

from datetime import datetime

from minio import get_minio_instance, VIDEOS_BUCKET, PHOTOS_BUCKET

from minio import VIDEOS_BUCKET, PHOTOS_BUCKET, get_minio_instance

class Game(Model):
    id = fields.UUIDField(default=uuid4, primary_key=True)
    name = fields.CharField(max_length=255)
    description = fields.CharField(max_length=255)
    date = fields.DatetimeField()
    price = fields.DecimalField(max_digits=100, decimal_places=2)
    photo_path = fields.CharField(max_length=255)
    video_path = fields.CharField(max_length=255)
    video_consequences_path = fields.CharField(max_length=255)
    answer = fields.CharField(max_length=255)
    is_test = fields.BooleanField()
    owner: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField("models.User", related_name="games")
    tips: fields.ReverseRelation["GameTip"]
    results: fields.ReverseRelation["GameResult"]
    users: fields.ManyToManyRelation["User"] = fields.ManyToManyField("models.User", related_name="bougth_games")

    async def get_photo_url(self) -> str:
        """
        Generates http url for photo this game.
        :return: - http url to minio
        """
        minio = await get_minio_instance()
        return await minio.presigned_get_object(PHOTOS_BUCKET, self.photo_path)

    async def get_video_url(self) -> str:
        """
        Generates http url for video this game.
        :return: - http url to minio
        """
        minio = await get_minio_instance()
        return await minio.presigned_get_object(VIDEOS_BUCKET, self.video_path)
    
    async def get_video_consequences_url(self) -> str:
        """
        Generates http url for consequences video this game.
        :return: - http url to minio
        """
        minio = await get_minio_instance()
        return await minio.presigned_get_object(VIDEOS_BUCKET, self.video_consequences_path)


    def __str__(self):
        return f"<Game: {self.id, self.name}>"
        
    class Meta:
        table = "games"

class Stage(Model):
    """
    Stage for demo games
    """
    id = fields.UUIDField(default=uuid4, primary_key=True)
    start = fields.BooleanField(null=True)
    end = fields.BooleanField(null=True)
    prev_true: fields.OneToOneNullableRelation["Stage"] = fields.OneToOneField("models.Stage", related_name="next_true", null=True)
    prev_false: fields.OneToOneNullableRelation["Stage"] = fields.OneToOneField("models.Stage", related_name="next_false", null=True)
    next_false: fields.ReverseRelation["Stage"]
    next_true: fields.ReverseRelation["Stage"]
    video_path = fields.CharField(max_length=255)
    tips: fields.ReverseRelation["GameTip"]
    answer = fields.CharField(max_length=255)
    game: fields.ForeignKeyRelation["DemoGame"] = fields.ForeignKeyRelation("models.DemoGame", related_name="stages")

    async def get_video_url(self) -> str:
        """
        Generates http url for video this stage.
        :return: - http url to minio
        """
        minio = await get_minio_instance()
        return await minio.presigned_get_object(VIDEOS_BUCKET, self.video_path)

    def __str__(self) -> str:
        return f"<Stage: {self.id}>"

    class Meta:
        table = "stages"

class DemoGame(Model):
    id = fields.UUIDField(default=uuid4, primary_key=True)
    name = fields.CharField(max_length=255)
    description = fields.CharField(max_length=255)
    photo_path = fields.CharField(max_length=255)
    stages: fields.ReverseRelation["Stage"]

    async def get_photo_url(self) -> str:
        """
        Generates http url for photo this game.
        :return: - http url to minio
        """
        minio = await get_minio_instance()
        return await minio.presigned_get_object(PHOTOS_BUCKET, self.photo_path)

class GameResult(Model):
    id = fields.UUIDField(default=uuid4, primary_key=True)
    created_at = fields.DatetimeField(default=datetime.now)
    place = fields.IntField()
    points = fields.IntField()
    user: fields.ForeignKeyRelation["User"] = fields.ForeignKeyField("models.User", related_name="results")
    game: fields.ForeignKeyRelation["Game"] = fields.ForeignKeyField("models.Game", related_name="results")

class GameTip(Model):
    id = fields.UUIDField(default=uuid4, primary_key=True)
    content = fields.TextField()
    game: fields.ForeignKeyRelation[Game] = fields.ForeignKeyField("models.Game", related_name="tips", null=True)
    demo: fields.ForeignKeyRelation[DemoGame] = fields.ForeignKeyField("models.Stage", related_name="tips", null=True)

    class Meta:
        table = "game_tips"
    
    def __str__(self):
        return f"<{self.id} {self.content}>"


