import os
from cryptography.fernet import Fernet, InvalidToken
from fastapi import HTTPException

def _get_fernet() -> Fernet:
    secret = os.environ.get("API_KEY_ENCRYPTION_KEY")
    if not secret:
        raise RuntimeError("API_KEY_ENCRYPTION_KEY is not set in environment")
    return Fernet(secret.encode())

def encrypt_key(raw_key: str) -> str:
    """Encrypt a plaintext API key. Returns a string safe to store in DB."""
    f = _get_fernet()
    return f.encrypt(raw_key.encode()).decode()

def decrypt_key(encrypted_key: str) -> str:
    """Decrypt a stored API key. Raises 500 if key or token is invalid."""
    f = _get_fernet()
    try:
        return f.decrypt(encrypted_key.encode()).decode()
    except InvalidToken:
        raise HTTPException(status_code=500, detail="Failed to decrypt API key")