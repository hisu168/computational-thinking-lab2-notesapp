from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from backend.database import engine, get_db
from backend import models
from backend.auth import verify_token
from backend.schemas import NoteCreate, NoteResponse

models.Base.metadata.create_all(bind = engine)

app = FastAPI(title = "NotesApp API")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)


# Public endpoints

@app.get("/")
def root():
    return {"message": "NotesApp API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


# Auth endpoints

@app.get("/auth/me")
def get_me(user: dict = Depends(verify_token)):
    return {"uid": user["uid"], "email": user["email"]}


# Notes endpoints

@app.post("/notes", response_model = NoteResponse, status_code = 201)
def create_note(
    body: NoteCreate,
    user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    note = models.Note(user_uid = user["uid"], content = body.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@app.get("/notes", response_model = List[NoteResponse])
def get_notes(
    user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    notes = (
        db.query(models.Note)
        .filter(models.Note.user_uid == user["uid"])
        .order_by(models.Note.created_at.desc())
        .all()
    )
    return notes


@app.delete("/notes/{note_id}", status_code = 204)
def delete_note(
    note_id: int,
    user: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    note = db.query(models.Note).filter(
        models.Note.id == note_id,
        models.Note.user_uid == user["uid"],
    ).first()

    if not note:
        raise HTTPException(status_code = 404, detail = "Note not found")

    db.delete(note)
    db.commit()