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
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='customer') # 'admin' veya 'customer'
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) # Sipariş kime ait?
    service_type = db.Column(db.String(50), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default='Bekliyor')
    price = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Kullanıcıyla ilişki kur (Adını çekebilmek için)
    user = db.relationship('User', backref=db.backref('orders', lazy=True))

# --- ROTALAR ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    # ... (Validasyonlar aynı) ...
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Bu e-posta kayıtlı'}), 400

    hashed_pw = generate_password_hash(data.get('password'))
    
    # İLK KULLANICIYI OTOMATİK ADMİN YAP (Test Kolaylığı İçin)
    role = 'customer'
    if User.query.count() == 0:
        role = 'admin'

    new_user = User(
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        phone=data.get('phone'),
        email=data.get('email'),
        password_hash=hashed_pw,
        role=role 
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Kayıt başarılı'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()

    if user and check_password_hash(user.password_hash, data.get('password')):
        session['user_id'] = user.id
        session['role'] = user.role # Rolü session'a kaydet
        session['username'] = f"{user.first_name} {user.last_name}"
        
        # Frontend'e rol bilgisini de dönüyoruz
        return jsonify({
            'message': 'Giriş başarılı', 
            'user': session['username'],
            'role': user.role 
        }), 200
    
    return jsonify({'error': 'Hatalı bilgiler'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Çıkış yapıldı'}), 200

# --- AKILLI SİPARİŞ LİSTELEME ---
@app.route('/api/orders', methods=['GET'])
def get_orders():
    user_id = session.get('user_id')
    if not user_id: return jsonify({'error': 'Yetkisiz erişim'}), 401

    current_user = User.query.get(user_id)
    
    if current_user.role == 'admin':
        # Admin ise HERKESİN siparişini getir
        orders = Order.query.order_by(Order.created_at.desc()).all()
    else:
        # Müşteri ise SADECE KENDİ siparişini getir
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()

    output = []
    for order in orders:
        output.append({
            'id': order.id,
            'customer': f"{order.user.first_name} {order.user.last_name}", # İlişkiden isim çekiyoruz
            'service': order.service_type,
            'file': order.file_name,
            'status': order.status,
            'price': order.price,
            'date': order.created_at.strftime("%d-%m-%Y %H:%M")
        })
    return jsonify(output), 200

@app.route('/api/orders/<int:id>/quote', methods=['POST'])
def update_price(id):
    # Sadece admin fiyat verebilir
    if session.get('role') != 'admin':
        return jsonify({'error': 'Yetkiniz yok'}), 403

    data = request.json
    order = Order.query.get(id)
    if not order: return jsonify({'error': 'Sipariş yok'}), 404
    
    order.price = data.get('price')
    order.status = 'Fiyatlandı'
    db.session.commit()
    return jsonify({'message': 'Fiyat güncellendi'}), 200

# TEST VERİSİ (Giriş yapan kullanıcı adına oluşturur)
@app.route('/api/create-fake-orders', methods=['GET'])
def fake_orders():
    user_id = session.get('user_id')
    if not user_id: return jsonify({'error': 'Önce giriş yapın'}), 401
    
    o1 = Order(user_id=user_id, service_type="CNC İşleme", file_name="demo_parca_1.step")
    o2 = Order(user_id=user_id, service_type="3D Baskı", file_name="prototype_v2.stl")
    db.session.add_all([o1, o2])
    db.session.commit()
    return jsonify({'message': 'Hesabınıza 2 adet test siparişi eklendi'}), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', port=5001)