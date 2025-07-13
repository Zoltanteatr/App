from config import MinioSettings
from miniopy_async import Minio

PHOTOS_BUCKET = "photos"
VIDEOS_BUCKET = "videos"

async def get_minio_instance(server_url: str = MinioSettings.server_url) -> Minio:
    minio = Minio(
        f"{MinioSettings.host}:{MinioSettings.port}",
        secure=False,
        access_key=MinioSettings.access_key,
        secret_key=MinioSettings.secret_key, 
        server_url=server_url,
    )
    if not await minio.bucket_exists(VIDEOS_BUCKET):
        await minio.make_bucket(VIDEOS_BUCKET)
    if not await minio.bucket_exists(PHOTOS_BUCKET):
        await minio.make_bucket(PHOTOS_BUCKET)
    return minio
