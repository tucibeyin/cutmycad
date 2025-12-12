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

# --- YENİ KULLANICI MODELİ ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)  # Ad
    last_name = db.Column(db.String(50), nullable=False)   # Soyad
    phone = db.Column(db.String(20), nullable=False)       # Telefon
    email = db.Column(db.String(120), unique=True, nullable=False) # E-Posta (Giriş için)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default='Bekliyor')
    price = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# --- ROTALAR ---

# YENİ: KAYIT OL (Register)
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    # Verileri al
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone = data.get('phone')
    email = data.get('email')
    password = data.get('password')

    # Boş alan kontrolü
    if not all([first_name, last_name, phone, email, password]):
        return jsonify({'error': 'Lütfen tüm alanları doldurun'}), 400

    # E-posta daha önce alınmış mı?
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Bu e-posta adresi zaten kayıtlı'}), 400

    # Kayıt İşlemi
    hashed_pw = generate_password_hash(password)
    new_user = User(
        first_name=first_name,
        last_name=last_name,
        phone=phone,
        email=email,
        password_hash=hashed_pw
    )
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Kayıt başarılı! Giriş yapabilirsiniz.'}), 201

# GÜNCELLENDİ: GİRİŞ YAP (Login - Artık Email ile)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')     # Username yerine Email
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password_hash, password):
        session['user_id'] = user.id
        session['username'] = f"{user.first_name} {user.last_name}" # Ekranda Ad Soyad görünsün
        return jsonify({'message': 'Giriş başarılı', 'user': session['username']}), 200
    
    return jsonify({'error': 'Hatalı e-posta veya şifre'}), 401

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

# SİPARİŞLER (Aynı kaldı)
@app.route('/api/orders', methods=['GET'])
def get_orders():
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

@app.route('/api/orders/<int:id>/quote', methods=['POST'])
def update_price(id):
    data = request.json
    new_price = data.get('price')
    order = Order.query.get(id)
    if not order: return jsonify({'error': 'Sipariş bulunamadı'}), 404
    order.price = new_price
    order.status = 'Fiyatlandı'
    db.session.commit()
    return jsonify({'message': 'Fiyat güncellendi'}), 200

@app.route('/api/create-fake-orders', methods=['GET'])
def fake_orders():
    if Order.query.count() == 0:
        o1 = Order(customer_name="Ahmet Yılmaz", service_type="CNC İşleme", file_name="motor_block_v2.step")
        o2 = Order(customer_name="Mehmet Demir", service_type="Lazer Kesim", file_name="flanş_3mm.dxf")
        db.session.add_all([o1, o2])
        db.session.commit()
        return jsonify({'message': 'Test siparişleri oluşturuldu'}), 201
    return jsonify({'message': 'Zaten siparişler var'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', port=5001)