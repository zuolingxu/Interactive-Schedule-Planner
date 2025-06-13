from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 初始化数据库
def init_db():
    conn = sqlite3.connect('schedule.db')
    cursor = conn.cursor()

    # 创建用户表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
    ''')

    # 创建事件表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        time TEXT NOT NULL,
        event_name TEXT NOT NULL,
        priority TEXT NOT NULL,
        tags TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    conn.commit()
    conn.close()

# 用户注册
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = sqlite3.connect('schedule.db')
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
        conn.commit()
        return jsonify({'message': '用户注册成功！'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'message': '用户名已存在！'}), 400
    finally:
        conn.close()

# 用户登录
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = sqlite3.connect('schedule.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM users WHERE username = ? AND password = ?', (username, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({'message': '登录成功！', 'user_id': user[0]}), 200
    else:
        return jsonify({'message': '用户名或密码错误！'}), 401

# 添加事件
@app.route('/events', methods=['POST'])
def add_event():
    data = request.json
    user_id = data.get('user_id')
    time = data.get('time')
    event_name = data.get('event_name')
    priority = data.get('priority')
    tags = data.get('tags')

    conn = sqlite3.connect('schedule.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO events (user_id, time, event_name, priority, tags)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, time, event_name, priority, tags))
    conn.commit()
    conn.close()

    return jsonify({'message': '事件添加成功！'}), 201

# 查询事件
@app.route('/events/<int:user_id>', methods=['GET'])
def get_events(user_id):
    conn = sqlite3.connect('schedule.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM events WHERE user_id = ?', (user_id,))
    events = cursor.fetchall()
    conn.close()

    return jsonify(events), 200

# 删除事件
@app.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    conn = sqlite3.connect('schedule.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM events WHERE id = ?', (event_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': '事件删除成功！'}), 200

# 更新事件
@app.route('/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    data = request.json
    time = data.get('time')
    event_name = data.get('event_name')
    priority = data.get('priority')
    tags = data.get('tags')

    conn = sqlite3.connect('schedule.db')
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE events
        SET time = ?, event_name = ?, priority = ?, tags = ?
        WHERE id = ?
    ''', (time, event_name, priority, tags, event_id))
    conn.commit()
    conn.close()

    return jsonify({'message': '事件更新成功！'}), 200

if __name__ == '__main__':
    init_db()  # 初始化数据库
    app.run(debug=True)