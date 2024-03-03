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


<div style="z-index: 301;opacity: 1;display: block;top: 50%;left: 50%;transform: translate(-50%, -50%);height: 100%;overflow: auto;font-size: 16px;line-height: 22px;color: #868695;width: 100%;max-width: 100%;min-width: 320px;padding: 12px 16px 16px;position: fixed;background: #fff;border-radius: 12px 12px 0 0;box-shadow: 0 0 20px rgba(0,0,0,.2);">

<div class="overlay initially-hidden j-custom-overlay" style="z-index: 300;width: 100%;height: 100%;top: 0;left: 0;background: #242424;opacity: .3!important;position: fixed;"></div>