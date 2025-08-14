# Server A (Frontend)

```
cd frontend
sudo chown -R ec2-user:ec2-user /home/ec2-user/My-python-EMS
npm install
npm install axios
npm install react-scripts --save
npm run build
Copy build/ to /var/www/html or Nginx root
```

# Server B (Backend)

```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 manage.py makemigrations employees
python3 manage.py migrate
pip install gunicorn
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

# Docker

### Docker Backend

Dockerfile
```
# Use official Python image as base
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project
COPY . /app/

# Copy your environment variables (optional)
# COPY .env /app/

# Expose port 8000
EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
```
.dockerignore
```
__pycache__
*.pyc
*.pyo
*.pyd
*.sqlite3
env
venv
.env
build
dist
*.egg-info
```
Environment Variable Configuration
Create .env.sample file (not checked into source control) for MongoDB parameters:
```
MONGO_USER=appuser
MONGO_PASS=pa55Word
MONGO_HOST=AWS-DB-Private-IP
MONGO_DB=employeedb
```
Build the image:
```
docker build -t employee-backend:latest 
```

Run the container passing environment variables:

```
docker run -d -p 8000:8000 \
  -e MONGO_USER=appuser \
  -e MONGO_PASS=pa55Word \
  -e MONGO_HOST=AWS-DB-Private-IP \
  -e MONGO_DB=employeedb \
  --name employee-backend employee-backend:latest
```
