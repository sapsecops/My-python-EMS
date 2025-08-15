# DB
```
sudo vim /etc/mongod.conf
```

```
net:
  port: 27017
  bindIp: 0.0.0.0 # Allows connections from any IP within the VPC
```

```
mongosh
```
Connect to the admin database to create a user
```
use admin
```

Switch to your application's database
```
use user-account
```
Create a user with read/write access to the 'user-account' database
```
db.createUser({
  user: "appuser",
  pwd: "Pa55Word",
  roles: [
    { role: "readWrite", db: "user-account" }
  ]
});
```

// The 'users' collection will be created automatically
// when the backend inserts the first document.
// You can optionally create it explicitly:
```
db.createCollection("users")
```

# Backend
```
SSH into the Backend instance.

Install Python, pip, and Git.

Clone your backend code repository.

Create the .env file and fill it with the DB instance's Private IP and credentials.

Install dependencies: pip install -r requirements.txt.

Run the app using a production server like Gunicorn: gunicorn --bind 0.0.0.0:5000 app:app.

```

Add Backend to service

```
which gunicorn
sudo cp -r  ~/.local/bin/gunicorn /usr/local/bin/

```

```
sudo vim /etc/systemd/system/backend.service
```
```
[Unit]
Description=Gunicorn Flask App
After=network.target

[Service]
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/My-python-EMS/backend
ExecStart=/usr/local/bin/gunicorn --bind 0.0.0.0:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```
sudo systemctl daemon-reload
sudo systemctl enable backend
sudo systemctl start backend
sudo systemctl status backend
```

# Frontend

```
SSH into the Frontend instance.

Install Node.js, npm, and Nginx.

Clone your frontend code repository.

Edit src/config.js and set API_URL to the Backend instance's Private IP.

Install dependencies: npm install.

Create a production build: npm run build.

```

create nginx.conf for reverse proxy for Backend
```
#user  nobody;
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    # Gzip for faster frontend load
    gzip on;
    gzip_types text/plain application/javascript application/x-javascript text/javascript text/xml text/css application/xml;
    gzip_min_length 256;

    server {
        listen       80;
        server_name  localhost;

        # Root for React build files
        root   /var/www/frontend/;
        index  index.html index.htm;

        # Serve React app for all non-API routes
        location / {
            try_files $uri /index.html;
        }

        # Reverse proxy for backend API
        location /api/ {
            proxy_pass http://172.31.27.237:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Error pages
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
}
```

create frontend dir

```
sudo mkdir =p /var/www/frontend/
sudo chmod -R 755 /usr/share/nginx/html
```
```
npm run build
```

```
sudo rm -rf /var/www/frontend/*
sudo mv build/* /var/www/frontend/
sudo systemctl restart nginx
```
