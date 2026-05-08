# app.py
from flask import Flask
from models import db
from routes import api
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
# Tambahkan konfigurasi database dan JWT dari environment variables
# Buat file .env di root project dengan isi:
# DATABASE_URL=postgresql://username:password@localhost:5432/nama_database
# JWT_SECRET_KEY=string_rahasia_untuk_jwt (ganti dengan string acak yang lebih kuat di tahap produksi)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Tambahkan Secret Key untuk JWT (ganti dengan string acak yang lebih kuat di tahap produksi)
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')


#Setup Database GUNAKAN VIRTUAL ENVIRONMENT
#1. Buat virtual environment: python -m venv venv
#2. Aktifkan virtual environment:   - Windows: venv\Scripts\activate
#                                   - macOS/Linux: source venv/bin/activate

    db.init_app(app)
    jwt = JWTManager(app) # Inisialisasi JWT

    app.register_blueprint(api)

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001)