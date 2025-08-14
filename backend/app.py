# backend/app.py
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Enable CORS to allow requests from the React frontend
CORS(app) 

# --- Database Configuration ---
MONGO_USER = os.getenv('MONGO_USER')
MONGO_PASS = os.getenv('MONGO_PASS')
MONGO_HOST = os.getenv('MONGO_HOST')
MONGO_DB = os.getenv('MONGO_DB')

# Construct the connection string
MONGO_URI = f"mongodb://{MONGO_USER}:{MONGO_PASS}@{MONGO_HOST}:27017/{MONGO_DB}"

try:
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]
    users_collection = db['users']
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("✅ MongoDB connection successful.")
except Exception as e:
    print(f"❌ Could not connect to MongoDB: {e}")
    # Exit if DB connection fails on startup
    exit()

# --- API Routes ---

# GET all employees
@app.route('/api/employees', methods=['GET'])
def get_employees():
    employees = []
    for emp in users_collection.find():
        emp['_id'] = str(emp['_id']) # Convert ObjectId to string for JSON
        employees.append(emp)
    return jsonify(employees)

# POST a new employee
@app.route('/api/employees', methods=['POST'])
def add_employee():
    data = request.json
    try:
        # Convert salary to a number if it's a string
        data['salary'] = float(data.get('salary', 0))
    except (ValueError, TypeError):
        return jsonify({'error': 'Salary must be a valid number'}), 400
        
    result = users_collection.insert_one(data)
    new_employee = users_collection.find_one({'_id': result.inserted_id})
    new_employee['_id'] = str(new_employee['_id'])
    return jsonify(new_employee), 201

# PUT (update) an employee
@app.route('/api/employees/<id>', methods=['PUT'])
def update_employee(id):
    data = request.json
    # Remove the _id from the update payload if it exists
    data.pop('_id', None) 
    try:
        # Convert salary to a number if it's a string
        data['salary'] = float(data.get('salary', 0))
    except (ValueError, TypeError):
        return jsonify({'error': 'Salary must be a valid number'}), 400

    result = users_collection.update_one({'_id': ObjectId(id)}, {'$set': data})
    if result.matched_count == 0:
        return jsonify({'error': 'Employee not found'}), 404
    return jsonify({'message': 'Employee updated successfully'})

# DELETE an employee
@app.route('/api/employees/<id>', methods=['DELETE'])
def delete_employee(id):
    result = users_collection.delete_one({'_id': ObjectId(id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'Employee not found'}), 404
    return jsonify({'message': 'Employee deleted successfully'})

if __name__ == '__main__':
    # Use 0.0.0.0 to be accessible within the VPC
    app.run(host='0.0.0.0', port=5000)