from datetime import datetime, timedelta, timezone
import os
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, ConfigDict
from sqlalchemy import create_engine, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker, Session

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./maatrishield.db')
SECRET_KEY = os.getenv('MAATRISHIELD_SECRET_KEY', 'CHANGE_THIS_DEMO_SECRET_BEFORE_DEPLOYMENT')
ALGORITHM = 'HS256'
ACCESS_TOKEN_MINUTES = 60 * 24
connect_args = {'check_same_thread': False} if DATABASE_URL.startswith('sqlite') else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
class Base(DeclarativeBase): pass

class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    profile: Mapped[Optional['Profile']] = relationship(back_populates='user', uselist=False, cascade='all, delete-orphan')
    appointments: Mapped[list['Appointment']] = relationship(back_populates='user', cascade='all, delete-orphan')
    notes: Mapped[list['HealthNote']] = relationship(back_populates='user', cascade='all, delete-orphan')

class Profile(Base):
    __tablename__ = 'profiles'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), default='')
    ivf: Mapped[bool] = mapped_column(Boolean, default=False)
    stage: Mapped[str] = mapped_column(String(40), default='non-ivf')
    completed: Mapped[bool] = mapped_column(Boolean, default=True)
    user: Mapped[User] = relationship(back_populates='profile')

class Appointment(Base):
    __tablename__ = 'appointments'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)
    title: Mapped[str] = mapped_column(String(160))
    appointment_at: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default='')
    status: Mapped[str] = mapped_column(String(30), default='requested')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    user: Mapped[User] = relationship(back_populates='appointments')

class HealthNote(Base):
    __tablename__ = 'health_notes'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), index=True)
    category: Mapped[str] = mapped_column(String(60), default='note')
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    user: Mapped[User] = relationship(back_populates='notes')

Base.metadata.create_all(bind=engine)
app = FastAPI(title='MaatriShield AI API', version='1.0.0', description='Prototype API for maternal and IVF care coordination')
app.add_middleware(CORSMiddleware, allow_origins=os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(','), allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')

class AuthInput(BaseModel):
    email: EmailStr
    password: str
class TokenOut(BaseModel):
    access_token: str
    token_type: str = 'bearer'
class ProfileIn(BaseModel):
    name: str = ''
    ivf: bool
    stage: str
    completed: bool = True
class ProfileOut(ProfileIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
class AppointmentIn(BaseModel):
    title: str
    appointment_at: Optional[str] = None
    notes: str = ''
class AppointmentOut(AppointmentIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
class NoteIn(BaseModel):
    category: str = 'note'
    content: str
class NoteOut(NoteIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def create_token(user_id: int):
    expiry = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
    return jwt.encode({'sub': str(user_id), 'exp': expiry}, SECRET_KEY, algorithm=ALGORITHM)

def current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    error = HTTPException(status_code=401, detail='Invalid or expired session. Please sign in again.', headers={'WWW-Authenticate': 'Bearer'})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]); uid = int(payload.get('sub', '0'))
    except (JWTError, ValueError): raise error
    user = db.get(User, uid)
    if not user: raise error
    return user

@app.get('/api/health')
def health(): return {'status': 'ok', 'service': 'MaatriShield AI API', 'note': 'Prototype; not for emergency or clinical decision-making.'}

@app.post('/api/auth/register', response_model=TokenOut, status_code=201)
def register(data: AuthInput, db: Session = Depends(get_db)):
    if len(data.password) < 8: raise HTTPException(400, 'Password must be at least 8 characters.')
    email = data.email.lower().strip()
    if db.query(User).filter(User.email == email).first(): raise HTTPException(409, 'An account with this email already exists.')
    user = User(email=email, password_hash=pwd_context.hash(data.password)); db.add(user); db.commit(); db.refresh(user)
    return {'access_token': create_token(user.id)}

@app.post('/api/auth/login', response_model=TokenOut)
def login(data: AuthInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if not user or not pwd_context.verify(data.password, user.password_hash): raise HTTPException(401, 'Email or password is incorrect.')
    return {'access_token': create_token(user.id)}

@app.get('/api/me')
def me(user: User = Depends(current_user)):
    return {'id': user.id, 'email': user.email, 'profile': user.profile}

@app.get('/api/profile', response_model=Optional[ProfileOut])
def get_profile(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(Profile).filter(Profile.user_id == user.id).first()

@app.put('/api/profile', response_model=ProfileOut)
def save_profile(data: ProfileIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    allowed = {'exploring', 'treatment', 'transfer', 'confirmed', 'non-ivf', 'prepare', 'pregnancy', 'birth', 'postpartum'}
    if data.stage not in allowed: raise HTTPException(400, 'Unknown journey stage.')
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if profile is None: profile = Profile(user_id=user.id)
    profile.name = data.name[:100]; profile.ivf = data.ivf; profile.stage = data.stage; profile.completed = data.completed
    db.add(profile); db.commit(); db.refresh(profile); return profile

@app.get('/api/appointments', response_model=list[AppointmentOut])
def list_appointments(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(Appointment).filter(Appointment.user_id == user.id).order_by(Appointment.id.desc()).all()

@app.post('/api/appointments', response_model=AppointmentOut, status_code=201)
def create_appointment(data: AppointmentIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = Appointment(user_id=user.id, title=data.title[:160], appointment_at=data.appointment_at, notes=data.notes[:3000]); db.add(item); db.commit(); db.refresh(item); return item

@app.get('/api/notes', response_model=list[NoteOut])
def list_notes(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(HealthNote).filter(HealthNote.user_id == user.id).order_by(HealthNote.id.desc()).all()

@app.post('/api/notes', response_model=NoteOut, status_code=201)
def create_note(data: NoteIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if not data.content.strip(): raise HTTPException(400, 'Note cannot be empty.')
    item = HealthNote(user_id=user.id, category=data.category[:60], content=data.content[:5000]); db.add(item); db.commit(); db.refresh(item); return item

@app.post('/api/assistant')
def assistant(data: NoteIn, user: User = Depends(current_user)):
    # Safe starter response; replace with a vetted AI provider integration before production.
    text = data.content.lower()
    urgent = any(term in text for term in ['heavy bleeding', 'chest pain', 'difficulty breathing', 'fainting', 'severe pain', 'suicidal'])
    if urgent:
        answer = 'Your message may describe an urgent concern. Please contact local emergency services or your clinician now. Do not wait for an AI response. I cannot diagnose or assess emergencies.'
    else:
        answer = 'I can help you organise your concerns and prepare questions for your healthcare professional, but I cannot diagnose, recommend medication changes, or replace clinical care. If symptoms are sudden, severe, worsening, or worrying, contact your clinician promptly.'
    return {'answer': answer, 'mode': 'safety-template', 'clinical_disclaimer': 'This prototype is not a medical device and does not provide diagnosis or treatment.'}
