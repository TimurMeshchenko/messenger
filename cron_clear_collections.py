import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def clear_collections():
    # Connect to MongoDB
    client = AsyncIOMotorClient(f'mongodb://{os.getenv("DB_HOST")}:{os.getenv("DB_PORT")}')
    db = client['messenger']
    
    # List all collection names
    collections = await db.list_collection_names()
    
    # Clear data from each collection
    for collection_name in collections:
        await db[collection_name].delete_many({})

    # Close the connection
    client.close()

# Run the asynchronous function
asyncio.run(clear_collections())
