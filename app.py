from flask import Flask, render_template, request, jsonify, send_from_directory
import secrets
import string
import os

app = Flask(__name__)

def generate_password(length=12, use_upper=True, use_lower=True, use_digits=True, use_symbols=True):
    if length < 1:
        return ""
    alphabet = ""
    if use_upper:
        alphabet += string.ascii_uppercase
    if use_lower:
        alphabet += string.ascii_lowercase
    if use_digits:
        alphabet += string.digits
    if use_symbols:
        alphabet += "!@#$%^&*()-_=+[]{};:,.<>?/"
    if not alphabet:
        return ""
    # garante ao menos 1 caractere de cada categoria selecionada
    password_chars = []
    if use_upper:
        password_chars.append(secrets.choice(string.ascii_uppercase))
    if use_lower:
        password_chars.append(secrets.choice(string.ascii_lowercase))
    if use_digits:
        password_chars.append(secrets.choice(string.digits))
    if use_symbols:
        password_chars.append(secrets.choice("!@#$%^&*()-_=+[]{};:,.<>?/"))
    while len(password_chars) < length:
        password_chars.append(secrets.choice(alphabet))
    # embaralha usando SystemRandom
    secrets.SystemRandom().shuffle(password_chars)
    return ''.join(password_chars[:length])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json() or {}
    length = int(data.get("length", 12))
    use_upper = bool(data.get("upper", True))
    use_lower = bool(data.get("lower", True))
    use_digits = bool(data.get("digits", True))
    use_symbols = bool(data.get("symbols", True))
    pwd = generate_password(length, use_upper, use_lower, use_digits, use_symbols)
    return jsonify({"password": pwd})

# rota para favicon (opcional)
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

if __name__ == '__main__':
    app.run(debug=True)
