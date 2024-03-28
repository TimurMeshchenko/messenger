import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def clear_collections():
    # Connect to MongoDB
    client = AsyncIOMotorClient('mongodb://localhost:27017')
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
