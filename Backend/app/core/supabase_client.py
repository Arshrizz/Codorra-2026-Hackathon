import httpx

from app.core.config import get_settings

_client: httpx.AsyncClient | None = None


def _build_headers() -> dict[str, str]:
    s = get_settings()
    return {
        "apikey": s.supabase_service_role_key,
        "Authorization": f"Bearer {s.supabase_service_role_key}",
        "Content-Type": "application/json",
    }


async def init_client() -> None:
    global _client
    s = get_settings()
    _client = httpx.AsyncClient(
        base_url=f"{s.supabase_url}/rest/v1",
        headers=_build_headers(),
        timeout=10.0,
    )


async def close_client() -> None:
    global _client
    if _client:
        await _client.aclose()
        _client = None


def get_client() -> httpx.AsyncClient:
    if _client is None:
        raise RuntimeError("Supabase client not initialized — call init_client() first")
    return _client
