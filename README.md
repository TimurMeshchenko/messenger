# messenger

# создание бд

mongosh 
use messenger
db.createCollection("chats")
db.createCollection("chats_users")
db.createCollection("messages")

cd mongodb_backup
mongorestore --db=messenger .

# Запуск

poetry run python -m uvicorn main:app --reload
sudo poetry run ./reload.sh

# cron задача по очистке бд

crontab -e

0 0 * * * /path/to/python3 /path/to/cron_clear_collections.py

# mongosh комманды

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