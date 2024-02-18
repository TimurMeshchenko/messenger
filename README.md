# messenger

poetry run python -m uvicorn main:app --reload
sudo poetry run ./reload.sh


user_id от js
chat_id генерировать _id: ObjectId() или обновлять после добавления

from datetime import datetime
created_at datetime.now()

db.messages.insertOne({
    "user_id": "1",
    "content": "message_content",
    "chat_id": "1",
    "created_at": "2024-02-18"
})
db.chats.insertOne({
    "name": "chat_name"
})
db.chats_users.insertOne({
    "user_id": "1",
    "chat_id": "1"
})

db.messages.updateOne( { "chat_id": '1' }, { "$set": { "chat_id": ObjectId('65d220a834ddb6612a2b67a2') } } )
