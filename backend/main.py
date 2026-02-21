from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage: {post_id: {user_id: emoji}}
reactions_data: dict[str, dict[str, str]] = {}

DEFAULT_EMOJIS = ["👍", "❤️", "🤔", "🔥", "💡"]


def get_counts(post_id: str) -> dict[str, int]:
    user_reactions = reactions_data.get(post_id, {})
    counts: dict[str, int] = {e: 0 for e in DEFAULT_EMOJIS}
    for emoji in user_reactions.values():
        if emoji in counts:
            counts[emoji] += 1
    return counts


class ReactionRequest(BaseModel):
    user_id: str
    emoji: str  # empty string means remove current reaction


@app.get("/api/reactions/{post_id}")
def get_reactions(post_id: str):
    return {"counts": get_counts(post_id)}


@app.post("/api/reactions/{post_id}")
def update_reaction(post_id: str, req: ReactionRequest):
    if post_id not in reactions_data:
        reactions_data[post_id] = {}

    user_reactions = reactions_data[post_id]
    current = user_reactions.get(req.user_id)

    if req.emoji == "" or current == req.emoji:
        # Remove reaction (toggle off)
        user_reactions.pop(req.user_id, None)
    else:
        # Set new reaction (replaces old one automatically)
        user_reactions[req.user_id] = req.emoji

    return {
        "counts": get_counts(post_id),
        "user_reaction": user_reactions.get(req.user_id),
    }


@app.get("/health")
def health():
    return {"status": "ok"}
