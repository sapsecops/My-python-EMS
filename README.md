# Server A (Frontend)

```
cd frontend
npm install
npm run build
Copy build/ to /var/www/html or Nginx root
```

# Server B (Backend)

```
cd backend
pip install -r requirements.txt
python manage.py migrate
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

# Server C (MongoDB)
```
mongod --auth --bind_ip 0.0.0.0
Create DB and user with credentials in .env

```

# use Nginx for Backend and Frontend

2️⃣ Server B — Backend (Django API)

We’ll run Django with Gunicorn behind Nginx.

Gunicorn service /etc/systemd/system/gunicorn.service

```
sudo vim /etc/systemd/system/gunicorn.service
```
```
[Unit]
Description=Gunicorn instance to serve Django
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/employee-app/backend
ExecStart=/usr/bin/gunicorn --workers 3 --bind unix:/opt/employee-app/backend/gunicorn.sock backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

Nginx config /etc/nginx/sites-available/backend

```
sudo vim /etc/nginx/sites-available/backend
```

```
server {
    listen 80;
    server_name backend-server-domain;

    location / {
        include proxy_params;
        proxy_pass http://unix:/opt/employee-app/backend/gunicorn.sock;
    }

    location /media/ {
        alias /opt/employee-app/backend/media/;
    }

    location /static/ {
        alias /opt/employee-app/backend/static/;
    }
}
```

Enable and restart:

```
sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled
sudo systemctl restart nginx
sudo systemctl enable gunicorn
```


3️⃣ Server A — Frontend (React build)

Nginx config /etc/nginx/sites-available/frontend

```
sudo vim /etc/nginx/sites-available/frontend
```
```
server {
    listen 80;
    server_name frontend-server-domain;

    root /var/www/employee-frontend;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    # Allow CORS to call backend API
    location /api/ {
        proxy_pass http://backend-server-domain/api/;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS';
        add_header Access-Control-Allow-Headers 'Content-Type, Authorization';
    }
}
```

Deploy React build:

```
npm run build
sudo mkdir -p /var/www/employee-frontend
sudo cp -r build/* /var/www/employee-frontend/
```

Final DNS/Connection Setup

Frontend calls backend via config.js:

```
const config = {
  API_BASE_URL: "http://backend-server-domain/api"
};
```

Backend connects to MongoDB in config.py:

```
MONGO_DB_CONFIG = {
    "HOST": "mongodb://mongo_user:StrongPassword123@mongo-server-ip:27017/employeedb",
    "NAME": "employeedb"
```
