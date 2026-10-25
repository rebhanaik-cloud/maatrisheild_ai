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
    appointment_at: str = Field(min_length=1, max_length=80, description="Mandatory appointment date (YYYY-MM-DD)")
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
    date_str = data.appointment_at.strip()
    if not date_str:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, 'Appointment date is required.')

    # Enforce that appointment date can only be from today onwards
    try:
        parsed_date = datetime.strptime(date_str[:10], '%Y-%m-%d').date()
        today = datetime.now(timezone.utc).date()
        if parsed_date < today:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f'Appointment date cannot be in the past ({date_str}). Please select today or a future date.'
            )
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, 'Invalid date format. Expected YYYY-MM-DD.')

    item = Appointment(
        user_id=user.id,
        title=data.title.strip()[:160],
        appointment_at=date_str[:80],
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
        'severe pain', 'suicidal', 'loss of consciousness', 'seizure', 'fluid leaking',
        'water broke', 'blurred vision', 'sudden severe swelling', 'reduced fetal movement',
        'no movement', 'high fever', 'convulsion'
    ]
    urgent = any(term in text for term in urgent_keywords)

    if urgent:
        answer = (
            "🚨 URGENT HEALTH NOTICE: Your message describes symptoms that require immediate medical evaluation. "
            "Please call emergency ambulance helpline 108 (or your local emergency services) or go directly to the nearest maternity hospital emergency unit right now. "
            "Do not wait for a chat response. MaatriShield AI cannot diagnose or treat medical emergencies."
        )
    # Abdominal pain & cramping
    elif any(w in text for w in ['abdominal pain', 'stomach pain', 'cramp', 'cramping', 'tummy pain', 'belly pain', 'round ligament']):
        answer = (
            "Regarding abdominal discomfort: Mild, intermittent cramping can occur as the uterus expands or round ligaments stretch (often causing quick twinges on either side when changing positions). "
            "Precautions & Comfort Measures:\n"
            "1. Lie on your left side with a pillow between your knees to relieve pelvic pressure.\n"
            "2. Sip warm water and use a gently warm (never hot) water pack on your lower back.\n"
            "3. Rest and avoid sudden jerky twisting movements.\n"
            "⚠️ When to seek urgent care: If pain is severe, constant, sharp on one side, accompanied by fever, or paired with vaginal bleeding, contact your doctor immediately."
        )
    # Back & pelvic pain
    elif any(w in text for w in ['back pain', 'backache', 'pelvic pain', 'hip pain', 'sciatica', 'joint pain']):
        answer = (
            "Regarding back and pelvic girdle discomfort: Pregnancy hormones (relaxin) loosen pelvic ligaments, which frequently causes lower back and hip soreness. "
            "Precautions & Comfort Measures:\n"
            "1. Wear supportive flat footwear with arch support; avoid high heels completely.\n"
            "2. Practice gentle pelvic tilts and sleep on your side with a supportive maternity pillow.\n"
            "3. Consider a supportive maternity belly belt during walking or standing.\n"
            "⚠️ Medication Caution: Never take NSAIDs (like ibuprofen, advil, or aspirin) without explicit obstetric prescription. Consult your doctor if paracetamol/acetaminophen is recommended."
        )
    # Headaches, vision & pre-eclampsia
    elif any(w in text for w in ['headache', 'migraine', 'dizzy', 'dizziness', 'lightheaded', 'vision', 'seeing spots', 'swelling']):
        answer = (
            "Regarding headaches and dizziness: Mild tension headaches can occur from hormonal shifts, fatigue, or dehydration. "
            "Precautions:\n"
            "1. Rest in a dark, quiet room and drink at least 250-500ml of water or electrolyte fluids.\n"
            "2. Check your blood pressure if you have a home monitor.\n"
            "⚠️ Red Flag Warning: A severe, persistent headache that does not respond to rest, accompanied by blurry vision, flashing spots, or sudden swelling of the hands/face, can be a sign of pre-eclampsia. Report to your maternal triage center immediately."
        )
    # Bleeding & spotting
    elif any(w in text for w in ['bleeding', 'spotting', 'brown discharge', 'pink discharge', 'blood']):
        answer = (
            "Regarding vaginal spotting or bleeding: Light brownish spotting can sometimes happen after a cervical check, ultrasound, or mild implantation. "
            "Precautions:\n"
            "1. Use a sanitary pad (NEVER use tampons or menstrual cups during pregnancy or post-transfer).\n"
            "2. Rest in bed and avoid sexual intercourse, lifting heavy objects, and strenuous exercise.\n"
            "3. Monitor the color and number of pads used.\n"
            "⚠️ Immediate Action: Any bright red bleeding, passing of tissue/clots, or bleeding accompanied by pain requires immediate evaluation by your obstetrician or emergency maternity ward."
        )
    # IVF & Assisted Reproduction
    elif any(w in text for w in ['ivf', 'embryo', 'transfer', 'injection', 'egg retrieval', 'beta', 'follicle', 'progesterone', 'trigger']):
        answer = (
            "Regarding IVF care & injection protocols: IVF journeys require strict medication timing and gentle physical care. "
            "Precautions:\n"
            "1. For progesterone injections: Rotate injection sites daily, warm oil vials gently in clean hands before administration, and apply gentle pressure after.\n"
            "2. For egg retrieval recovery: Drink electrolyte-rich fluids, eat high-protein meals, and avoid heavy core exercises.\n"
            "3. Ovarian Hyperstimulation (OHSS) Watch: If you notice sudden rapid weight gain, severe abdominal bloating, nausea, or shortness of breath, contact your fertility specialist right away.\n"
            "4. During the two-week wait: Prioritize gentle walks, stress reduction, and avoid testing too early before your official beta hCG blood test."
        )
    # Nausea, morning sickness & vomiting
    elif any(w in text for w in ['nausea', 'morning sickness', 'vomit', 'vomiting', 'sick', 'queasy', 'appetite']):
        answer = (
            "Regarding nausea and morning sickness: Hormonal surges (hCG and progesterone) commonly trigger nausea, especially in weeks 6 through 14. "
            "Precautions & Tips:\n"
            "1. Keep dry crackers or plain biscuits by your bedside to eat a few bites before rising.\n"
            "2. Eat small, frequent meals every 2-3 hours rather than 3 large meals.\n"
            "3. Sip ginger tea, lemon water, or cold fluids between meals rather than with food.\n"
            "⚠️ Dehydration Warning: If you are unable to keep any liquids down for more than 12-24 hours or show signs of dehydration (dark urine, dry mouth, dizziness), seek clinical care for hyperemesis gravidarum."
        )
    # Food, diet & nutrition precautions
    elif any(w in text for w in ['food', 'diet', 'eat', 'eating', 'nutrition', 'safe to eat', 'caffeine', 'coffee', 'tea', 'fish', 'cheese']):
        answer = (
            "Regarding nutrition and food safety during pregnancy and fertility treatment: "
            "Key Precautions:\n"
            "1. Limit caffeine to under 200mg daily (approximately one 8-ounce cup of coffee).\n"
            "2. Strictly avoid unpasteurized milk, soft cheeses (brie, feta, blue), raw/undercooked eggs, and raw sprouts to prevent Listeria and Salmonella.\n"
            "3. Avoid high-mercury predatory fish (shark, swordfish, king mackerel); choose low-mercury options like thoroughly cooked salmon, sardines, or shrimp.\n"
            "4. Wash all raw vegetables and fruits thoroughly, and continue taking prescribed prenatal supplements (folic acid, iron, vitamin D) as instructed."
        )
    # Contractions, Braxton Hicks & labor signs
    elif any(w in text for w in ['contraction', 'contractions', 'labor', 'labour', 'braxton hicks', 'tightening']):
        answer = (
            "Regarding contractions and uterine tightenings: "
            "Understanding the difference:\n"
            "1. Braxton Hicks: Irregular, painless or mild tightenings that do not grow closer together and subside when you change position, drink water, or rest.\n"
            "2. True Labor Contractions: Progressively stronger, regular, and closer together (following the 5-1-1 rule: contractions every 5 minutes, lasting 1 minute, for at least 1 hour).\n"
            "⚠️ Immediate Action: If you are under 37 weeks and having regular tightenings (preterm labor risk), or if your water breaks with clear or green fluid, contact your maternity unit immediately."
        )
    # Medications & painkillers
    elif any(w in text for w in ['medicine', 'medication', 'pill', 'paracetamol', 'tylenol', 'ibuprofen', 'painkiller', 'antibiotic']):
        answer = (
            "Regarding medication safety: "
            "Important Precautions:\n"
            "1. Never take NSAIDs (such as Ibuprofen, Advil, Motrin, or Aspirin) during pregnancy or IVF cycles unless specifically prescribed as low-dose therapy by your maternal-fetal medicine specialist.\n"
            "2. Paracetamol (Acetaminophen) is generally considered the first-line mild pain reliever for occasional maternal use, but only at the lowest effective dose after confirming with your healthcare provider.\n"
            "3. Always check any over-the-counter cough syrups, decongestants, or herbal supplements with your doctor or pharmacist first."
        )
    # Emotional wellbeing & anxiety
    elif any(w in text for w in ['stress', 'anxious', 'anxiety', 'worried', 'sad', 'scared', 'alone', 'cry', 'crying', 'overwhelm', 'mental', 'depressed']):
        answer = (
            "Regarding emotional wellbeing: Experiencing feelings of overwhelm, anxiety, or tearfulness is extremely common during fertility treatment and pregnancy due to rapid hormonal and life transitions. "
            "Helpful Precautions & Self-Care:\n"
            "1. Give yourself permission to pause: try gentle 4-7-8 deep breathing exercises (inhale 4s, hold 7s, exhale slowly 8s).\n"
            "2. Share your feelings openly with your partner, trusted friends, or care team — you do not have to carry this alone.\n"
            "3. Consider connecting with a perinatal mental health counsellor.\n"
            "⚠️ Support lines: If you experience overwhelming distress, panic, or thoughts of self-harm, please reach out to emergency services (108/112) or professional mental health helplines immediately."
        )
    # Postpartum recovery
    elif any(w in text for w in ['postpartum', 'after birth', 'c-section', 'cesarean', 'perineal', 'stitches', 'lochia', 'breastfeeding']):
        answer = (
            "Regarding postpartum recovery: The fourth trimester is a vital period of physical healing and adjustment. "
            "Precautions:\n"
            "1. For C-section wounds: Keep the incision clean and dry; watch for redness, warmth, increasing pain, or drainage.\n"
            "2. For perineal healing: Use warm water rinse bottles, ice packs, and sitz baths; avoid heavy lifting.\n"
            "3. Lochia (postpartum discharge): Should transition from heavy red to pinkish-brown to yellow-white over 4-6 weeks. Large blood clots (golf-ball size) or foul odor require urgent medical review.\n"
            "4. Stay hydrated with 2-3 liters of water daily, especially if breastfeeding."
        )
    # General preparation & visit questions
    elif any(w in text for w in ['appointment', 'question', 'ask doctor', 'prepare', 'checklist', 'visit']):
        answer = (
            "Preparing for your healthcare check-in: Writing down questions in advance ensures you get the most out of your clinical consultation. "
            "Suggested topics to prepare:\n"
            "1. Changes in symptoms: Note the exact frequency and intensity of any sensations since your last visit.\n"
            "2. Medication check: Bring a list of all supplements, dosages, and injection times.\n"
            "3. Next milestones: Ask what developmental scans, blood panels, or protocol adjustments are scheduled next.\n"
            "Tip: You can save questions directly to your 'Health Records' tab right here in MaatriShield to pull up during your appointment."
        )
    else:
        answer = (
            "Thank you for reaching out to your Maatri Companion. I can help guide you through symptom tracking, fertility protocols, and prenatal precautions to prepare for your healthcare visits. "
            "If you are experiencing pain, cramping, nausea, or medication questions, let me know the specific details so I can provide relevant care precautions. "
            "Remember: This platform is an educational and organizational tool; always consult your obstetrician or fertility specialist for clinical diagnoses."
        )

    return {
        'answer': answer,
        'mode': 'safety-template',
        'clinical_disclaimer': 'This prototype is not a certified medical device and does not provide clinical diagnosis or treatment.'
    }
