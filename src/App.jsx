import React, { useMemo, useState } from "react";
import {
  Activity, ArrowDown, ArrowLeft, ArrowRight, Baby, Bell, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, ClipboardList,
  FileText, Heart, HeartPulse, Home, Menu, MessageCircle, Pill, Plus,
  Search, Send, Settings, ShieldCheck, Sparkles, Stethoscope, Syringe,
  Upload, UserRound, Users, X, Flower2, MapPin, Clock, Droplets, Smile,
  HandHeart, BookOpen, LogOut, Languages, AlertTriangle
} from "lucide-react";

const stages = [
  { id: "exploring", label: "Exploring IVF", description: "Learning about fertility options", icon: BookOpen },
  { id: "treatment", label: "Undergoing treatment", description: "Appointments, medication and monitoring", icon: Syringe },
  { id: "transfer", label: "Embryo transfer completed", description: "Waiting for your test results", icon: Heart },
  { id: "confirmed", label: "Pregnancy confirmed through IVF", description: "Continuing into maternity care", icon: Baby }
];

const navItems = [
  ["Home", Home], ["My Journey", Activity], ["Appointments", CalendarDays],
  ["Health Records", FileText], ["Referrals", HandHeart], ["AI Companion", MessageCircle],
  ["Care Team", Users], ["Settings", Settings]
];

function Brand({ small = false }) {
  return <div className={`brand ${small ? "brand-small" : ""}`}>
    <div className="brand-mark"><HeartPulse size={25} strokeWidth={1.7} /></div>
    <div><strong>MaatriShield AI</strong><span>Healthy Women. Brighter Tomorrows.</span></div>
  </div>;
}

function Onboarding({ onFinish }) {
  const [ivf, setIvf] = useState(null);
  const [stage, setStage] = useState("treatment");
  const [name, setName] = useState("");
  const [step, setStep] = useState(0);

  const submit = () => {
    onFinish({ name: name.trim() || "Rebha", ivf: !!ivf, stage: ivf ? stage : "non-ivf", completed: true });
  };

  return <div className="onboarding-shell">
    <div className="onboarding-art">
      <div className="art-glow glow-one" /><div className="art-glow glow-two" />
      <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
      <div className="art-mother"><div className="mother-hair" /><div className="mother-face" /><div className="mother-body" /><div className="mother-arm" /><div className="mother-baby" /></div>
      <div className="floating-heart heart-a">♡</div><div className="floating-heart heart-b">✦</div>
      <div className="art-copy"><span className="eyebrow">YOUR CARE, YOUR JOURNEY</span><h1>Every journey<br/>to motherhood<br/><em>deserves care.</em></h1><p>Gentle guidance for fertility, pregnancy and the days beyond.</p><div className="art-trust"><ShieldCheck size={17}/> Private by design <span>·</span> Care that follows you</div></div>
      <div className="art-footer">A little more supported, every step of the way.</div>
    </div>
    <div className="onboarding-panel">
      <div className="mobile-brand"><Brand /></div>
      <div className="onboarding-top"><span>WELCOME TO MAATRISHIELD</span><span className="step-count">STEP {step + 1} OF 2</span></div>
      <div className="progress-track"><div style={{ width: step ? "100%" : "50%" }} /></div>
      {step === 0 ? <>
        <div className="onboard-icon"><HeartPulse size={26}/></div>
        <h2>Let's personalise<br/>your care</h2>
        <p className="muted intro-copy">Are you currently undergoing IVF treatment, or have you conceived through IVF?</p>
        <div className="choice-list">
          <button className={`choice-card ${ivf === true ? "selected" : ""}`} onClick={() => setIvf(true)}>
            <span className="choice-icon"><HeartPulse size={21}/></span><span className="choice-text"><strong>Yes, IVF is part of my journey</strong><small>Personalised fertility and maternity support</small></span>{ivf === true && <CheckCircle2 className="selected-check" size={20}/>}
          </button>
          <button className={`choice-card ${ivf === false ? "selected" : ""}`} onClick={() => setIvf(false)}>
            <span className="choice-icon"><UserRound size={21}/></span><span className="choice-text"><strong>No, not through IVF</strong><small>Personalised pregnancy and maternity support</small></span>{ivf === false && <CheckCircle2 className="selected-check" size={20}/>}
          </button>
        </div>
        <button className="primary-btn full" disabled={ivf === null} onClick={() => setStep(1)}>Continue <ArrowRight size={18}/></button>
        <p className="privacy-note"><ShieldCheck size={14}/> Your health details stay private and in your control.</p>
      </> : <>
        <button className="back-link" onClick={() => setStep(0)}><ArrowLeft size={16}/> Back</button>
        <div className="onboard-icon"><Sparkles size={25}/></div>
        <h2>{ivf ? "Where are you in your IVF journey?" : "Let's get to know you"}</h2>
        <p className="muted intro-copy">{ivf ? "Choose the stage that best describes you right now. You can change it later." : "We'll use your preferences to shape your care experience."}</p>
        {ivf ? <div className="stage-list">{stages.map(s => {
          const Icon = s.icon;
          return <button key={s.id} onClick={() => setStage(s.id)} className={`stage-option ${stage === s.id ? "selected" : ""}`}><span className="stage-icon"><Icon size={19}/></span><span><strong>{s.label}</strong><small>{s.description}</small></span>{stage === s.id && <CheckCircle2 size={19} className="selected-check"/>}</button>
        })}</div> : <div className="field-group"><label>What should we call you?</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Your first name" /><p className="field-help">You can add more details to your profile later.</p></div>}
        {ivf && <div className="field-group name-field"><label>What should we call you? <span>(optional)</span></label><input value={name} onChange={e => setName(e.target.value)} placeholder="Your first name" /></div>}
        <button className="primary-btn full" onClick={submit}>Enter my care space <ArrowRight size={18}/></button>
        <p className="privacy-note"><ShieldCheck size={14}/> You can update your care preferences in Settings.</p>
      </>}
      <div className="onboard-bottom"><span>© 2026 MaatriShield AI</span><a href="#privacy" onClick={e => { e.preventDefault(); alert("Privacy-first demo: this prototype stores your selected journey only in this browser. It is not connected to a healthcare provider."); }}>Privacy & safety</a></div>
    </div>
  </div>;
}

function App() {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("maat rishield-profile") || "null"); } catch { return null; }
  });
  const [active, setActive] = useState("Home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [mood, setMood] = useState("Good");
  const [symptom, setSymptom] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([{ from: "ai", text: "Hi! I'm here to help you navigate your care journey. What would you like support with today?" }]);
  const [checkedTasks, setCheckedTasks] = useState([0]);
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [recordUploaded, setRecordUploaded] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const finishOnboarding = data => {
    setProfile(data);
    localStorage.setItem("maat rishield-profile", JSON.stringify(data));
    setActive("Home");
    const token = localStorage.getItem("maatrishield-token");
    if (token) fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/profile`, {
      method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(data)
    }).catch(() => {});
  };
  const resetProfile = () => {
    localStorage.removeItem("maat rishield-profile");
    setProfile(null);
  };
  const firstName = profile?.name || "there";
  const isIVF = !!profile?.ivf;
  const currentStage = stages.find(s => s.id === profile?.stage) || stages[1];
  const filteredNav = navItems.filter(([label]) => label.toLowerCase().includes(query.toLowerCase()));
  const toggleTask = i => setCheckedTasks(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  if (!profile) return <Onboarding onFinish={finishOnboarding}/>;

  const titleMap = {
    Home: "Your care space", "My Journey": "Your journey", Appointments: "Appointments",
    "Health Records": "Health records", Referrals: "Care referrals", "AI Companion": "Your AI companion",
    "Care Team": "Your care team", Settings: "Settings"
  };

 
const addChatMessage = async () => {
  if (!chatInput.trim()) return;

  const question = chatInput.trim();

  setMessages(prev => [
    ...prev,
    { from: "you", text: question },
  ]);

  setChatInput("");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "https://maatrisheild-ai.onrender.com"}/api/assistant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "general",
          content: question,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Unable to contact the assistant.");
    }

    const data = await response.json();

    setMessages(prev => [
      ...prev,
      {
        from: "ai",
        text:
          data.response ||
          data.message ||
          "Your message was received. Please consult your clinician for medical advice.",
      },
    ]);
  } catch (error) {
    setMessages(prev => [
      ...prev,
      {
        from: "ai",
        text: "I'm unable to connect right now. Please try again shortly.",
      },
    ]);
  }
};


  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand"><Brand/></div>
      <div className="workspace-label">YOUR SPACE</div>
      <nav>{navItems.map(([label, Icon]) => <button key={label} className={`nav-item ${active === label ? "active" : ""}`} onClick={() => {setActive(label); setMobileMenu(false);}}><Icon size={19}/><span>{label}</span>{label === "AI Companion" && <span className="nav-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="support-card"><div className="support-icon"><HandHeart size={19}/></div><strong>You're not alone.</strong><p>One step at a time, we're here with you.</p><button onClick={() => setActive("AI Companion")}>Talk to your companion <ArrowRight size={14}/></button></div>
        <div className="profile-mini"><div className="avatar">{firstName.slice(0,1).toUpperCase()}</div><div><strong>{profile.name}</strong><small>{isIVF ? "IVF care journey" : "Maternity care journey"}</small></div><button title="Sign out / reset demo" onClick={resetProfile}><LogOut size={16}/></button></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu-btn icon-btn" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Open menu"><Menu size={21}/></button>
        <div className="searchbox"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your care space..." aria-label="Search navigation"/>{query && <button onClick={() => setQuery("")}><X size={14}/></button>}</div>
        <div className="topbar-actions"><button className="language-btn" onClick={() => alert("Language selector demo: English is currently selected. Multilingual support can be connected in a future version.")}><Languages size={17}/> <span>English</span><ChevronDown size={14}/></button><div className="notification-wrap"><button className="icon-btn notification-btn" onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications"><Bell size={19}/><i/></button>{showNotifications && <div className="notification-pop"><strong>Your updates</strong><p><span className="notice-dot"/> Remember to review your next appointment details.</p><p><span className="notice-dot lavender"/> Your care journey is ready to explore.</p><button onClick={() => setShowNotifications(false)}>Close</button></div>}</div><button className="top-profile" onClick={() => setActive("Settings")}><span className="avatar">{firstName.slice(0,1).toUpperCase()}</span><span>{profile.name}</span><ChevronDown size={14}/></button></div>
        </header>

      <div className="page-content">
        <div className="page-heading"><div><div className="breadcrumb">MAATRISHIELD <ChevronRight size={13}/> {active.toUpperCase()}</div><h1>{titleMap[active] || active}</h1><p>{active === "Home" ? "A gentler way to stay connected to your health." : "Everything you need, thoughtfully gathered in one place."}</p></div><div className="today-pill"><span className="status-dot"/> Your journey, your pace</div></div>

        {active === "Home" && <HomePage profile={profile} firstName={firstName} isIVF={isIVF} currentStage={currentStage} mood={mood} setMood={setMood} symptom={symptom} setSymptom={setSymptom} checkedTasks={checkedTasks} toggleTask={toggleTask} setActive={setActive} appointmentBooked={appointmentBooked} setAppointmentBooked={setAppointmentBooked} recordUploaded={recordUploaded} setRecordUploaded={setRecordUploaded}/>}
        {active === "My Journey" && <JourneyPage isIVF={isIVF} stage={profile.stage} setProfile={finishOnboarding} profile={profile}/>}
        {active === "Appointments" && <AppointmentsPage booked={appointmentBooked} setBooked={setAppointmentBooked}/>}
        {active === "Health Records" && <RecordsPage uploaded={recordUploaded} setUploaded={setRecordUploaded}/>}
        {active === "Referrals" && <ReferralsPage/>}
        {active === "AI Companion" && <ChatPage messages={messages} input={chatInput} setInput={setChatInput} send={addChatMessage}/>}
        {active === "Care Team" && <CareTeamPage/>}
        {active === "Settings" && <SettingsPage profile={profile} onSave={finishOnboarding} onReset={resetProfile} saved={settingsSaved} setSaved={setSettingsSaved}/>}
        <footer className="page-footer"><span><ShieldCheck size={14}/> Your privacy matters. Your care stays personal.</span><span>MaatriShield AI · Prototype</span></footer>
      </div>
    </main>
    {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Close menu"/>}
  </div>;
}

function SectionHeader({ title, subtitle, action, onAction }) {
  return <div className="section-header"><div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>{action && <button className="text-action" onClick={onAction}>{action}<ArrowRight size={14}/></button>}</div>;
}

function HomePage({ profile, firstName, isIVF, currentStage, mood, setMood, symptom, setSymptom, checkedTasks, toggleTask, setActive, appointmentBooked, setAppointmentBooked, recordUploaded, setRecordUploaded }) {
  const tasks = isIVF ? ["Take prescribed medication as directed", "Prepare questions for your next visit", "Record how you're feeling"] : ["Take prescribed supplements as directed", "Drink water and take a gentle break", "Note any symptoms or questions"];
  return <>
    <section className="welcome-banner">
      <div className="welcome-copy"><span className="eyebrow">A MOMENT JUST FOR YOU</span><h2>Good morning, {firstName} <span>♡</span></h2><p>Your health journey matters. We're here for you at every step — with care that meets you where you are.</p><div className="stage-chip"><span className="chip-flower"><Flower2 size={17}/></span> {isIVF ? currentStage.label : "Your pregnancy & maternity care"} <ChevronRight size={15}/></div></div>
      <div className="welcome-illustration"><div className="illustration-sun"/><div className="illustration-person"><div className="person-hair"/><div className="person-head"/><div className="person-dress"/><div className="person-belly"/></div><div className="leaf leaf1"/><div className="leaf leaf2"/><span className="illus-heart">♡</span></div>
    </section>
    <div className="stats-grid">
      <StatCard icon={isIVF ? Syringe : Baby} tint="pink" label="YOUR CURRENT STAGE" value={isIVF ? currentStage.label : "Maternity care"} sub={isIVF ? "Your journey, your pace" : "Personalised support"} />
      <StatCard icon={CalendarDays} tint="lavender" label="NEXT APPOINTMENT" value={appointmentBooked ? "Request sent" : "Nothing booked yet"} sub={appointmentBooked ? "We'll help you stay organised" : "Plan your next check-in"} />
      <StatCard icon={HeartPulse} tint="peach" label="WELLBEING CHECK-IN" value="How are you feeling?" sub="A quick moment for yourself" />
      <StatCard icon={ShieldCheck} tint="mint" label="CARE CONNECTION" value="Your care, connected" sub="Keep notes and questions together" />
    </div>
    <div className="content-grid">
      <div className="content-main">
        <section className="surface journey-surface">
          <SectionHeader title={isIVF ? "Your IVF journey" : "Your maternity journey"} subtitle="A simple view of the path ahead." action="View journey" onAction={() => setActive("My Journey")}/>
          <JourneyTrack isIVF={isIVF} stage={profile.stage}/>
        </section>
        <section className="surface">
          <SectionHeader title="A little care for today" subtitle="Small steps are still progress."/>
          <div className="task-list">{tasks.map((task,i)=><button key={task} className={`task-row ${checkedTasks.includes(i) ? "task-done" : ""}`} onClick={() => toggleTask(i)}><span className="task-check">{checkedTasks.includes(i) && <Check size={14}/>}</span><span>{task}</span><ChevronRight size={16}/></button>)}</div>
          <p className="care-disclaimer">Reminders are for organisation only. Follow the instructions from your healthcare professional.</p>
        </section>
        <section className="surface mood-surface">
          <SectionHeader title="How are you feeling today?" subtitle="Your wellbeing matters, too."/>
          <div className="mood-options">{["Very low","Low","Okay","Good","Great"].map((m,i)=><button key={m} onClick={() => setMood(m)} className={mood===m ? "mood-active" : ""}><span>{["☹","◡","😐","☺","♥"][i]}</span><small>{m}</small></button>)}</div>
          <div className="symptom-entry"><input value={symptom} onChange={e => setSymptom(e.target.value)} placeholder="Anything you'd like to remember or discuss?"/><button onClick={() => { if(symptom.trim()) { alert("Your note has been added to this demo session."); setSymptom(""); } }}><Plus size={16}/> Add note</button></div>
        </section>
      </div>
      <aside className="content-side">
        <section className="surface quick-actions"><SectionHeader title="Quick actions"/><div className="quick-grid">
          <QuickAction icon={CalendarDays} label="Appointments" onClick={() => setActive("Appointments")}/><QuickAction icon={Upload} label="Upload a record" onClick={() => setActive("Health Records")}/><QuickAction icon={MessageCircle} label="Ask AI companion" onClick={() => setActive("AI Companion")}/><QuickAction icon={MapPin} label="Care referrals" onClick={() => setActive("Referrals")}/>
        </div></section>
        <section className="surface reminder-card"><div className="reminder-head"><span className="reminder-icon"><Heart size={18}/></span><div><h3>Gentle reminder</h3><p>There's no one right way to feel.</p></div></div><p className="reminder-copy">Take a breath, ask questions, and reach out to your care team whenever you need support.</p><button className="soft-btn" onClick={() => setActive("AI Companion")}>I'm here to listen <ArrowRight size={15}/></button></section>
        <section className="surface next-card"><SectionHeader title="Your next steps" action="See all" onAction={() => setActive("Appointments")}/><div className="next-step"><span className="next-step-icon"><CalendarDays size={18}/></span><div><strong>{appointmentBooked ? "Appointment request sent" : "Plan a care check-in"}</strong><small>{appointmentBooked ? "Review your request in appointments" : "Keep your questions in one place"}</small></div></div><div className="next-step"><span className="next-step-icon lavender"><ClipboardList size={18}/></span><div><strong>Keep your records together</strong><small>Reports, notes and care history</small></div></div></section>
      </aside>
    </div>
  </>;
}

function StatCard({ icon: Icon, tint, label, value, sub }) {
  return <div className="stat-card"><div className={`stat-icon ${tint}`}><Icon size={20}/></div><span className="stat-label">{label}</span><strong>{value}</strong><small>{sub}</small></div>;
}
function QuickAction({ icon: Icon, label, onClick }) { return <button className="quick-action" onClick={onClick}><span><Icon size={19}/></span><strong>{label}</strong><ChevronRight size={15}/></button>; }

function JourneyTrack({ isIVF, stage }) {
  const ivfStages = [
    {label:"Explore & prepare", icon:BookOpen, id:"exploring"},
    {label:"IVF treatment", icon:Syringe, id:"treatment"},
    {label:"Embryo transfer", icon:Heart, id:"transfer"},
    {label:"Pregnancy care", icon:Baby, id:"confirmed"}
  ];
  const nonStages = [
    {label:"Preparing for care", icon:Flower2, id:"prepare"},
    {label:"Pregnancy care", icon:Baby, id:"pregnancy"},
    {label:"Birth planning", icon:Heart, id:"birth"},
    {label:"Postpartum", icon:HandHeart, id:"postpartum"}
  ];
  const list = isIVF ? ivfStages : nonStages;
  const activeIndex = isIVF ? Math.max(0, stages.findIndex(s => s.id === stage)) : 1;
  return <div className="journey-track">{list.map((s,i)=>{const Icon=s.icon; const done = i < activeIndex; const current = i === activeIndex; return <div className={`journey-node ${done?"done":""} ${current?"current":""}`} key={s.label}><div className="node-line"/><div className="node-circle">{done ? <Check size={17}/> : <Icon size={19}/>}</div><strong>{s.label}</strong><small>{current?"Current stage":done?"Completed":"Coming up"}</small></div>})}</div>;
}

function JourneyPage({ isIVF, stage, setProfile, profile }) {
  const [selected, setSelected] = useState(stage || "treatment");
  const list = isIVF ? stages : [
    {id:"non-ivf",label:"Pregnancy & maternity care",description:"General maternity support",icon:Baby},
    {id:"non-ivf",label:"Postpartum and recovery",description:"Follow-ups and wellbeing",icon:HandHeart}
  ];
  return <div className="page-columns">
    <section className="surface wide-surface"><SectionHeader title={isIVF ? "Your fertility-to-maternity timeline" : "Your maternity care path"} subtitle="Your journey can look different from someone else's — and that's okay."/>
      <div className="large-timeline">{(isIVF ? stages : [{id:"prepare",label:"Preparing for pregnancy",description:"Questions, appointments and care planning",icon:Flower2},{id:"pregnancy",label:"Pregnancy care",description:"Check-ins, records and support",icon:Baby},{id:"birth",label:"Preparing for birth",description:"Discuss your birth plan with your care team",icon:Heart},{id:"postpartum",label:"Postpartum & recovery",description:"Follow-up care and emotional wellbeing",icon:HandHeart}]).map((s,i)=>{const Icon=s.icon; const current = isIVF ? s.id === stage : i===1; return <div className={`timeline-item ${current?"timeline-current":""}`} key={s.id + i}><div className="timeline-rail"><span><Icon size={18}/></span></div><div className="timeline-copy"><div className="timeline-title"><h4>{s.label}</h4>{current && <span className="current-badge">YOUR STAGE</span>}</div><p>{s.description}</p>{current && <small>Use this space to organise questions and next steps with your clinician.</small>}</div></div>})}</div>
    </section>
    <section className="surface"><SectionHeader title="Your journey settings" subtitle="Update your stage when things change."/>
      {isIVF ? <div className="stage-list journey-stage-list">{stages.map(s=><button key={s.id} onClick={()=>setSelected(s.id)} className={`stage-option ${selected===s.id?"selected":""}`}><span className="stage-icon"><s.icon size={18}/></span><span><strong>{s.label}</strong><small>{s.description}</small></span>{selected===s.id&&<CheckCircle2 size={18} className="selected-check"/>}</button>)}</div> : <p className="muted">Your non-IVF maternity path is selected. You can update your care preferences in Settings.</p>}
      <button className="primary-btn full margin-top" onClick={()=>{setProfile({...profile,stage:isIVF?selected:"non-ivf"}); alert("Your journey preferences have been saved.");}}>Save journey stage <Check size={16}/></button>
    </section>
    <section className="surface"><SectionHeader title="Questions for your next visit"/><p className="muted">Keep questions here so you don't have to remember everything during an appointment.</p><textarea className="notes-area" placeholder="Add a question or a topic to discuss..."/><button className="soft-btn margin-top" onClick={()=>alert("Your question has been saved in this demo session.")}>Save question <ArrowRight size={15}/></button></section>
  </div>;
}

function AppointmentsPage({ booked, setBooked }) {
  const [kind,setKind]=useState("Routine check-in");
  const [date,setDate]=useState("");
  const [notes,setNotes]=useState("");
  return <div className="page-columns">
    <section className="surface wide-surface"><SectionHeader title="Your appointments" subtitle="Keep visits and questions organised in one place." action="Request an appointment" onAction={()=>document.getElementById("appointment-form")?.scrollIntoView({behavior:"smooth"})}/>
      {booked ? <div className="success-panel"><CheckCircle2 size={24}/><div><strong>Your appointment request is saved</strong><p>This is a prototype request only; no clinic has been contacted.</p></div><button className="text-action" onClick={()=>setBooked(false)}>Undo</button></div> : <div className="empty-state"><div className="empty-illustration"><CalendarDays size={30}/></div><h3>No appointments added yet</h3><p>Request a check-in below or add your existing appointment details.</p></div>}
      <div className="appointment-tip"><Clock size={18}/><p><strong>Helpful tip</strong><br/>Keep a short list of symptoms and questions to discuss with your healthcare professional.</p></div>
    </section>
    <section className="surface" id="appointment-form"><SectionHeader title="Plan a check-in" subtitle="This saves a local request in the demo."/><form className="form-stack" onSubmit={e=>{e.preventDefault();setBooked(true);}}><label>Type of visit<select value={kind} onChange={e=>setKind(e.target.value)}><option>Routine check-in</option><option>Fertility consultation</option><option>Pregnancy care</option><option>Postpartum follow-up</option><option>Discuss symptoms</option></select></label><label>Preferred date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Notes for your care team<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional questions or preferences"/></label><button className="primary-btn full" type="submit">Save appointment request <ArrowRight size={16}/></button></form></section>
  </div>;
}

function RecordsPage({ uploaded, setUploaded }) {
  const [records,setRecords]=useState(["Care notes","Questions for next appointment"]);
  return <div className="page-columns">
    <section className="surface wide-surface"><SectionHeader title="Your health records" subtitle="A personal place to keep track of reports and care notes."/><div className="record-banner"><div className="record-banner-icon"><FileText size={23}/></div><div><strong>Keep your information together</strong><p>In this demo, records are sample entries only. No medical files are sent to a provider.</p></div></div><div className="record-list">{records.map((r,i)=><div className="record-row" key={r}><span className="record-icon"><FileText size={18}/></span><div><strong>{r}</strong><small>{i===0?"Personal notes · Demo item":"Added for your next visit"}</small></div><button className="icon-btn" onClick={()=>setRecords(prev=>prev.filter(x=>x!==r))} aria-label={`Remove ${r}`}><X size={16}/></button></div>)}</div></section>
    <section className="surface"><SectionHeader title="Add a record"/><p className="muted">Add a label to organise a report or a note. File upload can be connected to secure storage later.</p><button className="upload-zone" onClick={()=>{const label=prompt("Enter a name for this record (for example, Ultrasound report):");if(label?.trim())setRecords(prev=>[label.trim(),...prev]);}}><Upload size={23}/><strong>Add a record label</strong><small>Prototype only · no file upload</small></button>{uploaded&&<p className="success-text"><CheckCircle2 size={15}/> Record note saved.</p>}<button className="soft-btn full margin-top" onClick={()=>{setUploaded(true);setRecords(prev=>prev.includes("New care note")?prev:["New care note",...prev]);}}>Add a care note <Plus size={15}/></button></section>
  </div>;
}

function ReferralsPage() {
  const [status,setStatus]=useState("All");
  const [referrals,setReferrals]=useState([{name:"Women's health consultation",detail:"Discuss your questions with a qualified clinician.",status:"Suggested"},{name:"Fertility specialist",detail:"For fertility-related concerns or treatment questions.",status:"Suggested"},{name:"Mental wellbeing support",detail:"Emotional support during a changing life stage.",status:"Available"}]);
  const shown=referrals.filter(r=>status==="All"||r.status===status);
  return <section className="surface"><SectionHeader title="Care referrals" subtitle="Keep track of possible next steps and follow-up conversations."/><div className="referral-notice"><ShieldCheck size={18}/><span>Suggestions are not medical referrals. A qualified clinician should determine whether a referral is appropriate.</span></div><div className="filter-pills">{["All","Suggested","Available","Requested"].map(s=><button className={status===s?"filter-active":""} onClick={()=>setStatus(s)} key={s}>{s}</button>)}</div><div className="referral-list">{shown.map(r=><div className="referral-card" key={r.name}><div className="referral-symbol"><Stethoscope size={20}/></div><div className="referral-copy"><strong>{r.name}</strong><p>{r.detail}</p><span className={`referral-status ${r.status==="Available"?"status-green":""}`}>{r.status}</span></div><button className="soft-btn" onClick={()=>setReferrals(prev=>prev.map(x=>x.name===r.name?{...x,status:"Requested"}:x))} disabled={r.status==="Requested"}>{r.status==="Requested"?"Requested":"Mark for follow-up"} <ArrowRight size={14}/></button></div>)}</div></section>;
}

function ChatPage({ messages, input, setInput, send }) {
  return <div className="chat-layout"><section className="surface chat-panel"><div className="chat-heading"><div className="ai-avatar"><Sparkles size={22}/></div><div><h3>Maatri companion</h3><p><span className="status-dot"/> Here to help you organise your care</p></div><span className="beta-label">AI SUPPORT</span></div><div className="chat-messages">{messages.map((m,i)=><div className={`chat-message ${m.from==="you"?"from-user":""}`} key={i}><div className="chat-bubble">{m.text}</div></div>)}</div><form className="chat-compose" onSubmit={e=>{e.preventDefault();send();}}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask a question or share what's on your mind..." /><button className="send-btn" aria-label="Send message" type="submit"><Send size={17}/></button></form><p className="chat-safety"><ShieldCheck size={14}/> This demo assistant doesn't diagnose, prescribe, or monitor emergencies.</p></section><aside className="surface chat-suggestions"><SectionHeader title="Things we can work on"/>{["Prepare questions for a visit","Understand a care term","Organise my next steps","Find emotional support"].map((x,i)=><button key={x} className="suggestion-row" onClick={()=>setInput(x)}><span>{[<ClipboardList size={17}/>,<BookOpen size={17}/>,<CalendarDays size={17}/>,<Heart size={17}/>][i]}</span>{x}<ChevronRight size={15}/></button>)}<div className="chat-warning"><AlertTriangle size={17}/><p>If you have severe or sudden symptoms, seek urgent medical care rather than waiting for a chat response.</p></div></aside></div>;
}

function CareTeamPage() {
  const [sent,setSent]=useState("");
  const team=[["Care coordinator","Helps you organise questions and appointments","CC","#EEDFF8"],["Obstetrician / gynaecologist","Pregnancy and reproductive health care","OB","#F9DDE7"],["Fertility specialist","IVF and fertility treatment questions","FS","#FCE7D9"],["Wellbeing counsellor","Emotional and mental wellbeing support","WB","#DDEFE7"]];
  return <section className="surface"><SectionHeader title="Your care team" subtitle="Use these roles as a guide when deciding whom to contact."/><div className="team-grid">{team.map(([name,desc,initial,bg])=><div className="team-card" key={name}><div className="team-avatar" style={{background:bg}}>{initial}</div><h3>{name}</h3><p>{desc}</p><button className="soft-btn" onClick={()=>setSent(name)}>Prepare a message <ArrowRight size={14}/></button></div>)}</div>{sent&&<div className="success-panel margin-top"><MessageCircle size={20}/><div><strong>Message preparation started: {sent}</strong><p>This prototype doesn't send messages. You can write down your question before contacting your actual care provider.</p></div><button className="icon-btn" onClick={()=>setSent("")}><X size={16}/></button></div>}</section>;
}

function SettingsPage({ profile, onSave, onReset, saved, setSaved }) {
  const [name,setName]=useState(profile.name||"");
  const [ivf,setIvf]=useState(!!profile.ivf);
  const [stage,setStage]=useState(profile.stage||"treatment");
  const [privacy,setPrivacy]=useState(true);
  return <div className="page-columns"><section className="surface wide-surface"><SectionHeader title="Your profile" subtitle="Update your name and care journey preferences."/><form className="form-stack" onSubmit={e=>{e.preventDefault();onSave({...profile,name:name.trim()||"Friend",ivf,stage:ivf?stage:"non-ivf"});setSaved(true);}}><label>First name<input value={name} onChange={e=>setName(e.target.value)} /></label><label>Care pathway<select value={ivf?"ivf":"non-ivf"} onChange={e=>setIvf(e.target.value==="ivf")}><option value="ivf">IVF is part of my journey</option><option value="non-ivf">Not through IVF</option></select></label>{ivf&&<label>Current IVF stage<select value={stage} onChange={e=>setStage(e.target.value)}>{stages.map(s=><option value={s.id} key={s.id}>{s.label}</option>)}</select></label>}<button className="primary-btn" type="submit">Save changes <Check size={16}/></button>{saved&&<p className="success-text"><CheckCircle2 size={15}/> Preferences saved.</p>}</form></section><section className="surface"><SectionHeader title="Privacy & demo data"/><div className="setting-row"><span className="setting-icon"><ShieldCheck size={19}/></span><div><strong>Keep this demo on this device</strong><small>Profile choice is stored in your browser's local storage.</small></div><button className={`toggle ${privacy?"toggle-on":""}`} onClick={()=>setPrivacy(!privacy)} aria-label="Toggle local demo data"><span/></button></div><div className="referral-notice"><CircleHelp size={17}/><span>This prototype is not connected to a clinic and is not a medical record system.</span></div><button className="danger-btn full margin-top" onClick={onReset}><LogOut size={16}/> Reset demo and return to onboarding</button></section></div>;
}

export default App;
