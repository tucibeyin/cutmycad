from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import redis
import os
import datetime
import uuid

load_dotenv()

app = Flask(__name__)

# --- AYARLAR ---
db_user = os.getenv('DB_USER')
db_pass = os.getenv('DB_PASS')
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME')
secret_key = os.getenv('SECRET_KEY')
redis_url = os.getenv('REDIS_URL')

# Dosya Yükleme Ayarları
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads') # Dosyalar buraya
ALLOWED_EXTENSIONS = {'dxf', 'dwg', 'step', 'stp', 'stl', 'obj', 'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024 # Max 50MB dosya limiti
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
    role = db.Column(db.String(20), default='customer')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    stored_name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default='Bekliyor')
    price = db.Column(db.Float, nullable=True)          # Admin Fiyatı
    counter_offer = db.Column(db.Float, nullable=True)  # Müşteri Teklifi (YENİ)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('orders', lazy=True))

# --- YARDIMCI FONKSİYONLAR ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- ROTALAR ---

# YENİ: DOSYA YÜKLEME VE SİPARİŞ OLUŞTURMA
@app.route('/api/upload', methods=['POST'])
def upload_file():
    # 1. Giriş kontrolü
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Lütfen önce giriş yapın'}), 401

    # 2. Dosya var mı?
    if 'file' not in request.files:
        return jsonify({'error': 'Dosya bulunamadı'}), 400
    
    file = request.files['file']
    service_type = request.form.get('service_type') # CNC, Lazer vb.

    if file.filename == '':
        return jsonify({'error': 'Dosya seçilmedi'}), 400

    if file and allowed_file(file.filename):
        # 3. Güvenli isim oluştur (Çakışmayı önlemek için UUID ekle)
        original_filename = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4()}_{original_filename}"
        
        # 4. Dosyayı Kaydet
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
            
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_name))

        # 5. Veritabanına Yaz
        new_order = Order(
            user_id=user_id,
            service_type=service_type,
            file_name=original_filename, # Kullanıcıya görünecek isim
            stored_name=unique_name      # İndirme linki için gerçek isim
        )
        db.session.add(new_order)
        db.session.commit()

        return jsonify({'message': 'Dosya yüklendi ve sipariş oluşturuldu'}), 201

    return jsonify({'error': 'Desteklenmeyen dosya türü'}), 400

# YENİ: DOSYA İNDİRME (Admin İçin)
@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    # Sadece giriş yapanlar indirebilir
    if not session.get('user_id'):
        return jsonify({'error': 'Yetkisiz erişim'}), 403
        
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)

# ... (Kayıt, Login, Logout aynı kalacak) ...
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Bu e-posta kayıtlı'}), 400
    hashed_pw = generate_password_hash(data.get('password'))
    role = 'customer'
    if User.query.count() == 0: role = 'admin'
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
        session['role'] = user.role
        session['username'] = f"{user.first_name} {user.last_name}"
        return jsonify({'message': 'Giriş başarılı', 'user': session['username'], 'role': user.role}), 200
    return jsonify({'error': 'Hatalı bilgiler'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Çıkış yapıldı'}), 200

# GÜNCELLENDİ: SİPARİŞ LİSTELEME (İndirme Linki Eklendi)
@app.route('/api/orders', methods=['GET'])
def get_orders():
    user_id = session.get('user_id')
    if not user_id: return jsonify({'error': 'Yetkisiz erişim'}), 401
    current_user = User.query.get(user_id)
    
    if current_user.role == 'admin':
        orders = Order.query.order_by(Order.created_at.desc()).all()
    else:
        orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()

    output = []
    for order in orders:
        output.append({
            'id': order.id,
            'customer': f"{order.user.first_name} {order.user.last_name}",
            'service': order.service_type,
            'file': order.file_name,
            'download_url': f"/api/download/{order.stored_name}", # İndirme linki
            'status': order.status,
            'price': order.price,
            'date': order.created_at.strftime("%d-%m-%Y %H:%M")
        })
    return jsonify(output), 200

@app.route('/api/orders/<int:id>/quote', methods=['POST'])
def update_price(id):
    if session.get('role') != 'admin': return jsonify({'error': 'Yetkiniz yok'}), 403
    data = request.json
    order = Order.query.get(id)
    if not order: return jsonify({'error': 'Sipariş yok'}), 404
    order.price = data.get('price')
    order.status = 'Fiyatlandı'
    db.session.commit()
    return jsonify({'message': 'Fiyat güncellendi'}), 200

# --- YENİ: MÜŞTERİ AKSİYONLARI ---

# 1. SİPARİŞ ONAYLA (Müşteri)
@app.route('/api/orders/<int:id>/approve', methods=['POST'])
def approve_order(id):
    user_id = session.get('user_id')
    if not user_id: return jsonify({'error': 'Yetkisiz'}), 401

    order = Order.query.get(id)
    if not order or order.user_id != user_id:
        return jsonify({'error': 'Sipariş bulunamadı'}), 404

    order.status = 'Onaylandı'
    db.session.commit()
    return jsonify({'message': 'Sipariş onaylandı! Üretime alınacak.'}), 200

# 2. KARŞI TEKLİF VER (Müşteri)
@app.route('/api/orders/<int:id>/counter', methods=['POST'])
def counter_offer(id):
    user_id = session.get('user_id')
    if not user_id: return jsonify({'error': 'Yetkisiz'}), 401

    data = request.json
    offer = data.get('offer')

    order = Order.query.get(id)
    if not order or order.user_id != user_id:
        return jsonify({'error': 'Sipariş bulunamadı'}), 404

    order.counter_offer = offer
    order.status = 'Pazarlık' # Admin bunu görecek
    db.session.commit()
    return jsonify({'message': 'Teklifiniz admine iletildi.'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='127.0.0.1', port=5001)

@app.route('/api/orders/<int:id>', methods=['DELETE'])
def delete_order(id):
    user_id = session.get('user_id')
    role = session.get('role')
    
    if not user_id: return jsonify({'error': 'Yetkisiz erişim'}), 401

    order = Order.query.get(id)
    if not order: return jsonify({'error': 'Sipariş bulunamadı'}), 404

    # Yetki Kontrolü
    if role != 'admin' and order.user_id != user_id:
        return jsonify({'error': 'Bunu silmeye yetkiniz yok'}), 403

    # Müşteri ise, işlemdeki siparişi silemez
    if role != 'admin' and order.status != 'Bekliyor':
        return jsonify({'error': 'İşleme alınan sipariş silinemez.'}), 400

    # --- 1. ADIM: DİSKTEKİ DOSYAYI SİL ---
    try:
        # Dosyanın tam yolunu bul
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], order.stored_name)
        
        # Eğer dosya gerçekten varsa sil
        if os.path.exists(file_path):
            os.remove(file_path) # <--- İŞTE FİZİKSEL SİLME KOMUTU
            print(f"Dosya silindi: {order.stored_name}") # Loglara yaz
    except Exception as e:
        # Dosya zaten yoksa veya hata olursa sistemi durdurma, veritabanından silmeye devam et
        print(f"Dosya silme hatası (Önemli değil): {e}")

    # --- 2. ADIM: VERİTABANINDAN SİL ---
    db.session.delete(order)
    db.session.commit()

    return jsonify({'message': 'Sipariş ve dosya başarıyla silindi'}), 200

@app.route('/api/orders/<int:id>/update-file', methods=['POST'])
def update_order_file(id):
    user_id = session.get('user_id')
    role = session.get('role')
    
    if not user_id: return jsonify({'error': 'Yetkisiz erişim'}), 401

    order = Order.query.get(id)
    if not order: return jsonify({'error': 'Sipariş bulunamadı'}), 404

    # Yetki Kontrolü
    if role != 'admin' and order.user_id != user_id:
        return jsonify({'error': 'Yetkiniz yok'}), 403
    
    # Müşteri statü kontrolü
    if role != 'admin' and order.status != 'Bekliyor':
        return jsonify({'error': 'Fiyatlanan siparişin dosyası değiştirilemez.'}), 400

    # Dosya Kontrolü
    if 'file' not in request.files:
        return jsonify({'error': 'Dosya yok'}), 400
    
    file = request.files['file']
    if file.filename == '': return jsonify({'error': 'Dosya seçilmedi'}), 400

    if file and allowed_file(file.filename):
        # 1. Eski Dosyayı Sil
        try:
            old_path = os.path.join(app.config['UPLOAD_FOLDER'], order.stored_name)
            if os.path.exists(old_path):
                os.remove(old_path)
        except: pass

        # 2. Yeni Dosyayı Kaydet
        original_filename = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4()}_{original_filename}"
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_name))

        # 3. DB Güncelle
        order.file_name = original_filename
        order.stored_name = unique_name
        db.session.commit()

        return jsonify({'message': 'Dosya güncellendi'}), 200

    return jsonify({'error': 'Geçersiz dosya türü'}), 400