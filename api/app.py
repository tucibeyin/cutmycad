from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import redis
import os
import datetime

load_dotenv()

app = Flask(__name__)

# --- AYARLAR ---
db_user = os.getenv('DB_USER')
db_pass = os.getenv('DB_PASS')
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME')
secret_key = os.getenv('SECRET_KEY')
redis_url = os.getenv('REDIS_URL')

app.config['SECRET_KEY'] = secret_key
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{db_user}:{db_pass}@{db_host}/{db_name}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_REDIS'] = redis.from_url(redis_url)

db = SQLAlchemy(app)
server_session = Session(app)
CORS(app, supports_credentials=True)

# --- DB MODELLERİ ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

# YENİ: Siparişler Tablosu
class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False) # Müşteri Adı
    service_type = db.Column(db.String(50), nullable=False)   # CNC, Lazer, 3D
    file_name = db.Column(db.String(255), nullable=False)     # Dosya adı
    status = db.Column(db.String(20), default='Bekliyor')     # Bekliyor, Fiyatlandı
    price = db.Column(db.Float, nullable=True)                # Verilen Fiyat
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# --- ROTALAR ---

# 1. Login/Register (Eski kodlar aynı)
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password: return jsonify({'error': 'Eksik bilgi'}), 400
    if User.query.filter_by(username=username).first(): return jsonify({'error': 'Kullanıcı zaten var'}), 400
    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Kullanıcı oluşturuldu'}), 201

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

@app.route('/api/check-session', methods=['GET'])
def check_session():
    user_id = session.get('user_id')
    if not user_id: return jsonify({'authenticated': False}), 401
    return jsonify({'authenticated': True, 'username': session.get('username')}), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return jsonify({'message': 'Çıkış yapıldı'}), 200

# --- YENİ: ADMİN SİPARİŞ YÖNETİMİ ---

# Tüm Siparişleri Getir
@app.route('/api/orders', methods=['GET'])
def get_orders():
    # Gerçek hayatta buraya "if user != admin return 403" eklenir
    orders = Order.query.order_by(Order.created_at.desc()).all()
    output = []
    for order in orders:
        output.append({
            'id': order.id,
            'customer': order.customer_name,
            'service': order.service_type,
            'file': order.file_name,
            'status': order.status,
            'price': order.price,
            'date': order.created_at.strftime("%d-%m-%Y %H:%M")
        })
    return jsonify(output), 200

# Fiyat Güncelle (Teklif Ver)
@app.route('/api/orders/<int:id>/quote', methods=['POST'])
def update_price(id):
    data = request.json
    new_price = data.get('price')
    
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Sipariş bulunamadı'}), 404
        
    order.price = new_price
    order.status = 'Fiyatlandı'
    db.session.commit()
    
    return jsonify({'message': 'Fiyat güncellendi'}), 200

# TEST İÇİN: Sahte Sipariş Oluşturucu
@app.route('/api/create-fake-orders', methods=['GET'])
def fake_orders():
    # Eğer hiç sipariş yoksa test verisi ekle
    if Order.query.count() == 0:
        o1 = Order(customer_name="Ahmet Yılmaz", service_type="CNC İşleme", file_name="motor_block_v2.step")
        o2 = Order(customer_name="Mehmet Demir", service_type="Lazer Kesim", file_name="flanş_3mm.dxf")
        o3 = Order(customer_name="Ayşe Kaya", service_type="3D Baskı", file_name="prototype_case.stl")
        db.session.add_all([o1, o2, o3])
        db.session.commit()
        return jsonify({'message': '3 adet test siparişi oluşturuldu'}), 201
    return jsonify({'message': 'Zaten siparişler var'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Yeni tabloları oluşturur
    app.run(host='127.0.0.1', port=5001)