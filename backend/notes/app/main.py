from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



from sqlalchemy.orm import Session

from .ai import summarize_text
from .database import Base, engine, SessionLocal

from .models import Note
from .schemas import NoteCreate
from .routers.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:3000", "https://www.wellington.codes"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


app.include_router(auth_router)


@app.get("/")
def root():
	return {
		"message": "Backend running"
	}

@app.get("/notes")
def get_notes():
	db: Session = SessionLocal()
	#return [{ "id": 1, "content": str("test"), "summary": str("test summary") }]
	notes = db.query(Note).all()

	db.close()

	return notes



@app.post("/notes")
def create_note(note: NoteCreate):
	db: Session = SessionLocal()

	db_note = Note(


		content=note.content
	)

	db.add(db_note)

	db.commit()
	db.refresh(db_note)

	db.close()

	return db_note

@app.post("/notes/{note_id}/summarize")
def summarize_note(note_id: int):

	db: Session = SessionLocal()

	note = db.query(Note).filter(
		Note.id == note_id
	).first()

	if not note:
		return {
			"error": "Note not found"
		}

	summary = summarize_text(note.content)

	note.summary = summary

	db.commit()
	db.refresh(note)

	db.close()

	return note

@app.get("/health")
def health():
	return {"status": "ok"}