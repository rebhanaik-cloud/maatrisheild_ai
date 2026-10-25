from datetime import datetime, timedelta, timezone
import os
import re
from typing import Optional, List
import bcrypt
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import BaseModel, EmailStr, Field, ConfigDict
import sqlalchemy
from sqlalchemy import create_engine, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker, Session

# ---------------------------------------------------------
# Database Configuration & Normalization
# ---------------------------------------------------------
RAW_DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./maatrishield.db')

# Normalize PostgreSQL URLs for SQLAlchemy 2.0+ and psycopg3
if RAW_DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = RAW_DATABASE_URL.replace('postgres://', 'postgresql+psycopg://', 1)
elif RAW_DATABASE_URL.startswith('postgresql://') and not RAW_DATABASE_URL.startswith('postgresql+'):
    DATABASE_URL = RAW_DATABASE_URL.replace('postgresql://', 'postgresql+psycopg://', 1)
else:
    DATABASE_URL = RAW_DATABASE_URL

connect_args = {'check_same_thread': False} if DATABASE_URL.startswith('sqlite') else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

SECRET_KEY = os.getenv('MAATRISHIELD_SECRET_KEY', 'demo-insecure-secret-key-change-in-production-min32bytes')
ALGORITHM = 'HS256'
ACCESS_TOKEN_MINUTES = int(os.getenv('ACCESS_TOKEN_MINUTES', 60 * 24))  # 24 hours

# ---------------------------------------------------------
# Database Models
# ---------------------------------------------------------
class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    profile: Mapped[Optional['Profile']] = relationship(back_populates='user', uselist=False, cascade='all, delete-orphan')
    appointments: Mapped[List['Appointment']] = relationship(back_populates='user', cascade='all, delete-orphan')
    notes: Mapped[List['HealthNote']] = relationship(back_populates='user', cascade='all, delete-orphan')

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

# ---------------------------------------------------------
# FastAPI App & CORS Setup
# ---------------------------------------------------------
app = FastAPI(
    title='MaatriShield AI API',
    version='1.0.0',
    description='Maternal and IVF care coordination prototype API with secure authentication and persistent state.'
)

# Parse allowed origins with defaults for local dev and Vercel production
cors_env = os.getenv('CORS_ORIGINS', '')
configured_origins = [o.strip() for o in cors_env.split(',') if o.strip()]
default_origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'https://maatrisheild-ai-three.vercel.app',
    'https://maatrisheild-ai.vercel.app',
    'https://maatrishield-ai.vercel.app',
]
all_allowed_origins = list(dict.fromkeys(configured_origins + default_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=all_allowed_origins,
    allow_origin_regex=r'^https:\/\/([a-zA-Z0-9_-]+\.)?vercel\.app$',
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')

# ---------------------------------------------------------
# Password Hashing via Direct bcrypt (Safe & Modern)
# ---------------------------------------------------------
def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt(rounds=12)).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode('utf-8')
        if len(pwd_bytes) > 72:
            pwd_bytes = pwd_bytes[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))
    except Exception:
        return False

# ---------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------
class AuthInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72, description="Password must be between 8 and 72 characters.")

class TokenOut(BaseModel):
    access_token: str
    token_type: str = 'bearer'

class ProfileIn(BaseModel):
    name: str = Field(default='', max_length=100)
    ivf: bool = False
    stage: str = Field(default='non-ivf', max_length=40)
    completed: bool = True

class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    ivf: bool
    stage: str
    completed: bool

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    profile: Optional[ProfileOut] = None

class AppointmentIn(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    appointment_at: Optional[str] = Field(default=None, max_length=80)
    notes: str = Field(default='', max_length=3000)

class AppointmentOut(AppointmentIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: str
    created_at: datetime

class NoteIn(BaseModel):
    category: str = Field(default='note', max_length=60)
    content: str = Field(min_length=1, max_length=5000)

class NoteOut(NoteIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime

class AssistantIn(BaseModel):
    content: str = Field(min_length=1, max_length=4000)
    category: str = Field(default='general', max_length=60)

class AssistantOut(BaseModel):
    answer: str
    mode: str = 'safety-template'
    clinical_disclaimer: str

# ---------------------------------------------------------
# Dependencies & Helpers
# ---------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_token(user_id: int) -> str:
    expiry = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES)
    return jwt.encode({'sub': str(user_id), 'exp': expiry}, SECRET_KEY, algorithm=ALGORITHM)

def current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    auth_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Invalid or expired session. Please sign in again.',
        headers={'WWW-Authenticate': 'Bearer'}
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid = int(payload.get('sub', '0'))
    except (JWTError, ValueError):
        raise auth_exception

    user = db.get(User, uid)
    if not user:
        raise auth_exception
    return user

# ---------------------------------------------------------
# Routes
# ---------------------------------------------------------
@app.get('/api/health')
def health():
    db_ok = True
    try:
        with engine.connect() as conn:
            conn.execute(sqlalchemy.text("SELECT 1"))
    except Exception:
        db_ok = False

    return {
        'status': 'ok' if db_ok else 'degraded',
        'database': 'connected' if db_ok else 'unreachable',
        'service': 'MaatriShield AI API',
        'note': 'Prototype maternal health platform; not for emergency or clinical decision-making.'
    }

@app.post('/api/auth/register', response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(data: AuthInput, db: Session = Depends(get_db)):
    if len(data.password) < 8:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, 'Password must be at least 8 characters.')
    
    email = data.email.lower().strip()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, 'An account with this email already exists. Please sign in instead.')

    user = User(email=email, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    return {'access_token': create_token(user.id), 'token_type': 'bearer'}

@app.post('/api/auth/login', response_model=TokenOut)
def login(data: AuthInput, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Email or password is incorrect. Please check your credentials.')

    return {'access_token': create_token(user.id), 'token_type': 'bearer'}

@app.get('/api/me', response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user

@app.get('/api/profile', response_model=Optional[ProfileOut])
def get_profile(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(Profile).filter(Profile.user_id == user.id).first()

@app.put('/api/profile', response_model=ProfileOut)
def save_profile(data: ProfileIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    allowed_stages = {
        'exploring', 'treatment', 'transfer', 'confirmed',
        'non-ivf', 'prepare', 'pregnancy', 'birth', 'postpartum'
    }
    stage = data.stage if data.stage in allowed_stages else ('treatment' if data.ivf else 'non-ivf')

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if profile is None:
        profile = Profile(user_id=user.id)
    
    profile.name = data.name.strip()[:100]
    profile.ivf = data.ivf
    profile.stage = stage
    profile.completed = data.completed

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@app.get('/api/appointments', response_model=List[AppointmentOut])
def list_appointments(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(Appointment).filter(Appointment.user_id == user.id).order_by(Appointment.id.desc()).all()

@app.post('/api/appointments', response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def create_appointment(data: AppointmentIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = Appointment(
        user_id=user.id,
        title=data.title.strip()[:160],
        appointment_at=data.appointment_at,
        notes=data.notes.strip()[:3000],
        status='requested'
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@app.delete('/api/appointments/{item_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(item_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = db.query(Appointment).filter(Appointment.id == item_id, Appointment.user_id == user.id).first()
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Appointment record not found.')
    db.delete(item)
    db.commit()
    return None

@app.get('/api/notes', response_model=List[NoteOut])
def list_notes(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return db.query(HealthNote).filter(HealthNote.user_id == user.id).order_by(HealthNote.id.desc()).all()

@app.post('/api/notes', response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(data: NoteIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    content = data.content.strip()
    if not content:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, 'Health note content cannot be empty.')
    item = HealthNote(
        user_id=user.id,
        category=data.category.strip()[:60] or 'note',
        content=content[:5000]
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@app.delete('/api/notes/{item_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_note(item_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = db.query(HealthNote).filter(HealthNote.id == item_id, HealthNote.user_id == user.id).first()
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Health note not found.')
    db.delete(item)
    db.commit()
    return None

@app.post('/api/assistant', response_model=AssistantOut)
def assistant(data: AssistantIn, user: User = Depends(current_user)):
    text = data.content.lower().strip()
    if not text:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, 'Message cannot be empty.')

    urgent_keywords = [
        'heavy bleeding', 'chest pain', 'difficulty breathing', 'fainting',
        'severe pain', 'suicidal', 'loss of consciousness', 'seizure', 'fluid leaking'
    ]
    urgent = any(term in text for term in urgent_keywords)

    if urgent:
        answer = (
            "⚠️ URGENT HEALTH NOTICE: Your message may describe symptoms requiring immediate medical evaluation. "
            "Please contact local emergency medical services or your nearest maternity emergency unit immediately. "
            "Do not wait for an app response. MaatriShield AI cannot diagnose or monitor medical emergencies."
        )
    else:
        if any(w in text for w in ['ivf', 'embryo', 'transfer', 'injection', 'egg retrieval', 'beta', 'follicle', 'progesterone']):
            answer = (
                "Regarding IVF care: Treatment protocols, medication schedules (such as progesterone or trigger injections), "
                "and two-week wait symptoms can vary greatly from person to person. "
                "Write down specific times and any physical sensations so your fertility specialist can provide tailored advice. "
                "If you experience sudden severe abdominal pain, high fever, or severe bloating, notify your clinic right away."
            )
        elif any(w in text for w in ['nausea', 'morning sickness', 'vomit']):
            answer = (
                "Nausea and morning sickness are very common, especially in the first trimester. "
                "Small, frequent meals, staying hydrated with small sips of water or electrolyte drinks, and ginger can sometimes help. "
                "If you are unable to keep any fluids down for over 12–24 hours, contact your midwife or obstetrician to discuss hyperemesis gravidarum."
            )
        elif any(w in text for w in ['stress', 'anxious', 'worried', 'sad', 'scared', 'alone', 'cry', 'overwhelm']):
            answer = (
                "Emotional wellbeing is just as important as physical health during fertility treatment, pregnancy, and postpartum. "
                "Feelings of worry, exhaustion, or mood swings are very normal. Please speak with your care team or a maternal mental health counsellor "
                "— having support makes a profound difference."
            )
        elif any(w in text for w in ['appointment', 'question', 'ask doctor', 'prepare']):
            answer = (
                "Preparing for your check-in: It's helpful to write down your top 3 concerns first, list any medications or supplements you take, "
                "and note when symptoms started. You can also save these directly in your 'Health Records' and 'Appointments' tabs here in MaatriShield."
            )
        else:
            answer = (
                "Thank you for reaching out. I am here to help you organise your maternal health questions, record your journey, "
                "and prepare for clinician visits. Remember that this prototype cannot diagnose, recommend medication adjustments, "
                "or replace your healthcare team. Please consult your obstetrician, fertility specialist, or midwife for medical advice."
            )

    return {
        'answer': answer,
        'mode': 'safety-template',
        'clinical_disclaimer': 'This prototype is not a certified medical device and does not provide clinical diagnosis or treatment.'
    }
