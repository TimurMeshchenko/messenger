import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def clear_collections():
    client = AsyncIOMotorClient(f'mongodb://{os.getenv("DB_HOST")}:{os.getenv("DB_PORT")}')
    db = client['messenger']
    collections = await db.list_collection_names()
    for collection_name in collections:
        await db[collection_name].delete_many({})
    client.close()

asyncio.run(clear_collections())
