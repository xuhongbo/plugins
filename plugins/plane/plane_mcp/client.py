"""Plane client initialization for MCP server."""

import os
from typing import NamedTuple

from fastmcp.server.auth.auth import AccessToken
from fastmcp.server.dependencies import get_access_token
from fastmcp.utilities.logging import get_logger
from plane import PlaneClient

logger = get_logger(__name__)

DEFAULT_PLANE_BASE_URL = "https://plane.ledupeiyou.com"
DEFAULT_PLANE_WORKSPACE_SLUG = "ledu"


class PlaneClientContext(NamedTuple):
    """Context containing Plane client and workspace information."""

    client: PlaneClient
    workspace_slug: str


def configured_env(name: str, default: str = "") -> str:
    value = os.getenv(name, default)
    if value == "${" + name + "}":
        return default
    return value


def get_plane_client_context() -> PlaneClientContext:
    """
    Initialize and return a PlaneClient instance with workspace context.

    Authentication is handled by the PlaneOAuthProvider, which supports:
    1. Environment variables (PLANE_API_KEY + PLANE_WORKSPACE_SLUG)
    2. HTTP headers (x-api-key + x-workspace-slug)
    3. OAuth access token

    Environment variables:
    - PLANE_INTERNAL_BASE_URL: Internal URL for Plane API (preferred for server-to-server calls)
    - PLANE_BASE_URL: Base URL for Plane API (fallback, default: https://api.plane.so)

    Returns:
        PlaneClientContext containing configured PlaneClient instance and workspace slug

    Raises:
        ConfigurationError: If access token is not available or workspace slug is missing
    """
    base_url = configured_env("PLANE_INTERNAL_BASE_URL") or configured_env("PLANE_BASE_URL", DEFAULT_PLANE_BASE_URL)
    workspace_slug = configured_env("PLANE_WORKSPACE_SLUG", DEFAULT_PLANE_WORKSPACE_SLUG)

    api_key = configured_env("PLANE_API_KEY", "")
    access_token = configured_env("PLANE_ACCESS_TOKEN") or None

    # Get access token from the OAuth provider (which handles all auth methods)
    stored_access_token: AccessToken | None = get_access_token()
    if stored_access_token:
        # Determine authentication method to use appropriate PlaneClient constructor
        auth_method = stored_access_token.claims.get("auth_method", "oauth")
        token = stored_access_token.token
        workspace_slug = stored_access_token.claims.get("workspace_slug", "")

        # For API key auth methods, use api_key parameter; for OAuth, use access_token
        if auth_method in ("api_key_env", "api_key_header"):
            api_key = token
        else:
            access_token = token

    if access_token:
        client = PlaneClient(
            base_url=base_url,
            access_token=access_token,
        )
    else:
        client = PlaneClient(
            base_url=base_url,
            api_key=api_key,
        )

    return PlaneClientContext(
        client=client,
        workspace_slug=workspace_slug,
    )
