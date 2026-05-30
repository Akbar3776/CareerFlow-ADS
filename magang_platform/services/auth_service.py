from models import db, Admin, Mahasiswa, OtpCode
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
import random
import string
from datetime import datetime, timedelta, timezone

class AuthService:
    @staticmethod
    def create_mahasiswa(data):
        if Mahasiswa.query.filter_by(email=data['email']).first() or Mahasiswa.query.filter_by(nim=data['nim']).first():
            return None, "Email atau NIM sudah terdaftar"
        
        hashed_password = generate_password_hash(data['password'])
        new_mahasiswa = Mahasiswa(
            nama=data['nama'],
            email=data['email'],
            password=hashed_password,
            nim=data['nim'],
            programStudi=data['programStudi']
        )
        db.session.add(new_mahasiswa)
        db.session.commit()
        return new_mahasiswa, None

    @staticmethod
    def authenticate_user(email, password):
        user = Admin.query.filter_by(email=email).first()
        role = 'admin'
        user_id = user.idAdmin if user else None

        if not user:
            user = Mahasiswa.query.filter_by(email=email).first()
            role = 'mahasiswa'
            user_id = user.nim if user else None

        if not user:
            return None, None, "Email atau password salah"

        if role == 'admin':
            # Compare plain text for admin
            if user.password != password:
                return None, None, "Email atau password salah"
        else:
            # Use hash check for mahasiswa
            if not check_password_hash(user.password, password):
                return None, None, "Email atau password salah"

        access_token = create_access_token(
            identity=str(user_id),
            additional_claims={'role': role}
        )
        return access_token, role, None

    @staticmethod
    def generate_otp(email, purpose):
        if purpose == 'signup' and Mahasiswa.query.filter_by(email=email).first():
            return None, "Email sudah terdaftar"
        
        if purpose == 'forgot' and not Mahasiswa.query.filter_by(email=email).first():
            return None, "Email tidak ditemukan"

        otp = ''.join(random.choices(string.digits, k=6))
        OtpCode.query.filter_by(email=email, purpose=purpose, is_used=False).update({'is_used': True})
        
        db.session.add(OtpCode(email=email, otp=otp, purpose=purpose))
        db.session.commit()
        print(f"OTP for {email} ({purpose}): {otp}") # For testing only
        return otp, None

    @staticmethod
    def verify_otp(email, otp, purpose):
        now_naive = datetime.now(timezone.utc).replace(tzinfo=None)
        code = OtpCode.query.filter_by(email=email, otp=otp, purpose=purpose, is_used=False).order_by(OtpCode.created_at.desc()).first()
        
        if not code or (now_naive - code.created_at > timedelta(minutes=10)):
            return False, "OTP salah atau kadaluarsa"
        
        # Jika bukan forgot password, langsung tandai terpakai
        # Jika forgot password, biarkan dulu sampai proses reset selesai
        if purpose == 'signup':
            code.is_used = True
            db.session.commit()
            
        return True, None

    @staticmethod
    def reset_password(email, otp, new_password):
        is_valid, msg = AuthService.verify_otp(email, otp, 'forgot')
        if not is_valid:
            return False, msg

        user = Mahasiswa.query.filter_by(email=email).first()
        if not user:
            return False, "Email tidak ditemukan"

        user.password = generate_password_hash(new_password)
        
        # Tandai OTP terpakai
        code = OtpCode.query.filter_by(email=email, otp=otp, purpose='forgot', is_used=False).order_by(OtpCode.created_at.desc()).first()
        if code:
            code.is_used = True
            
        db.session.commit()
        return True, None

    @staticmethod
    def get_user_profile(user_id, role):
        if role == 'admin':
            user = Admin.query.get(user_id) # Ensure idAdmin is the primary key
            # Assuming Admin model has a 'nama' column. If not, replace with default string.
            return {"name": getattr(user, 'nama', 'Admin'), "role": "Admin"} if user else None
            
        elif role == 'mahasiswa':
            user = Mahasiswa.query.filter_by(nim=user_id).first()
            return {"name": getattr(user, 'nama', 'Mahasiswa'), "role": "Mahasiswa"} if user else None
            
        return None

    @staticmethod
    def update_user_profile(user_id, role, data, password=None):
        # Only allow updating own profile
        if role == 'admin':
            user = Admin.query.get(user_id)
        elif role == 'mahasiswa':
            user = Mahasiswa.query.filter_by(nim=user_id).first()
        else:
            return None, "Role tidak valid"
        if not user:
            return None, "User tidak ditemukan"

        # Email change: require password confirmation and check uniqueness
        if 'email' in data and data['email'] != user.email:
            if not password or not check_password_hash(user.password, password):
                return None, "Password salah untuk konfirmasi email"
            # Check if email is already taken
            if Admin.query.filter_by(email=data['email']).first() or Mahasiswa.query.filter_by(email=data['email']).first():
                return None, "Email sudah digunakan"
            user.email = data['email']

        # Update other fields
        if 'nama' in data:
            user.nama = data['nama']
        if 'username' in data and hasattr(user, 'username'):
            user.username = data['username']
        if 'bio' in data and hasattr(user, 'bio'):
            user.bio = data['bio']
        # Optionally handle photo
        if 'photo' in data and hasattr(user, 'photo'):
            user.photo = data['photo']

        db.session.commit()
        # Return updated profile (reuse get_user_profile for consistency)
        return AuthService.get_user_profile(user_id, role), None