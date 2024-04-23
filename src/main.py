from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect

from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.mount("/messenger/static", StaticFiles(directory="static"), name="static")
app.mount("/messenger/media", StaticFiles(directory="media"), name="media")

templates = Jinja2Templates(directory="../templates")

mongo_uri = f'mongodb://{os.getenv("DB_HOST")}:{os.getenv("DB_PORT")}'

connections = {}

class MongoDBConnection:
    def __init__(self, mongo_uri):
        self.mongo_uri = mongo_uri
        self.client = None

    async def __aenter__(self):
        self.client = AsyncIOMotorClient(self.mongo_uri)
        return self.client

    async def __aexit__(self, *args):
        self.client.close()

@app.get("/")
async def main(request: Request):        
    context = {"request": request}
    return templates.TemplateResponse("main.html", context)

@app.get("/api/is_user_exists")
async def is_user_exists(user_id: str):   
    async with MongoDBConnection(mongo_uri) as client:
        db = client.get_database("messenger")
        chats_users_collection = db.get_collection("chats_users")
        chat_user = await chats_users_collection.find_one({"user_id": user_id})
        return bool(chat_user)

@app.get("/api/get_chats")
async def get_chats(request: Request, user_id: str):        
    async with MongoDBConnection(mongo_uri) as client:
        db = client.get_database("messenger")
        chats_collection = db.get_collection("chats")
        chats_users_collection = db.get_collection("chats_users")
        messages_collection = db.get_collection("messages")
        chats_users_cursor = chats_users_collection.find({"user_id": user_id})
        chats = []
        async for document in chats_users_cursor:
            chat = await chats_collection.find_one({"_id": document['chat_id']})
            chat_name = await chats_users_collection.find_one({
                "chat_id": document['chat_id'],
                "user_id": { "$ne": user_id }
            })
            last_message = await messages_collection.find_one({"chat_id": chat['_id']}, sort=[("_id", -1)]) or {}
            chats.append(
                {
                    'chat_id': str(chat['_id']),
                    'chat_name': chat_name['user_id'] if chat_name else chat['name'], 
                    'last_message_content': last_message['content'] if 'content' in last_message else "", 
                    'last_message_date': last_message['created_at'].strftime("%b %d") if 'created_at' in last_message else ""
                }
            )
        context = {'request': request, 'chats': chats}
        return templates.TemplateResponse("chat.html", context).body.decode()
    
@app.get("/api/get_messages")
async def get_messages(request: Request, chat_id: str, user_id: str):        
    async with MongoDBConnection(mongo_uri) as client:
        try:
            chat_id = ObjectId(chat_id)
        except:
            return ''        
        db = client.get_database("messenger")
        chats_users_collection = db.get_collection("chats_users")
        user_chat_participant = await is_user_chat_participant(chats_users_collection, chat_id, user_id)
        
        if not user_chat_participant:
            return ''

        messages_collection = db.get_collection("messages")
        messages = []
        messages_cursor = messages_collection.find({"chat_id": chat_id})

        async for document in messages_cursor:
            hours = document['created_at'].strftime("%H")
            minutes = document['created_at'].strftime("%M")
            AM_or_PM = document['created_at'].strftime("%p")
            created_at = f"{hours}:{minutes} {AM_or_PM}"
            messages.append(
                {
                    'content': document['content'], 
                    'created_at': created_at,
                    'message_owner': document['user_id'] == user_id, 
                    'datetime': document['created_at'],
                }
            )
        context = {'request': request, 'messages': messages}
        return templates.TemplateResponse("messages.html", context).body.decode()

async def is_user_chat_participant(chats_users_collection, chat_id: str, user_id: str):   
        chat_user = await chats_users_collection.find_one(
            {
                "chat_id": chat_id, 
                "user_id": user_id
            }
        )
        return bool(chat_user)

@app.post("/api/create_chat")
async def create_chat(chat_name: str):        
    async with MongoDBConnection(mongo_uri) as client:
        db = client.get_database("messenger")
        chats_collection = db.get_collection("chats")
        new_chat = await chats_collection.insert_one({"name": chat_name})
        return str(new_chat.inserted_id)
    
@app.post("/api/create_chat_user")
async def create_chat_user(user_id: str, chat_id: str):        
    async with MongoDBConnection(mongo_uri) as client:
        db = client.get_database("messenger")
        chats_users_collection = db.get_collection("chats_users")
        await chats_users_collection.insert_one({
            "user_id": user_id, 
            "chat_id": ObjectId(chat_id)
        })

@app.post("/api/create_message")
async def create_message(request: Request, user_id: str, chat_id: str):        
    async with MongoDBConnection(mongo_uri) as client:
        db = client.get_database("messenger")
        messages_collection = db.get_collection("messages")
        data = await request.json()
        await messages_collection.insert_one({
            "user_id": user_id, 
            "content": data,
            "chat_id": ObjectId(chat_id),
            "created_at": datetime.now()
        })

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str) -> None:
    await websocket.accept()
    connections[user_id] = websocket
    try:
        while True:
            data = await websocket.receive_json()
            if data.get('type') and data['type'] == 'reload':
                if data['user_id'] not in connections:
                    continue
                await connections[data['user_id']].send_json({
                    "type": "reload",
                    "chat_id": data['chat_id']
                })
                return None

            for recipient_id in [user_id, data['recipient_id']]:
                if recipient_id in connections:
                    await connections[recipient_id].send_json({
                        "user_id": user_id,
                        "content": data['content'],
                        "chat_id": data['chat_id'],
                    }) 
    except WebSocketDisconnect:
        del connections[user_id]