import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

_SERVICE_ACCOUNT_PATH = os.path.join(
    os.path.dirname(__file__), "firebase_service_account.json"
)

if not firebase_admin._apps:
    cred = credentials.Certificate(_SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)

security = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    token = credentials.credentials
    try:
        decoded = auth.verify_id_token(token)
        return {"uid": decoded["uid"], "email": decoded.get("email", "")}
    except Exception:
        raise HTTPException(status_code = 401, detail = "Invalid or expired token")
