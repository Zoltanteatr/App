from pydantic import BaseModel

from pydantic_settings import BaseSettings, SettingsConfigDict


class _MinioSettings(BaseSettings):
    """
    Contains minio secrets and server url for presigned getting.
    """
    access_key: str
    secret_key: str

    host: str
    port: int
    console_port: int

    server_url: str

    model_config = SettingsConfigDict(
        env_nested_delimiter="_", env_nested_max_split=1, env_prefix="MINIO_"
    )

class _Settings(BaseSettings):
    """
    Default settings
    """
    debug: bool

    allowed_origins: str

    app_url: str
 
    pgsql_user: str
    pgsql_name: str
    pgsql_host: str
    pgsql_password: str
    pgsql_port: int

    provider_token: str

class _TelegramSettings(_Settings):
    """
    Telegram tokens and api's secrets for mtproto
    """
    telegram_token: str
    telegram_parse_mode: str

    api_id: str
    api_hash: str

Settings = _Settings()
TelegramSettings = _TelegramSettings()
MinioSettings = _MinioSettings()
