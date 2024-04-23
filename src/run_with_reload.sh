#!/bin/bash

# Function to restart Gunicorn
restart_gunicorn() {
    echo "Restarting Gunicorn..."
    pkill -f uvicorn
    uvicorn main:app --port 8003 &
}

# Start Gunicorn
uvicorn main:app --port 8003 &

# Watch for changes in the project directory and restart Gunicorn when necessary
while inotifywait -r -e modify,move,create,delete /home/deb/Python/pet_projects/messenger; do 
    restart_gunicorn
done