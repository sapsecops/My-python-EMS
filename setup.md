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
# Frontend

```
SSH into the Frontend instance.

Install Node.js, npm, and Nginx.

Clone your frontend code repository.

Edit src/config.js and set API_URL to the Backend instance's Private IP.

Install dependencies: npm install.

Create a production build: npm run build.

sudo rm -rf /usr/share/nginx/html/*
sudo mv build/* /usr/share/nginx/html/
RUN chmod -R 755 /usr/share/nginx/html

Configure Nginx to serve the contents of the build directory. This makes your React app accessible via the instance's public IP.
```
