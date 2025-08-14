# Install DB

# Install Mongo DB
## Launch EC2 "t2.micro" Instance and In Sg, Open port "27017" for MongoDB
### Create mondDB repo in YUM repository
```
sudo vim /etc/yum.repos.d/mongodb-org-8.0.repo
```
### Add MongoDB repo Details 
```
[mongodb-org-8.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2023/mongodb-org/8.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-8.0.asc
```
### Install mongoDB
```
sudo yum update -y
sudo yum install -y mongodb-org
```
### Start mongoDB
```
sudo systemctl daemon-reload
sudo systemctl enable mongod
sudo systemctl start mongod
sudo systemctl status mongod
```
## Setup MongoDB

#### Allow Remote Access
```
sudo vim /etc/mongod.conf
```
Replace 0.0.0.0 in bindIp
```
# network interfaces 
    net:   
       port: 27017   
       bindIp: 0.0.0.0 # to bind to all interfaces
```
##### Restart mongoDB
```
sudo systemctl restart mongod
```
### Use mongo-compass in your Local Machine and try to access your MongoDB
```
mongodb://<your-AWS-Public-IP>:27017
```
### Using Mongo-Compose create DB "employeedb" and Collection "employee"

<img width="1103" height="528" alt="image" src="https://github.com/user-attachments/assets/4ad6e0a7-bd5d-4bf3-9068-69eb63e18bd4" />
<img width="577" height="432" alt="image" src="https://github.com/user-attachments/assets/bc64c51c-765d-42d0-afef-a9fe788faa01" />
<img width="1383" height="382" alt="image" src="https://github.com/user-attachments/assets/9ca73003-bb27-4d0c-a9d5-ec1154b70608" />



### Login to your mongoDB and Create application user
```
mongosh
```
### switch to admin user

```
use admin
```
### switch to employeedb DB

```
use employeedb
```
### Create Application User

```
db.createUser({
  user: "appuser",
  pwd: "pa55Word",
  roles: [
    { role: "readWrite", db: "employeedb" }
  ]
});
```

# Server B (Backend)
### Install python
```
sudo yum update -y
sudo yum install git -y
sudo yum install python3 -y
sudo yum install python3-pip -y
```

git clone 

```
git clone https://github.com/sapsecops/My-python-EMS.git
cd My-python-EMS
```
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 manage.py makemigrations employees
python3 manage.py migrate
pip install gunicorn
gunicorn employee_backend.wsgi:application --bind 0.0.0.0:8000
```
# Server A (Frontend)

### Install Node.js
```
sudo yum install git -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 16
```

```
cd frontend
sudo chown -R ec2-user:ec2-user /home/ec2-user/My-python-EMS
npm install
```

Install nginx 
```
sudo yum install nginx -y
```
1️⃣ Create public/index.html

Create public folder if it doesn’t exist:

mkdir -p public


Then create index.html:
```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Employee Frontend</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```
```
npm run build
```
Copy build/ to /var/www/html or Nginx root
```
sudo rm -rf /usr/share/nginx/html/*
sudo cp -r build/* /usr/share/nginx/html/
sudo systemctl restart nginx
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
