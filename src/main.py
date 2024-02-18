from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

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
    return templates.TemplateResponse("main.html", context)

@app.get("/api/get_chats")
async def get_chats(request: Request, user_id: str):        
    async with MongoDBConnection(mongo_uri) as client:
        db = client.get_database("messenger")
        chats_collection = db.get_collection("chats")
        chats = []
        chats_users_collection = db.get_collection("chats_users")
        chats_users_cursor = chats_users_collection.find({"user_id": user_id})
        async for document in chats_users_cursor:
            chat = await chats_collection.find_one({"_id": ObjectId(document['chat_id'])})
            chats.append({str(chat['_id']): chat['name']})
        context = {'request': request, 'chats': chats}
        return templates.TemplateResponse("chat.html", context).body.decode()
    
@app.get("/api/get_messages")
async def get_messages(request: Request, chat_id: str, user_id: str):        
    async with MongoDBConnection(mongo_uri) as client:
        db = client.get_database("messenger")
        messages_collection = db.get_collection("messages")
        messages = []
        messages_cursor = messages_collection.find({"chat_id": ObjectId(chat_id)})
        async for document in messages_cursor:
            messages.append(
            {
                'content': document['content'], 
                'created_at': document['created_at'],
                'message_owner': document['user_id'] == user_id, 
            }
        )
        context = {'request': request, 'messages': messages}
        return templates.TemplateResponse("messages.html", context).body.decode()
    
async def processing_documents():
    async with MongoDBConnection(mongo_uri) as client:
        db = client.get_database("messenger")
        message_collection = db.get_collection("message")

        # message_collection.insert_one({"abc": "a"})
        # message_collection.insert_many([{"abc": "a"}])
        # message_collection.delete_one({"abc": "a"})
        # message_collection.update_one(
        #     {"abc": "a"},
        #     {"abc": "b"}
        # )
        cursor = message_collection.find()
        # cursor = message_collection.find({"a": "1", "b": "2"})
        async for document in cursor:
            print(document)