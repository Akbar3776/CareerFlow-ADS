# app.py
from flask import Flask
from models import db
from routes import api

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1234@localhost:5432/careerflow'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#Setup Database GUNAKAN VIRTUAL ENVIRONMENT
#1. Buat virtual environment: python -m venv venv
#2. Aktifkan virtual environment:   - Windows: venv\Scripts\activate
#                                   - macOS/Linux: source venv/bin/activate

    db.init_app(app)
    app.register_blueprint(api)

    with app.app_context():
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001)