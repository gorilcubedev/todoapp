from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

todos = [
    {
        "id": 1, 
        "title": "TODO LİST", 
        "completed": False, 
        "deadline_date": None, 
        "deadline_time": None, 
        "priority": "medium"
    },
    {
        "id": 2, 
        "title": "BACKEND python, FRONTEND react", 
        "completed": False, 
        "deadline_date": None, 
        "deadline_time": None, 
        "priority": "low"
    }
]

current_id = 2

@app.route('/todos', methods=['GET'])
def get_todos():
    """Tüm todo'ları getir"""
    return jsonify(todos)

@app.route('/todos', methods=['POST'])
def add_todo():
    """Yeni todo ekle"""
    global current_id
    data = request.json
    
    if not data or not data.get("title"):
        return jsonify({"error": "Title is required"}), 400
    
    title = data.get("title")
    deadline_date = data.get("deadline_date")
    deadline_time = data.get("deadline_time")
    priority = data.get("priority", "medium")  # Default to medium 

    current_id += 1
    todo = {
        "id": current_id,
        "title": title,
        "completed": False,
        "deadline_date": deadline_date,
        "deadline_time": deadline_time,
        "priority": priority
    }
    
    todos.append(todo)
    print(f"Added new todo: {todo}")  
    return jsonify(todo), 201

@app.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Todo sil"""
    global todos
    initial_length = len(todos)
    todos = [t for t in todos if t["id"] != todo_id]
    
    if len(todos) == initial_length:
        return jsonify({"error": "Todo bulunamadı"}), 404
    
    print(f"Deleted todo with id: {todo_id}")  
    return jsonify({"message": "Todo silindi"}), 200

@app.route('/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Todo güncelle"""
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    for todo in todos:
        if todo["id"] == todo_id:

            if "title" in data:
                todo["title"] = data["title"]
            if "completed" in data:
                todo["completed"] = data["completed"]
            if "deadline_date" in data:
                todo["deadline_date"] = data["deadline_date"]
            if "deadline_time" in data:
                todo["deadline_time"] = data["deadline_time"]
            if "priority" in data:
                todo["priority"] = data["priority"]
            
            print(f"Updated todo: {todo}")  
            return jsonify(todo)
    
    return jsonify({"error": "Todo bulunamadı"}), 404

@app.route('/todos/status', methods=['GET'])
def get_status():
    """API durumunu kontrol et"""
    return jsonify({
        "status": "running",
        "total_todos": len(todos),
        "message": "Flask Todo API is working!"
    })

if __name__ == '__main__':
    print("Starting Flask Todo API on http://localhost:5000")
    print(f"Initial todos count: {len(todos)}")
    app.run(port=5000, debug=True)