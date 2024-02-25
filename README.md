# messenger

poetry run python -m uvicorn main:app --reload
sudo poetry run ./reload.sh

from datetime import datetime
created_at datetime.now()

db.messages.insertOne({
    "user_id": "1",
    "content": "2",
    "chat_id": "1",
    "created_at": "abc"
})
db.chats.insertOne({
    "name": "chat_name"
})
db.chats_users.insertOne({
    "user_id": "1",
    "chat_id": "1"
})

db.messages.updateOne( 
    {"chat_id": '1'}, 
    {"$set": {"chat_id": ObjectId('65d220a834ddb6612a2b67a2')}} 
)

db.messages.updateOne( 
    {"created_at": ISODate('2024-02-25T06:29:49.048Z')}, 
    {"$set": {"created_at": "abc"}} 
)
