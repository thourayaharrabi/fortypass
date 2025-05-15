from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_url_path='')

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

from datetime import datetime
import json
import os
import re

PASSWORD_HISTORY_FILE = 'password_history.json'

def load_password_history():
    if os.path.exists(PASSWORD_HISTORY_FILE):
        with open(PASSWORD_HISTORY_FILE, 'r') as f:
            return json.load(f)
    return []

def save_password_history(email, strength, score):
    history = load_password_history()
    history.append({
        'email': email,
        'strength': strength,
        'score': score,
        'date': datetime.now().isoformat()
    })
    with open(PASSWORD_HISTORY_FILE, 'w') as f:
        json.dump(history[-10:], f)  # Keep last 10 entries

@app.route('/api/check-password', methods=['POST'])
def check_password():
    data = request.json
    password = data.get('password', '')
    email = data.get('email', '')

    # OWASP Password strength checks
    strength_criteria = {
        'length': len(password) >= 12,
        'lowercase': bool(re.search(r'[a-z]', password)),
        'uppercase': bool(re.search(r'[A-Z]', password)),
        'numbers': bool(re.search(r'\d', password)),
        'special_chars': bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password)),
        'no_common': not any(common in password.lower() for common in ['password', '123456', 'qwerty', 'admin']),
        'no_repeating': not bool(re.search(r'(.)\1{2,}', password)),
        'no_sequential': not bool(re.search(r'(abc|bcd|cde|def|efg|123|234|345|456)', password.lower())),
    }
    score = sum(strength_criteria.values())
    strength = 'Weak'
    if score >= 6:
        strength = 'Strong'
    elif score >= 4:
        strength = 'Medium'

    save_password_history(email, strength, score)

    return jsonify({
        'score': score,
        'strength': strength,
        'criteria': strength_criteria
    })

if __name__ == '__main__':
    app.run(debug=True)