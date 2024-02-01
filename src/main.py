from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from contextlib import asynccontextmanager
from typing import Generator
from motor.motor_asyncio import AsyncIOMotorClient

# message_collection = None

# @asynccontextmanager
# async def lifespan(app: FastAPI) -> Generator:  
#     global message_collection
    
#     client = AsyncIOMotorClient("mongodb+srv://matsuokisho:K3XLsuQDyBMUXVHU@cluster0.yxmkutf.mongodb.net/?retryWrites=true&w=majority")
#     db = client.get_database("messenger")
#     message_collection = db.get_collection("message")

#     yield

app = FastAPI()

app.mount("/static", StaticFiles(directory=f"static"), name="static")
app.mount("/media", StaticFiles(directory=f"media"), name="media")

templates = Jinja2Templates(directory="../templates")

client = AsyncIOMotorClient("mongodb+srv://matsuokisho:K3XLsuQDyBMUXVHU@cluster0.yxmkutf.mongodb.net/?retryWrites=true&w=majority")
db = client.get_database("messenger")
message_collection = db.get_collection("message")


@app.get("/")
async def main(request: Request):        
    context = {"request": request}

    return templates.TemplateResponse("main.html", context)

async def get_documents():
    cursor = message_collection.find()
    documents = await cursor.to_list(length=None)
    return documents 


# create
# message_collection.insert_one({"abc": "a"})
