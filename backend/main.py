from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, PrimaryKeyConstraint
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, Session
from fastapi.middleware.cors import CORSMiddleware

DATABASE_URL = "sqlite:///./reactions.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


class Base(DeclarativeBase):
    pass


class Reaction(Base):
    __tablename__ = "reactions"

    post_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    emoji = Column(String, nullable=False)

    __table_args__ = (PrimaryKeyConstraint("post_id", "user_id"),)


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_EMOJIS = ["👍", "❤️", "🤔", "🔥", "💡"]


def get_counts(db: Session, post_id: str) -> dict[str, int]:
    reactions = db.query(Reaction).filter(Reaction.post_id == post_id).all()
    counts: dict[str, int] = {e: 0 for e in DEFAULT_EMOJIS}
    for r in reactions:
        if r.emoji in counts:
            counts[r.emoji] += 1
    return counts


class ReactionRequest(BaseModel):
    user_id: str
    emoji: str  # empty string means remove current reaction


@app.get("/api/reactions/{post_id}")
def get_reactions(post_id: str):
    with Session(engine) as db:
        return {"counts": get_counts(db, post_id)}


@app.post("/api/reactions/{post_id}")
def update_reaction(post_id: str, req: ReactionRequest):
    with Session(engine) as db:
        existing = (
            db.query(Reaction)
            .filter(Reaction.post_id == post_id, Reaction.user_id == req.user_id)
            .first()
        )

        if req.emoji == "" or (existing and existing.emoji == req.emoji):
            # Remove reaction (toggle off)
            if existing:
                db.delete(existing)
        else:
            if existing:
                existing.emoji = req.emoji
            else:
                db.add(Reaction(post_id=post_id, user_id=req.user_id, emoji=req.emoji))

        try:
            db.commit()
        except SQLAlchemyError as e:
            db.rollback()
            raise HTTPException(status_code=500, detail="Database error") from e

        # Determine the user's current reaction without a second query
        if req.emoji == "" or (existing and existing.emoji == req.emoji):
            current_emoji = None
        else:
            current_emoji = req.emoji

        return {
            "counts": get_counts(db, post_id),
            "user_reaction": current_emoji,
        }


@app.get("/health")
def health():
    return {"status": "ok"}
