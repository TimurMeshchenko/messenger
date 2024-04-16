# messenger

# Настройка mongodb

mongosh 
use messenger
db.createCollection("chats")
db.createCollection("chats_users")
db.createCollection("messages")

cd mongodb_backup
mongorestore --db=messenger .

# Запуск

sudo poetry install
cd src
sudo poetry run python -m uvicorn main:app --reload
sudo poetry run ./run_with_reload.sh

# cron задача по очистке бд

crontab -e

0 0 * * * python /path/to/cron_clear_collections.py

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
