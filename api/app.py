from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import redis
import os

# 1. .env dosyasındaki gizli şifreleri yükle
load_dotenv()

app = Flask(__name__)

# 2. Şifreleri Ortam Değişkenlerinden Al (Kodun içinde şifre yok!)
db_user = os.getenv('DB_USER')
db_pass = os.getenv('DB_PASS')
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME')
secret_key = os.getenv('SECRET_KEY')
redis_url = os.getenv('REDIS_URL')

# 3. Flask Ayarları
app.config['SECRET_KEY'] = secret_key
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{db_user}:{db_pass}@{db_host}/{db_name}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Redis Session Ayarları (Oturum Yönetimi)
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_REDIS'] = redis.from_url(redis_url)

# Başlatıcılar
db = SQLAlchemy(app)
server_session = Session(app)
CORS(app, supports_credentials=True) # Frontend ile iletişim izni

# --- VERİTABANI MODELİ ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

# --- ROTALAR (Endpoints) ---

# Kayıt Ol (Register)
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Eksik bilgi'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Kullanıcı zaten var'}), 400

    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Kullanıcı oluşturuldu'}), 201

# Giriş Yap (Login)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):
        session['user_id'] = user.id
        session['username'] = user.username
        return jsonify({'message': 'Giriş başarılı', 'user': user.username}), 200
    
    return jsonify({'error': 'Hatalı kullanıcı adı veya şifre'}), 401

# Oturum Kontrolü (Sayfa yenilenince hatırla)
@app.route('/api/check-session', methods=['GET'])
def check_session():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'authenticated': False}), 401
    return jsonify({'authenticated': True, 'username': session.get('username')}), 200

# Çıkış Yap (Logout)
@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return jsonify({'message': 'Çıkış yapıldı'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Tablolar yoksa oluştur
    app.run(host='127.0.0.1', port=5001)