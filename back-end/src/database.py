from tortoise import Tortoise

async def init_db(url: str):
    # Init tortoise db
    await Tortoise.init(
        db_url=url,
        modules={'models': ['auth.models', 'games.models']}
    )
    await Tortoise.generate_schemas()
