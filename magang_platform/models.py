# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class Pengguna(db.Model):
    __abstract__ = True
    idUser = db.Column(db.String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    nama = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

class Admin(Pengguna):
    __tablename__ = 'admin'
    idAdmin = db.Column(db.String(50), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    lowongan_dikelola = db.relationship('LowonganMagang', backref='admin', lazy=True)

class Mahasiswa(Pengguna):
    __tablename__ = 'mahasiswa'
    nim = db.Column(db.String(20), unique=True, nullable=False)
    programStudi = db.Column(db.String(100), nullable=False)
    lamaran_diajukan = db.relationship('Lamaran', backref='mahasiswa', lazy=True)

class LowonganMagang(db.Model):
    __tablename__ = 'lowongan_magang'
    idLowongan = db.Column(db.String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    posisi = db.Column(db.String(100), nullable=False)
    deskripsi = db.Column(db.Text, nullable=False)
    kategori = db.Column(db.String(50), nullable=False)
    kuota = db.Column(db.Integer, nullable=False)
    idAdmin = db.Column(db.String(50), db.ForeignKey('admin.idAdmin'), nullable=False)
    lamaran_masuk = db.relationship('Lamaran', backref='lowongan', lazy=True)

class Lamaran(db.Model):
    __tablename__ = 'lamaran'
    idLamaran = db.Column(db.String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    tanggalApply = db.Column(db.DateTime, default=datetime.utcnow)
    statusLamaran = db.Column(db.String(50), default='Menunggu')
    dokumenCV = db.Column(db.String(255), nullable=False)
    idLowongan = db.Column(db.String(50), db.ForeignKey('lowongan_magang.idLowongan'), nullable=False)
    nimMahasiswa = db.Column(db.String(20), db.ForeignKey('mahasiswa.nim'), nullable=False)