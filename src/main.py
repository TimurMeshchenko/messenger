from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime

app = FastAPI()

app.mount("/static", StaticFiles(directory=f"static"), name="static")
app.mount("/media", StaticFiles(directory=f"media"), name="media")

templates = Jinja2Templates(directory="../templates")

mongo_uri = "mongodb://localhost:27017"

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
    # await processing_documents()
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
            chat = await chats_collection.find_one({"_id": ObjectId(document['chat_id'])})
            last_message = await messages_collection.find_one({"chat_id": chat['_id']}, sort=[("_id", -1)]) or {}
            chats.append(
                {
                    'chat_id': str(chat['_id']),
                    'chat_name': chat['name'], 
                    'last_message_content': last_message['content'] if 'content' in last_message else "", 
                    'last_message_date': last_message['created_at'].strftime("%b %d") if 'created_at' in last_message else ""
                }
            )
        context = {'request': request, 'chats': chats}
        return templates.TemplateResponse("chat.html", context).body.decode()
    
@app.get("/api/get_messages")
async def get_messages(request: Request, chat_id: str, user_id: str):        
    async with MongoDBConnection(mongo_uri) as client:
        db = client.get_database("messenger")
        messages_collection = db.get_collection("messages")
        messages = []
        try:
            messages_cursor = messages_collection.find({"chat_id": ObjectId(chat_id)})
        except:
            return ''
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

async def processing_documents():
    async with MongoDBConnection(mongo_uri) as client:
        db = client.get_database("messenger")
        message_collection = db.get_collection("messages")

        # message_collection.insert_one({"abc": "a"})
        # message_collection.insert_many([{"abc": "a"}])
        # message_collection.delete_one({"abc": "a"})
        # await message_collection.update_one(
        #     {"created_at": "abc"},
        #     {"$set": {"created_at": datetime.now()}}
        # )
        # cursor = message_collection.find()
        # cursor = message_collection.find({"a": "1", "b": "2"})
        # async for document in cursor:
        #     print(document)