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

poetry install
cd src
poetry run python -m uvicorn main:app --reload --port 8003
poetry run ./run_with_reload.sh

# cron задача по очистке бд

Установить в глобальное окружение 
python-dotenv, motor.

crontab -e

```bash
* * * * 0 python /path/to/cron_clear_collections.py
```

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

# Webpack optimization

docker build -f Dockerfile.webpack -t messenger_webpack .
docker run --name messenger_webpack_container -p 8080:8080 -v ./optimized:/app/optimized -v ./webpack.config.js:/app/webpack.config.js -d messenger_webpack
sudo docker exec -it messenger_webpack_container bash

npx webpack

sudo docker stop messenger_webpack_container
sudo docker rm messenger_webpack_container
sudo docker rmi messenger_webpack