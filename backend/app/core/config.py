from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Salary Management API"
    debug: bool = False
    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/salary_management"
    )
    test_database_url: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/test_db"
    )
    cors_origins: str = "http://localhost:5173"
    api_v1_prefix: str = "/api/v1"
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=("local.env", ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
