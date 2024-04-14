#!/bin/bash

# Function to restart Gunicorn
restart_gunicorn() {
    echo "Restarting Gunicorn..."
    pkill -f uvicorn
    uvicorn main:app &
}

# Start Gunicorn
uvicorn main:app &

# Watch for changes in the project directory and restart Gunicorn when necessary
while inotifywait -r -e modify,move,create,delete /home/deb/Python/pet_projects/messenger; do 
    restart_gunicorn
done