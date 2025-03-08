# start tmux session 

tmux new-session -d -s "extension"

cd backend && source venv/bin/activate &&  python3 asgi.py 

&& cd ../extension-react && npm start