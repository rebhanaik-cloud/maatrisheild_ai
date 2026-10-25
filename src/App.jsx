import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Activity, ArrowDown, ArrowLeft, ArrowRight, Baby, Bell, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, ClipboardList,
  FileText, Heart, HeartPulse, Home, Menu, MessageCircle, Pill, Plus,
  Search, Send, Settings, ShieldCheck, Sparkles, Stethoscope, Syringe,
  Upload, UserRound, Users, X, Flower2, MapPin, Clock, Droplets, Smile,
  HandHeart, BookOpen, LogOut, Languages, AlertTriangle, Trash2, ExternalLink
} from "lucide-react";
import {
  profileAPI,
  appointmentsAPI,
  notesAPI,
  assistantAPI,
  getStoredProfile,
  setStoredProfile,
} from "./api.js";

const stages = [
  { id: "exploring", label: "Exploring IVF", description: "Learning about fertility options", icon: BookOpen },
  { id: "treatment", label: "Undergoing treatment", description: "Appointments, medication and monitoring", icon: Syringe },
  { id: "transfer", label: "Embryo transfer completed", description: "Waiting for your test results", icon: Heart },
  { id: "confirmed", label: "Pregnancy confirmed through IVF", description: "Continuing into maternity care", icon: Baby }
];

const navItems = [
  ["Home", Home],
  ["My Journey", Activity],
  ["Appointments", CalendarDays],
  ["Care Logs", ClipboardList],
  ["Health Records", FileText],
  ["Referrals", HandHeart],
  ["AI Companion", MessageCircle],
  ["Care Team", Users],
  ["Settings", Settings]
];

function Brand({ small = false }) {
  return (
    <div className={`brand ${small ? "brand-small" : ""}`}>
      <div className="brand-mark"><HeartPulse size={25} strokeWidth={1.7} /></div>
      <div><strong>MaatriShield AI</strong><span>Healthy Women. Brighter Tomorrows.</span></div>
    </div>
  );
}

function Onboarding({ onFinish, defaultName = "" }) {
  const [ivf, setIvf] = useState(null);
  const [stage, setStage] = useState("treatment");
  const [name, setName] = useState(defaultName);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await onFinish({
        name: name.trim() || "Friend",
        ivf: !!ivf,
        stage: ivf ? stage : "non-ivf",
        completed: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="onboarding-shell">
      <div className="onboarding-art">
        <div className="art-glow glow-one" /><div className="art-glow glow-two" />
        <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
        <div className="art-mother">
          <div className="mother-hair" />
          <div className="mother-face" />
          <div className="mother-body" />
          <div className="mother-arm" />
          <div className="mother-baby" />
        </div>
        <div className="floating-heart heart-a">♡</div><div className="floating-heart heart-b">✦</div>
        <div className="art-copy">
          <span className="eyebrow">YOUR CARE, YOUR JOURNEY</span>
          <h1>Every journey<br/>to motherhood<br/><em>deserves care.</em></h1>
          <p>Gentle guidance for fertility, pregnancy, and the days beyond.</p>
          <div className="art-trust"><ShieldCheck size={17}/> Private by design <span>·</span> Care that follows you</div>
        </div>
        <div className="art-footer">A little more supported, every step of the way.</div>
      </div>

      <div className="onboarding-panel">
        <div className="mobile-brand"><Brand /></div>
        <div className="onboarding-top">
          <span>WELCOME TO MAATRISHIELD</span>
          <span className="step-count">STEP {step + 1} OF 2</span>
        </div>
        <div className="progress-track"><div style={{ width: step ? "100%" : "50%" }} /></div>

        {step === 0 ? (
          <>
            <div className="onboard-icon"><HeartPulse size={26}/></div>
            <h2>Let's personalise<br/>your care</h2>
            <p className="muted intro-copy">Are you currently undergoing IVF treatment, or have you conceived through IVF?</p>
            <div className="choice-list">
              <button
                type="button"
                className={`choice-card ${ivf === true ? "selected" : ""}`}
                onClick={() => setIvf(true)}
              >
                <span className="choice-icon"><HeartPulse size={21}/></span>
                <span className="choice-text">
                  <strong>Yes, IVF is part of my journey</strong>
                  <small>Personalised fertility and maternity support</small>
                </span>
                {ivf === true && <CheckCircle2 className="selected-check" size={20}/>}
              </button>

              <button
                type="button"
                className={`choice-card ${ivf === false ? "selected" : ""}`}
                onClick={() => setIvf(false)}
              >
                <span className="choice-icon"><UserRound size={21}/></span>
                <span className="choice-text">
                  <strong>No, not through IVF</strong>
                  <small>Personalised pregnancy and maternity support</small>
                </span>
                {ivf === false && <CheckCircle2 className="selected-check" size={20}/>}
              </button>
            </div>

            <button
              type="button"
              className="primary-btn full"
              disabled={ivf === null}
              onClick={() => setStep(1)}
            >
              Continue <ArrowRight size={18}/>
            </button>
            <p className="privacy-note"><ShieldCheck size={14}/> Your health details stay private and in your control.</p>
          </>
        ) : (
          <>
            <button type="button" className="back-link" onClick={() => setStep(0)}>
              <ArrowLeft size={16}/> Back
            </button>
            <div className="onboard-icon"><Sparkles size={25}/></div>
            <h2>{ivf ? "Where are you in your IVF journey?" : "Let's get to know you"}</h2>
            <p className="muted intro-copy">
              {ivf ? "Choose the stage that best describes you right now. You can change it anytime." : "We'll use your preferences to shape your care experience."}
            </p>

            {ivf ? (
              <div className="stage-list">
                {stages.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setStage(s.id)}
                      className={`stage-option ${stage === s.id ? "selected" : ""}`}
                    >
                      <span className="stage-icon"><Icon size={19}/></span>
                      <span>
                        <strong>{s.label}</strong>
                        <small>{s.description}</small>
                      </span>
                      {stage === s.id && <CheckCircle2 size={19} className="selected-check"/>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="field-group">
                <label>What should we call you?</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                />
                <p className="field-help">You can add more details to your profile later.</p>
              </div>
            )}

            {ivf && (
              <div className="field-group name-field">
                <label>What should we call you? <span>(optional)</span></label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                />
              </div>
            )}

            <button
              type="button"
              className="primary-btn full"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "Saving your profile…" : "Enter my care space"} <ArrowRight size={18}/>
            </button>
            <p className="privacy-note"><ShieldCheck size={14}/> You can update your care preferences in Settings.</p>
          </>
        )}

        <div className="onboard-bottom">
          <span>© 2026 MaatriShield AI</span>
          <span style={{ fontSize: "10px", color: "var(--muted)" }}>
            Prototype care coordinator · Non-clinical tool
          </span>
        </div>
      </div>
    </div>
  );
}

function App({ user, onLogout }) {
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [active, setActive] = useState("Home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [mood, setMood] = useState("Good");
  const [symptom, setSymptom] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Task list completion: initialize empty or from localStorage (do not default to checked on reload)
  const [checkedTasks, setCheckedTasks] = useState(() => {
    try {
      const stored = localStorage.getItem("maatrishield-checked-tasks");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleTask = (i) => {
    setCheckedTasks((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      try {
        localStorage.setItem("maatrishield-checked-tasks", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Real backend connected states
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hi! I'm your Maatri companion. I can help guide you through symptom tracking, fertility protocols, and prenatal precautions to prepare for your healthcare visits. How can I support you today?",
    },
  ]);

  // Load backend profile
  useEffect(() => {
    async function syncProfile() {
      try {
        const remoteProfile = await profileAPI.get();
        if (remoteProfile) {
          setProfile(remoteProfile);
          setStoredProfile(remoteProfile);
        }
      } catch (err) {
        console.warn("Could not sync profile from server:", err);
      }
    }
    if (!profile) {
      syncProfile();
    }
  }, [profile]);

  // Load appointments
  const loadAppointments = useCallback(async () => {
    try {
      setAppointmentsLoading(true);
      const data = await appointmentsAPI.list();
      setAppointments(data || []);
    } catch (err) {
      console.warn("Failed to fetch appointments:", err);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  // Load health notes
  const loadNotes = useCallback(async () => {
    try {
      setNotesLoading(true);
      const data = await notesAPI.list();
      setNotes(data || []);
    } catch (err) {
      console.warn("Failed to fetch health notes:", err);
    } finally {
      setNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
    loadNotes();
  }, [loadAppointments, loadNotes]);

  // Save profile both locally and to FastAPI backend
  const finishOnboarding = async (data) => {
    setProfile(data);
    setStoredProfile(data);
    try {
      const saved = await profileAPI.save(data);
      if (saved) {
        setProfile(saved);
        setStoredProfile(saved);
      }
    } catch (err) {
      console.error("Failed to persist profile to backend:", err);
    }
  };

  const handleLogout = () => {
    setNotes([]);
    setAppointments([]);
    onLogout();
  };

  const firstName = profile?.name || user?.email?.split("@")[0] || "there";
  const isIVF = !!profile?.ivf;
  const currentStage = stages.find((s) => s.id === profile?.stage) || stages[1];

  // AI Chat message sender
  const addChatMessage = async (customPrompt) => {
    const question = (customPrompt || chatInput).trim();
    if (!question || chatBusy) return;

    setChatError("");
    setMessages((prev) => [...prev, { from: "you", text: question }]);
    if (!customPrompt) setChatInput("");
    setChatBusy(true);

    try {
      const data = await assistantAPI.ask(question, "companion_chat");
      const answer = data?.answer || "I received your message. Please consult your clinician for specific medical care.";

      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: answer,
          urgent: answer.includes("URGENT HEALTH NOTICE"),
          disclaimer: data?.clinical_disclaimer,
        },
      ]);
    } catch (err) {
      setChatError(err.message || "Unable to reach the assistant. Please try again shortly.");
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: "I'm temporarily unable to connect to the care assistant server. Please ensure the backend is running and try again.",
          isError: true,
        },
      ]);
    } finally {
      setChatBusy(false);
    }
  };

  // Add a health note from Home page check-in
  const [symptomSaving, setSymptomSaving] = useState(false);
  const [symptomNotice, setSymptomNotice] = useState("");

  const handleAddSymptomNote = async () => {
    if (!symptom.trim() || symptomSaving) return;
    setSymptomSaving(true);
    setSymptomNotice("");
    try {
      const category = mood ? `Daily Wellbeing (${mood})` : "Symptom Log";
      const newNote = await notesAPI.create({
        category,
        content: symptom.trim(),
      });
      setNotes((prev) => [newNote, ...prev]);
      setSymptom("");
      setSymptomNotice("Your entry has been saved to your Care Logs & database.");
      setTimeout(() => setSymptomNotice(""), 5000);
    } catch (err) {
      alert("Could not save health note. Please check your connection.");
    } finally {
      setSymptomSaving(false);
    }
  };

  if (!profile) {
    return <Onboarding onFinish={finishOnboarding} defaultName={user?.email?.split("@")[0] || ""} />;
  }

  const titleMap = {
    Home: "Your care space",
    "My Journey": "Your journey",
    Appointments: "Appointments",
    "Care Logs": "Care & Wellbeing Logs",
    "Health Records": "Health records",
    Referrals: "Care referrals",
    "AI Companion": "Your AI companion",
    "Care Team": "Your care team",
    Settings: "Settings",
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand"><Brand /></div>
        <div className="workspace-label">YOUR SPACE</div>
        <nav>
          {navItems.map(([label, Icon]) => (
            <button
              key={label}
              className={`nav-item ${active === label ? "active" : ""}`}
              onClick={() => {
                setActive(label);
                setMobileMenu(false);
              }}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === "AI Companion" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="support-card">
            <div className="support-icon"><HandHeart size={19} /></div>
            <strong>You're not alone.</strong>
            <p>One step at a time, we're here with you.</p>
            <button onClick={() => setActive("AI Companion")}>
              Talk to your companion <ArrowRight size={14} />
            </button>
          </div>

          <div className="profile-mini">
            <div className="avatar">{firstName.slice(0, 1).toUpperCase()}</div>
            <div>
              <strong>{profile.name || user?.email}</strong>
              <small>{isIVF ? "IVF care journey" : "Maternity care journey"}</small>
            </div>
            <button title="Sign out of account" onClick={handleLogout} aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu-btn icon-btn"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          <div className="searchbox">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your care space..."
              aria-label="Search navigation"
            />
            {query && <button onClick={() => setQuery("")}><X size={14} /></button>}
          </div>

          <div className="topbar-actions">
            <button
              className="language-btn"
              onClick={() =>
                alert("Language selector: English is currently active. Additional regional languages can be enabled in a future release.")
              }
            >
              <Languages size={17} /> <span>English</span>
              <ChevronDown size={14} />
            </button>

            <div className="notification-wrap">
              <button
                className="icon-btn notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <Bell size={19} />
                <i />
              </button>
              {showNotifications && (
                <div className="notification-pop">
                  <strong>Care notifications</strong>
                  <p>
                    <span className="notice-dot" />
                    {appointments.length > 0
                      ? `You have ${appointments.length} active appointment record(s).`
                      : "No pending appointment alerts."}
                  </p>
                  <p>
                    <span className="notice-dot lavender" />
                    {notes.length} care and wellbeing logs saved.
                  </p>
                  <button onClick={() => setShowNotifications(false)}>Close</button>
                </div>
              )}
            </div>

            <button className="top-profile" onClick={() => setActive("Settings")}>
              <span className="avatar">{firstName.slice(0, 1).toUpperCase()}</span>
              <span>{profile.name || user?.email?.split("@")[0]}</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="breadcrumb">
                MAATRISHIELD <ChevronRight size={13} /> {active.toUpperCase()}
              </div>
              <h1>{titleMap[active] || active}</h1>
              <p>
                {active === "Home"
                  ? "A gentler way to stay connected to your maternal health."
                  : "Everything you need, thoughtfully gathered in one place."}
              </p>
            </div>
            <div className="today-pill">
              <span className="status-dot" /> Your journey, your pace
            </div>
          </div>

          {active === "Home" && (
            <HomePage
              profile={profile}
              firstName={firstName}
              isIVF={isIVF}
              currentStage={currentStage}
              mood={mood}
              setMood={setMood}
              symptom={symptom}
              setSymptom={setSymptom}
              checkedTasks={checkedTasks}
              toggleTask={toggleTask}
              setActive={setActive}
              appointments={appointments}
              onAddSymptom={handleAddSymptomNote}
              symptomSaving={symptomSaving}
              symptomNotice={symptomNotice}
            />
          )}

          {active === "My Journey" && (
            <JourneyPage
              isIVF={isIVF}
              stage={profile.stage}
              setProfile={finishOnboarding}
              profile={profile}
              onAddNote={(newNote) => setNotes((prev) => [newNote, ...prev])}
              onRefreshNotes={loadNotes}
              setActive={setActive}
            />
          )}

          {active === "Appointments" && (
            <AppointmentsPage
              appointments={appointments}
              loading={appointmentsLoading}
              onRefresh={loadAppointments}
            />
          )}

          {active === "Care Logs" && (
            <CareLogsPage
              notes={notes}
              loading={notesLoading}
              onRefresh={loadNotes}
              onAddNote={(newNote) => setNotes((prev) => [newNote, ...prev])}
            />
          )}

          {active === "Health Records" && (
            <RecordsPage
              notes={notes}
              loading={notesLoading}
              onRefresh={loadNotes}
              onAddNote={(newNote) => setNotes((prev) => [newNote, ...prev])}
            />
          )}

          {active === "Referrals" && <ReferralsPage />}

          {active === "AI Companion" && (
            <ChatPage
              messages={messages}
              input={chatInput}
              setInput={setChatInput}
              send={addChatMessage}
              busy={chatBusy}
              error={chatError}
            />
          )}

          {active === "Care Team" && (
            <CareTeamPage
              onAddNote={(newNote) => setNotes((prev) => [newNote, ...prev])}
              setActive={setActive}
            />
          )}

          {active === "Settings" && (
            <SettingsPage
              profile={profile}
              user={user}
              onSave={finishOnboarding}
              onLogout={handleLogout}
              saved={settingsSaved}
              setSaved={setSettingsSaved}
            />
          )}

          <footer className="page-footer">
            <span>
              <ShieldCheck size={14} /> Your privacy matters. Healthcare prototype · Non-clinical tool.
            </span>
            <span>MaatriShield AI · Full-Stack Care Coordination</span>
          </footer>
        </div>
      </main>

      {mobileMenu && (
        <button
          className="mobile-scrim"
          onClick={() => setMobileMenu(false)}
          aria-label="Close menu"
        />
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle, action, onAction }) {
  return (
    <div className="section-header">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && onAction && (
        <button type="button" className="text-action" onClick={onAction}>
          {action}
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

function HomePage({
  profile,
  firstName,
  isIVF,
  currentStage,
  mood,
  setMood,
  symptom,
  setSymptom,
  checkedTasks,
  toggleTask,
  setActive,
  appointments,
  onAddSymptom,
  symptomSaving,
  symptomNotice,
}) {
  const tasks = isIVF
    ? [
        "Take prescribed medication as directed",
        "Prepare questions for your next visit",
        "Record how you're feeling today",
      ]
    : [
        "Take prescribed prenatal supplements as directed",
        "Drink water and take a gentle break",
        "Note any symptoms or questions",
      ];

  const hasAppointment = appointments && appointments.length > 0;
  const nextApp = hasAppointment ? appointments[0] : null;

  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="eyebrow">A MOMENT JUST FOR YOU</span>
          <h2>
            Good morning, {firstName} <span>♡</span>
          </h2>
          <p>
            Your health journey matters. We're here for you at every step — with care that meets you
            where you are.
          </p>
          <div className="stage-chip" onClick={() => setActive("My Journey")} style={{ cursor: "pointer" }}>
            <span className="chip-flower"><Flower2 size={17} /></span>{" "}
            {isIVF ? currentStage.label : "Your pregnancy & maternity care"} <ChevronRight size={15} />
          </div>
        </div>
        <div className="welcome-illustration">
          <div className="illustration-sun" />
          <div className="illustration-person">
            <div className="person-hair" />
            <div className="person-head" />
            <div className="person-dress" />
            <div className="person-belly" />
          </div>
          <div className="leaf leaf1" />
          <div className="leaf leaf2" />
          <span className="illus-heart">♡</span>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard
          icon={isIVF ? Syringe : Baby}
          tint="pink"
          label="YOUR CURRENT STAGE"
          value={isIVF ? currentStage.label : "Maternity care"}
          sub={isIVF ? "Your journey, your pace" : "Personalised support"}
        />
        <StatCard
          icon={CalendarDays}
          tint="lavender"
          label="NEXT APPOINTMENT"
          value={hasAppointment ? nextApp.title : "Nothing booked yet"}
          sub={
            hasAppointment
              ? (nextApp.appointment_at ? `Date: ${nextApp.appointment_at}` : "Request logged")
              : "Plan your next check-in"
          }
        />
        <StatCard
          icon={HeartPulse}
          tint="peach"
          label="WELLBEING CHECK-IN"
          value={`Feeling ${mood}`}
          sub="Recorded in care logs"
        />
        <StatCard
          icon={ShieldCheck}
          tint="mint"
          label="DATABASE SYNC"
          value="Secure & Connected"
          sub="Persistent care records"
        />
      </div>

      <div className="content-grid">
        <div className="content-main">
          <section className="surface journey-surface">
            <SectionHeader
              title={isIVF ? "Your IVF journey" : "Your maternity journey"}
              subtitle="A simple view of the path ahead."
              action="View journey"
              onAction={() => setActive("My Journey")}
            />
            <JourneyTrack isIVF={isIVF} stage={profile.stage} />
          </section>

          <section className="surface">
            <SectionHeader title="A little care for today" subtitle="Small steps are still progress." />
            <div className="task-list">
              {tasks.map((task, i) => (
                <button
                  key={task}
                  type="button"
                  className={`task-row ${checkedTasks.includes(i) ? "task-done" : ""}`}
                  onClick={() => toggleTask(i)}
                >
                  <span className="task-check">
                    {checkedTasks.includes(i) && <Check size={14} />}
                  </span>
                  <span>{task}</span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
            <p className="care-disclaimer">
              Reminders are for organisation only. Follow instructions from your qualified healthcare professional.
            </p>
          </section>

          <section className="surface mood-surface">
            <SectionHeader title="How are you feeling today?" subtitle="Your wellbeing matters, too." />
            <div className="mood-options">
              {["Very low", "Low", "Okay", "Good", "Great"].map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={mood === m ? "mood-active" : ""}
                >
                  <span>{["☹", "◡", "😐", "☺", "♥"][i]}</span>
                  <small>{m}</small>
                </button>
              ))}
            </div>

            {/* Emergency Hotline for Low or Very Low Wellbeing */}
            {(mood === "Very low" || mood === "Low") && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  borderRadius: "14px",
                  background: "#fff1f0",
                  border: "1px solid #ffccc7",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cf1322", fontWeight: 700, fontSize: "12px" }}>
                  <AlertTriangle size={18} />
                  <span>URGENT WELLBEING SUPPORT: Feeling {mood}</span>
                </div>
                <p style={{ margin: 0, fontSize: "11px", color: "#5c3239", lineHeight: 1.6 }}>
                  If you are experiencing sudden severe physical symptoms, sharp pain, heavy bleeding, or acute emotional distress, please connect with emergency healthcare immediately.
                </p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <a
                    href="tel:108"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#d9534f",
                      color: "white",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "11px",
                      textDecoration: "none",
                    }}
                  >
                    🚨 Call 108 Emergency Ambulance
                  </a>
                  <a
                    href="https://www.google.com/maps/search/nearest+emergency+maternity+hospital"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#fff",
                      border: "1px solid #d9534f",
                      color: "#d9534f",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      fontWeight: 600,
                      fontSize: "11px",
                      textDecoration: "none",
                    }}
                  >
                    Nearest Maternity Hospital ↗
                  </a>
                </div>
              </div>
            )}

            <div className="symptom-entry">
              <input
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder="Log a symptom, question, or physical feeling..."
                disabled={symptomSaving}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onAddSymptom();
                }}
              />
              <button
                type="button"
                onClick={onAddSymptom}
                disabled={symptomSaving || !symptom.trim()}
              >
                <Plus size={16} /> {symptomSaving ? "Saving…" : "Save to log"}
              </button>
            </div>

            {symptomNotice && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px", background: "#f2fbf6", padding: "10px 14px", borderRadius: "10px" }}>
                <span className="success-text">
                  <CheckCircle2 size={15} /> {symptomNotice}
                </span>
                <button
                  type="button"
                  className="text-action"
                  onClick={() => setActive("Care Logs")}
                  style={{ fontSize: "11px" }}
                >
                  View in Care Logs <ArrowRight size={14} />
                </button>
              </div>
            )}
          </section>
        </div>

        <aside className="content-side">
          <section className="surface quick-actions">
            <SectionHeader title="Quick actions" />
            <div className="quick-grid">
              <QuickAction
                icon={CalendarDays}
                label="Appointments"
                onClick={() => setActive("Appointments")}
              />
              <QuickAction
                icon={ClipboardList}
                label="Care & Wellbeing Logs"
                onClick={() => setActive("Care Logs")}
              />
              <QuickAction
                icon={FileText}
                label="Health records"
                onClick={() => setActive("Health Records")}
              />
              <QuickAction
                icon={MessageCircle}
                label="Ask AI companion"
                onClick={() => setActive("AI Companion")}
              />
              <QuickAction
                icon={MapPin}
                label="Care referrals"
                onClick={() => setActive("Referrals")}
              />
            </div>
          </section>

          <section className="surface reminder-card">
            <div className="reminder-head">
              <span className="reminder-icon"><Heart size={18} /></span>
              <div>
                <h3>Gentle reminder</h3>
                <p>There's no one right way to feel.</p>
              </div>
            </div>
            <p className="reminder-copy">
              Take a breath, ask questions, and reach out to your care team whenever you need support.
            </p>
            <button className="soft-btn" onClick={() => setActive("AI Companion")}>
              I'm here to listen <ArrowRight size={15} />
            </button>
          </section>

          <section className="surface next-card">
            <SectionHeader
              title="Your next steps"
              action="See all"
              onAction={() => setActive("Appointments")}
            />
            <div className="next-step">
              <span className="next-step-icon"><CalendarDays size={18} /></span>
              <div>
                <strong>
                  {hasAppointment ? nextApp.title : "Plan a care check-in"}
                </strong>
                <small>
                  {hasAppointment
                    ? `Date: ${nextApp.appointment_at || "Logged"}`
                    : "Keep your questions in one place"}
                </small>
              </div>
            </div>
            <div className="next-step">
              <span className="next-step-icon lavender"><ClipboardList size={18} /></span>
              <div>
                <strong>Keep your records together</strong>
                <small>Notes, questions, and care logs</small>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, tint, label, value, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tint}`}><Icon size={20} /></div>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button className="quick-action" onClick={onClick}>
      <span><Icon size={19} /></span>
      <strong>{label}</strong>
      <ChevronRight size={15} />
    </button>
  );
}

function JourneyTrack({ isIVF, stage }) {
  const ivfStages = [
    { label: "Explore & prepare", icon: BookOpen, id: "exploring" },
    { label: "IVF treatment", icon: Syringe, id: "treatment" },
    { label: "Embryo transfer", icon: Heart, id: "transfer" },
    { label: "Pregnancy care", icon: Baby, id: "confirmed" },
  ];
  const nonStages = [
    { label: "Preparing for care", icon: Flower2, id: "prepare" },
    { label: "Pregnancy care", icon: Baby, id: "pregnancy" },
    { label: "Birth planning", icon: Heart, id: "birth" },
    { label: "Postpartum", icon: HandHeart, id: "postpartum" },
  ];
  const list = isIVF ? ivfStages : nonStages;
  const activeIndex = isIVF ? Math.max(0, stages.findIndex((s) => s.id === stage)) : 1;

  return (
    <div className="journey-track">
      {list.map((s, i) => {
        const Icon = s.icon;
        const done = i < activeIndex;
        const current = i === activeIndex;
        return (
          <div className={`journey-node ${done ? "done" : ""} ${current ? "current" : ""}`} key={s.label}>
            <div className="node-line" />
            <div className="node-circle">{done ? <Check size={17} /> : <Icon size={19} />}</div>
            <strong>{s.label}</strong>
            <small>{current ? "Current stage" : done ? "Completed" : "Coming up"}</small>
          </div>
        );
      })}
    </div>
  );
}

function JourneyPage({ isIVF, stage, setProfile, profile, onAddNote, onRefreshNotes, setActive }) {
  const [selected, setSelected] = useState(stage || "treatment");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [questionNote, setQuestionNote] = useState("");
  const [questionSaved, setQuestionSaved] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  const handleSaveStage = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await setProfile({
        ...profile,
        stage: isIVF ? selected : "non-ivf",
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!questionNote.trim() || savingQuestion) return;
    setSavingQuestion(true);
    try {
      const created = await notesAPI.create({
        category: "Visit Question",
        content: questionNote.trim(),
      });
      if (onAddNote) onAddNote(created);
      if (onRefreshNotes) await onRefreshNotes();
      setQuestionNote("");
      setQuestionSaved(true);
      setTimeout(() => setQuestionSaved(false), 4000);
    } catch {
      alert("Could not save question to the database.");
    } finally {
      setSavingQuestion(false);
    }
  };

  return (
    <div className="page-columns">
      <section className="surface wide-surface">
        <SectionHeader
          title={isIVF ? "Your fertility-to-maternity timeline" : "Your maternity care path"}
          subtitle="Your journey can look different from someone else's — and that's completely okay."
        />
        <div className="large-timeline">
          {(isIVF
            ? stages
            : [
                { id: "prepare", label: "Preparing for pregnancy", description: "Questions, appointments and care planning", icon: Flower2 },
                { id: "pregnancy", label: "Pregnancy care", description: "Check-ins, records and maternal support", icon: Baby },
                { id: "birth", label: "Preparing for birth", description: "Discuss your birth preferences with your clinician", icon: Heart },
                { id: "postpartum", label: "Postpartum & recovery", description: "Follow-up care and emotional wellbeing", icon: HandHeart },
              ]
          ).map((s, i) => {
            const Icon = s.icon;
            const current = isIVF ? s.id === stage : i === 1;
            return (
              <div className={`timeline-item ${current ? "timeline-current" : ""}`} key={s.id + i}>
                <div className="timeline-rail">
                  <span><Icon size={18} /></span>
                </div>
                <div className="timeline-copy">
                  <div className="timeline-title">
                    <h4>{s.label}</h4>
                    {current && <span className="current-badge">YOUR ACTIVE STAGE</span>}
                  </div>
                  <p>{s.description}</p>
                  {current && (
                    <small>Active stage configured. Your dashboard and reminders adapt to this stage.</small>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div style={{ display: "grid", gap: "18px" }}>
        <section className="surface">
          <SectionHeader
            title="Your journey settings"
            subtitle="Select and save your active stage to align reminders and care tracking."
          />
          {isIVF ? (
            <div className="stage-list journey-stage-list">
              {stages.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelected(s.id)}
                  className={`stage-option ${selected === s.id ? "selected" : ""}`}
                >
                  <span className="stage-icon"><s.icon size={18} /></span>
                  <span>
                    <strong>{s.label}</strong>
                    <small>{s.description}</small>
                  </span>
                  {selected === s.id && <CheckCircle2 size={18} className="selected-check" />}
                </button>
              ))}
            </div>
          ) : (
            <p className="muted">
              Your non-IVF maternity path is selected. You can switch pathways in Settings anytime.
            </p>
          )}

          <button
            className="primary-btn full margin-top"
            onClick={handleSaveStage}
            disabled={saving}
          >
            {saving ? "Updating journey stage…" : "Save journey stage"} <Check size={16} />
          </button>

          {saveSuccess && (
            <p className="success-text margin-top">
              <CheckCircle2 size={15} /> Journey stage updated to "{stages.find(s=>s.id===selected)?.label || selected}". Home space is now aligned!
            </p>
          )}
        </section>

        <section className="surface">
          <SectionHeader
            title="Questions for your next visit"
            subtitle="Store questions here; they seed directly into your Health Records and Care Logs."
          />
          <textarea
            className="notes-area"
            value={questionNote}
            onChange={(e) => setQuestionNote(e.target.value)}
            placeholder="Add a question or topic to discuss with your obstetrician or fertility doctor..."
          />
          <button
            className="soft-btn margin-top"
            onClick={handleSaveQuestion}
            disabled={!questionNote.trim() || savingQuestion}
          >
            {savingQuestion ? "Saving to database…" : "Save question to records"} <ArrowRight size={15} />
          </button>
          {questionSaved && (
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f2fbf6", padding: "10px", borderRadius: "10px" }}>
              <span className="success-text">
                <CheckCircle2 size={15} /> Saved to Health Records & Care Logs!
              </span>
              <button
                type="button"
                className="text-action"
                onClick={() => setActive("Health Records")}
                style={{ fontSize: "11px" }}
              >
                View Records <ArrowRight size={14} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AppointmentsPage({ appointments, loading, onRefresh }) {
  const [kind, setKind] = useState("Routine check-in");
  const [date, setDate] = useState("");
  const [notesText, setNotesText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!date) {
      setErrorMsg("Please select a date for your appointment.");
      return;
    }

    if (date < todayStr) {
      setErrorMsg("Appointments can only be scheduled for today or future dates.");
      return;
    }

    setSubmitting(true);
    setSuccess(false);

    try {
      await appointmentsAPI.create({
        title: kind,
        appointment_at: date,
        notes: notesText.trim(),
      });
      setDate("");
      setNotesText("");
      setSuccess(true);
      if (onRefresh) await onRefresh();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Could not save appointment record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this appointment record?")) return;
    setDeletingId(id);
    try {
      await appointmentsAPI.delete(id);
      if (onRefresh) await onRefresh();
    } catch (err) {
      alert("Failed to delete appointment record.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-columns">
      <section className="surface wide-surface">
        <SectionHeader
          title="Your appointments"
          subtitle="Keep visits and questions organised in your secure account."
        />

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            Loading your appointments from database…
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
            {appointments.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #f0e4ec",
                  borderRadius: "13px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    background: "#f2edff",
                    color: "#9571c9",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <CalendarDays size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <strong style={{ fontSize: "13px", color: "#47243f" }}>{item.title}</strong>
                    <span
                      style={{
                        fontSize: "9px",
                        padding: "4px 8px",
                        borderRadius: "99px",
                        background: "#eaf7f1",
                        color: "#4e9d7c",
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {item.status || "requested"}
                    </span>
                  </div>
                  {item.appointment_at && (
                    <div style={{ fontSize: "11px", color: "#a28a9e", marginTop: "4px" }}>
                      📅 Scheduled: <strong>{item.appointment_at}</strong>
                    </div>
                  )}
                  {item.notes && (
                    <p style={{ fontSize: "11px", color: "#8d778a", margin: "6px 0 0", lineHeight: 1.5 }}>
                      {item.notes}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  title="Remove record"
                  aria-label="Remove appointment record"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-illustration"><CalendarDays size={30} /></div>
            <h3>No appointments added yet</h3>
            <p>Log your upcoming clinic visit details using the form on the right.</p>
          </div>
        )}

        <div className="appointment-tip">
          <Clock size={18} />
          <p>
            <strong>Helpful care reminder</strong>
            <br />
            Keep a short list of symptoms and questions in your Care Logs to share with your clinician.
          </p>
        </div>
      </section>

      <section className="surface" id="appointment-form">
        <SectionHeader
          title="Plan a check-in"
          subtitle="Date is mandatory (today onwards). Records save directly to database."
        />
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Type of visit
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option>Routine check-in</option>
              <option>Fertility consultation</option>
              <option>Ultrasound / Scan</option>
              <option>Pregnancy care</option>
              <option>Postpartum follow-up</option>
              <option>Discuss symptoms & questions</option>
            </select>
          </label>

          <label>
            Scheduled date * (Mandatory — today onwards)
            <input
              type="date"
              value={date}
              min={todayStr}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label>
            Notes for your care team (Optional)
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Questions, current medication dosages, or symptoms to discuss..."
            />
          </label>

          {errorMsg && (
            <p style={{ color: "#a22d45", fontSize: "11px", margin: 0 }}>
              {errorMsg}
            </p>
          )}

          {success && (
            <p className="success-text">
              <CheckCircle2 size={15} /> Appointment record saved successfully!
            </p>
          )}

          <button className="primary-btn full" type="submit" disabled={submitting}>
            {submitting ? "Saving record…" : "Save appointment record"} <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </div>
  );
}

function CareLogsPage({ notes, loading, onRefresh, onAddNote }) {
  const [filter, setFilter] = useState("All");
  const [newLogText, setNewLogText] = useState("");
  const [newCategory, setNewCategory] = useState("Symptom Log");
  const [saving, setSaving] = useState(false);

  const categories = ["All", "Daily Wellbeing", "Symptom Log", "Visit Question", "Care note"];

  const filtered = notes.filter((n) => {
    if (filter === "All") return true;
    return n.category && n.category.toLowerCase().includes(filter.toLowerCase());
  });

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLogText.trim() || saving) return;
    setSaving(true);
    try {
      const created = await notesAPI.create({
        category: newCategory,
        content: newLogText.trim(),
      });
      if (onAddNote) onAddNote(created);
      if (onRefresh) await onRefresh();
      setNewLogText("");
    } catch {
      alert("Failed to save log entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this log entry?")) return;
    try {
      await notesAPI.delete(id);
      if (onRefresh) await onRefresh();
    } catch {
      alert("Failed to delete log entry.");
    }
  };

  return (
    <div className="page-columns">
      <section className="surface wide-surface">
        <SectionHeader
          title="Care & Wellbeing Logs"
          subtitle="Your complete chronological timeline of symptoms, wellbeing check-ins, and clinician questions."
        />

        <div className="filter-pills" style={{ marginTop: 0, marginBottom: "16px" }}>
          {categories.map((c) => (
            <button
              key={c}
              className={filter === c ? "filter-active" : ""}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
            Loading care logs from database…
          </div>
        ) : filtered.length > 0 ? (
          <div className="record-list">
            {filtered.map((item) => (
              <div className="record-row" key={item.id}>
                <span className="record-icon" style={{ background: item.category?.includes("Wellbeing") ? "#fff0f6" : "#f2edff" }}>
                  {item.category?.includes("Wellbeing") ? <Heart size={18} /> : <FileText size={18} />}
                </span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "12px" }}>{item.category}</strong>
                    <span style={{ fontSize: "9px", color: "var(--muted)" }}>
                      {item.created_at ? new Date(item.created_at).toLocaleString() : "Recently"}
                    </span>
                  </div>
                  <p style={{ margin: "5px 0 0", fontSize: "11px", color: "#56304d", lineHeight: 1.6 }}>
                    {item.content}
                  </p>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => handleDelete(item.id)}
                  title="Delete log"
                  aria-label="Delete log"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-illustration"><ClipboardList size={30} /></div>
            <h3>No entries found in this category</h3>
            <p>Log a symptom or mood check-in using the quick entry on the right or on the Home page.</p>
          </div>
        )}
      </section>

      <section className="surface">
        <SectionHeader
          title="Add a new log entry"
          subtitle="Directly stored in your personal database."
        />
        <form className="form-stack" onSubmit={handleAddLog}>
          <label>
            Log Category
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              <option>Symptom Log</option>
              <option>Daily Wellbeing</option>
              <option>Visit Question</option>
              <option>Care note</option>
              <option>Medication note</option>
            </select>
          </label>

          <label>
            Log Content
            <textarea
              value={newLogText}
              onChange={(e) => setNewLogText(e.target.value)}
              placeholder="Describe physical sensations, questions, or feelings..."
              required
            />
          </label>

          <button className="primary-btn full" type="submit" disabled={saving}>
            {saving ? "Saving to database…" : "Save entry to Care Logs"} <Plus size={15} />
          </button>
        </form>
      </section>
    </div>
  );
}

function RecordsPage({ notes, loading, onRefresh, onAddNote }) {
  const [newCategory, setNewCategory] = useState("Care note");
  const [newContent, setNewContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Simulated uploaded document labels with persistent localStorage so removals stay removed!
  const [simulatedFiles, setSimulatedFiles] = useState(() => {
    try {
      const stored = localStorage.getItem("maatrishield-simulated-docs");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      "Bloodwork Report — Q3 (Simulated demo file)",
      "Ultrasound scan summary (Simulated demo file)",
    ];
  });

  const removeDoc = (idx) => {
    const updated = simulatedFiles.filter((_, i) => i !== idx);
    setSimulatedFiles(updated);
    try {
      localStorage.setItem("maatrishield-simulated-docs", JSON.stringify(updated));
    } catch {}
  };

  const addDoc = (label) => {
    if (!label?.trim()) return;
    const updated = [label.trim(), ...simulatedFiles];
    setSimulatedFiles(updated);
    try {
      localStorage.setItem("maatrishield-simulated-docs", JSON.stringify(updated));
    } catch {}
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newContent.trim() || savingNote) return;

    setSavingNote(true);
    try {
      const created = await notesAPI.create({
        category: newCategory,
        content: newContent.trim(),
      });
      if (onAddNote) onAddNote(created);
      setNewContent("");
      if (onRefresh) await onRefresh();
    } catch (err) {
      alert("Failed to save health note to server.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm("Are you sure you want to delete this health note?")) return;
    setDeletingId(id);
    try {
      await notesAPI.delete(id);
      if (onRefresh) await onRefresh();
    } catch (err) {
      alert("Failed to delete health note.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-columns">
      <section className="surface wide-surface">
        <SectionHeader
          title="Your health notes & questions"
          subtitle="Notes saved from My Journey, Care Logs, and this page are preserved in your database."
        />

        <div className="record-banner">
          <div className="record-banner-icon"><FileText size={23} /></div>
          <div>
            <strong>Persistent Health Records & Doctor Questions</strong>
            <p>Every note or question you log is stored securely in your user account.</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
            Loading notes from database…
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="record-list">
            {notes.map((n) => (
              <div className="record-row" key={n.id}>
                <span className="record-icon"><FileText size={18} /></span>
                <div>
                  <strong>{n.category}</strong>
                  <p style={{ margin: "4px 0", fontSize: "11px", color: "#6a4e66" }}>{n.content}</p>
                  <small>
                    Saved {n.created_at ? new Date(n.created_at).toLocaleDateString() : "recently"}
                  </small>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => handleDeleteNote(n.id)}
                  disabled={deletingId === n.id}
                  title="Remove note"
                  aria-label="Remove note"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-illustration"><FileText size={28} /></div>
            <h3>No health notes logged yet</h3>
            <p>Add symptoms, questions, or visit notes using the form on the right.</p>
          </div>
        )}

        <div style={{ marginTop: "30px", borderTop: "1px solid #f2e6ee", paddingTop: "20px" }}>
          <SectionHeader
            title="Document Hub (Simulated Demo)"
            subtitle="Removals persist in this browser. Cloud storage (AWS S3/GCS with encryption) can be connected for PDF scans."
          />
          {simulatedFiles.length > 0 ? (
            <div className="record-list">
              {simulatedFiles.map((file, i) => (
                <div className="record-row" key={file + i}>
                  <span className="record-icon" style={{ background: "#fdf0f5", color: "#b94f84" }}>
                    <FileText size={18} />
                  </span>
                  <div>
                    <strong>{file}</strong>
                    <small>Prototype document label · Persisted removal</small>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => removeDoc(i)}
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "11px", color: "var(--muted)", margin: "10px 0" }}>
              All simulated documents have been removed. You can add new labels below.
            </p>
          )}
        </div>
      </section>

      <section className="surface">
        <SectionHeader
          title="Add a health note"
          subtitle="Saves directly to your database."
        />
        <form className="form-stack" onSubmit={handleAddNote}>
          <label>
            Category
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              <option>Care note</option>
              <option>Symptom log</option>
              <option>Visit question</option>
              <option>Medication note</option>
              <option>Emotional wellbeing</option>
            </select>
          </label>

          <label>
            Note content
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Record any sensations, questions, or reminders..."
              required
            />
          </label>

          <button className="primary-btn full" type="submit" disabled={savingNote}>
            {savingNote ? "Saving to database…" : "Save health note"} <Plus size={15} />
          </button>
        </form>

        <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #f4eaf1" }}>
          <button
            type="button"
            className="upload-zone"
            onClick={() => {
              const label = prompt("Enter a label for this simulated document (e.g., Blood test report):");
              if (label?.trim()) addDoc(label);
            }}
          >
            <Upload size={23} />
            <strong>Add document label</strong>
            <small>Prototype demonstration · Saves label in browser</small>
          </button>
        </div>
      </section>
    </div>
  );
}

function ReferralsPage() {
  const [status, setStatus] = useState("All");

  // Persist requested referrals in localStorage so they survive page refresh!
  const [requestedMap, setRequestedMap] = useState(() => {
    try {
      const stored = localStorage.getItem("maatrishield-requested-referrals");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const referrals = [
    { name: "Women's health consultation", detail: "Discuss reproductive health with a qualified gynaecologist.", status: "Suggested", query: "Gynecologist obstetrician clinic" },
    { name: "Fertility specialist", detail: "For IVF treatment protocols, egg retrieval, and embryo monitoring.", status: "Suggested", query: "IVF fertility specialist clinic" },
    { name: "Maternal mental wellbeing", detail: "Empathetic emotional support for fertility and pregnancy stress.", status: "Available", query: "Maternal mental health counselor" },
    { name: "Pelvic health physiotherapist", detail: "Prenatal and postpartum pelvic floor strengthening and recovery.", status: "Available", query: "Pelvic floor physiotherapist" },
  ];

  const handleMarkRequested = (name) => {
    const next = { ...requestedMap, [name]: true };
    setRequestedMap(next);
    try {
      localStorage.setItem("maatrishield-requested-referrals", JSON.stringify(next));
    } catch {}
  };

  const shown = referrals.filter((r) => {
    const isReq = !!requestedMap[r.name];
    const currentStatus = isReq ? "Requested" : r.status;
    return status === "All" || currentStatus === status;
  });

  return (
    <section className="surface">
      <SectionHeader
        title="Care referrals & Find Services"
        subtitle="Search nearest specialist clinics directly on Google Maps or mark for follow-up."
      />
      <div className="referral-notice">
        <ShieldCheck size={18} />
        <span>
          Suggestions are informational guides only. Click "Find on Google Maps" to locate nearby clinics.
        </span>
      </div>

      <div className="filter-pills">
        {["All", "Suggested", "Available", "Requested"].map((s) => (
          <button
            key={s}
            className={status === s ? "filter-active" : ""}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="referral-list">
        {shown.map((r) => {
          const isReq = !!requestedMap[r.name];
          const currentStatus = isReq ? "Requested" : r.status;

          return (
            <div className="referral-card" key={r.name} style={{ flexWrap: "wrap" }}>
              <div className="referral-symbol"><Stethoscope size={20} /></div>
              <div className="referral-copy" style={{ minWidth: "220px" }}>
                <strong>{r.name}</strong>
                <p>{r.detail}</p>
                <span className={`referral-status ${currentStatus === "Available" ? "status-green" : currentStatus === "Requested" ? "status-requested" : ""}`}>
                  {currentStatus}
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginLeft: "auto" }}>
                {/* Real Google Maps Search Redirect */}
                <a
                  href={`https://www.google.com/maps/search/nearest+${encodeURIComponent(r.query || r.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="soft-btn"
                  style={{ textDecoration: "none", color: "#b94f84" }}
                >
                  <MapPin size={14} /> Nearest on Maps <ExternalLink size={12} />
                </a>

                {/* Mark as requested with persistent localStorage */}
                <button
                  className="soft-btn"
                  onClick={() => handleMarkRequested(r.name)}
                  disabled={isReq}
                  style={isReq ? { background: "#eaf7f1", color: "#4e9d7c", borderColor: "#c6e9d8" } : undefined}
                >
                  {isReq ? "✓ Requested (Saved)" : "Mark for follow-up"} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ChatPage({ messages, input, setInput, send, busy, error }) {
  const suggestions = [
    "What precautions should I take for mild lower abdominal cramping?",
    "How can I manage morning sickness and nausea safely?",
    "What are the warning signs of pre-eclampsia and headache?",
    "What precautions should I follow after an IVF embryo transfer?",
    "What medications are safe for headache or body pain?",
  ];

  return (
    <div className="chat-layout">
      <section className="surface chat-panel">
        <div className="chat-heading">
          <div className="ai-avatar"><Sparkles size={22} /></div>
          <div>
            <h3>Maatri Companion</h3>
            <p><span className="status-dot" /> Connected to FastAPI backend safety assistant</p>
          </div>
          <span className="beta-label">AI ASSISTANT</span>
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div
              className={`chat-message ${m.from === "you" ? "from-user" : ""}`}
              key={i}
            >
              <div
                className="chat-bubble"
                style={
                  m.urgent
                    ? { border: "1px solid #f5c2c7", background: "#f8d7da", color: "#842029" }
                    : m.isError
                    ? { border: "1px solid #ffeeba", background: "#fff3cd", color: "#856404" }
                    : undefined
                }
              >
                <div style={{ whiteSpace: "pre-line" }}>{m.text}</div>
                {m.disclaimer && (
                  <div style={{ marginTop: "6px", fontSize: "9px", opacity: 0.75, fontStyle: "italic" }}>
                    {m.disclaimer}
                  </div>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="chat-message">
              <div className="chat-bubble" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Maatri companion is preparing care guidance…</span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: "0 16px 8px", color: "#a22d45", fontSize: "11px" }}>
            {error}
          </div>
        )}

        <form
          className="chat-compose"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about pain, precautions, IVF protocols, or symptoms..."
            disabled={busy}
          />
          <button
            className="send-btn"
            aria-label="Send message"
            type="submit"
            disabled={busy || !input.trim()}
          >
            <Send size={17} />
          </button>
        </form>

        <p className="chat-safety">
          <ShieldCheck size={14} /> This assistant is an educational care coordinator. It does not diagnose, prescribe, or monitor emergencies.
        </p>
      </section>

      <aside className="surface chat-suggestions">
        <SectionHeader title="Things we can explore (Click to Ask)" />
        {suggestions.map((x, i) => (
          <button
            key={x}
            type="button"
            className="suggestion-row"
            onClick={() => send(x)}
            title="Click to ask this question"
          >
            <span>
              {[<ClipboardList size={17} />, <Smile size={17} />, <AlertTriangle size={17} />, <Heart size={17} />, <Pill size={17} />][i]}
            </span>
            <span style={{ flex: 1 }}>{x}</span>
            <Send size={14} style={{ color: "var(--pink)", marginLeft: "6px" }} />
          </button>
        ))}

        <div className="chat-warning">
          <AlertTriangle size={18} />
          <p>
            <strong>EMERGENCY NOTICE:</strong> If you experience heavy bleeding, severe abdominal pain, chest pain, or fluid leakage, call ambulance helpline <strong>108</strong> or go to emergency maternity triage immediately.
          </p>
        </div>
      </aside>
    </div>
  );
}

function CareTeamPage({ onAddNote, setActive }) {
  const [activeDraft, setActiveDraft] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [savedSuccess, setSavedSuccess] = useState("");

  const team = [
    {
      name: "Care coordinator",
      role: "Helps you organise questions, records, and clinician appointments",
      initial: "CC",
      bg: "#EEDFF8",
      query: "Maternal care coordinator hospital",
    },
    {
      name: "Obstetrician / Gynaecologist",
      role: "Maternal monitoring, reproductive health, and delivery care",
      initial: "OB",
      bg: "#F9DDE7",
      query: "Obstetrician Gynecologist clinic",
    },
    {
      name: "Fertility specialist",
      role: "IVF treatment protocols, egg retrieval, and embryo monitoring",
      initial: "FS",
      bg: "#FCE7D9",
      query: "IVF Fertility specialist doctor",
    },
    {
      name: "Wellbeing counsellor",
      role: "Emotional and mental health support through all maternal stages",
      initial: "WB",
      bg: "#DDEFE7",
      query: "Maternal mental health counselor therapist",
    },
  ];

  const handleSaveQuestion = async (member) => {
    if (!draftText.trim()) return;
    try {
      const created = await notesAPI.create({
        category: `Questions for ${member.name}`,
        content: draftText.trim(),
      });
      if (onAddNote) onAddNote(created);
      setDraftText("");
      setActiveDraft(null);
      setSavedSuccess(`Question for ${member.name} saved to your Health Records & Care Logs!`);
      setTimeout(() => setSavedSuccess(""), 4000);
    } catch {
      alert("Failed to save drafted question.");
    }
  };

  return (
    <section className="surface">
      <SectionHeader
        title="Your care team & Specialist Directory"
        subtitle="Locate nearest specialists on Google Maps or draft questions for your next clinical visit."
      />

      {savedSuccess && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", background: "#f2fbf6", padding: "12px", borderRadius: "12px" }}>
          <span className="success-text"><CheckCircle2 size={16} /> {savedSuccess}</span>
          <button type="button" className="text-action" onClick={() => setActive("Health Records")}>
            View Records <ArrowRight size={14} />
          </button>
        </div>
      )}

      <div className="team-grid">
        {team.map((member) => (
          <div className="team-card" key={member.name}>
            <div className="team-avatar" style={{ background: member.bg }}>{member.initial}</div>
            <h3>{member.name}</h3>
            <p>{member.role}</p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
              {/* Google Maps Search Link */}
              <a
                href={`https://www.google.com/maps/search/nearest+${encodeURIComponent(member.query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="soft-btn"
                style={{ textDecoration: "none", color: "#b94f84" }}
              >
                <MapPin size={13} /> Find on Maps <ExternalLink size={12} />
              </a>

              {/* In-Card Question Composer */}
              <button
                type="button"
                className="soft-btn"
                onClick={() => {
                  setActiveDraft(activeDraft === member.name ? null : member.name);
                  setDraftText("");
                }}
              >
                Draft Questions ✍️
              </button>
            </div>

            {activeDraft === member.name && (
              <div style={{ marginTop: "14px", padding: "12px", background: "#fffafc", border: "1px solid #f0dfe9", borderRadius: "10px" }}>
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder={`Write down question to ask your ${member.name}...`}
                  style={{ width: "100%", minHeight: "70px", padding: "8px", fontSize: "11px", border: "1px solid #eedee6", borderRadius: "8px", outline: "none" }}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button
                    type="button"
                    className="primary-btn"
                    style={{ padding: "8px 12px", fontSize: "11px" }}
                    onClick={() => handleSaveQuestion(member)}
                  >
                    Save to Health Records <Check size={14} />
                  </button>
                  <button
                    type="button"
                    className="soft-btn"
                    onClick={() => setActiveDraft(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsPage({ profile, user, onSave, onLogout, saved, setSaved }) {
  const [name, setName] = useState(profile.name || "");
  const [ivf, setIvf] = useState(!!profile.ivf);
  const [stage, setStage] = useState(profile.stage || "treatment");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...profile,
        name: name.trim() || "Friend",
        ivf,
        stage: ivf ? stage : "non-ivf",
        completed: true,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-columns">
      <section className="surface wide-surface">
        <SectionHeader
          title="Your profile & preferences"
          subtitle="Update your name and maternal care journey preferences."
        />
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            First name / Preferred name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label>
            Care pathway
            <select
              value={ivf ? "ivf" : "non-ivf"}
              onChange={(e) => setIvf(e.target.value === "ivf")}
            >
              <option value="ivf">IVF is part of my journey</option>
              <option value="non-ivf">Not through IVF</option>
            </select>
          </label>

          {ivf && (
            <label>
              Current IVF stage
              <select value={stage} onChange={(e) => setStage(e.target.value)}>
                {stages.map((s) => (
                  <option value={s.id} key={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
          )}

          <button className="primary-btn" type="submit" disabled={saving}>
            {saving ? "Saving changes…" : "Save profile changes"} <Check size={16} />
          </button>

          {saved && (
            <p className="success-text">
              <CheckCircle2 size={15} /> Preferences saved to database.
            </p>
          )}
        </form>
      </section>

      <div style={{ display: "grid", gap: "18px" }}>
        <section className="surface">
          <SectionHeader
            title="Account & Security"
            subtitle="Your account session and database connection."
          />
          <div className="setting-row">
            <span className="setting-icon"><ShieldCheck size={19} /></span>
            <div>
              <strong>Account email</strong>
              <small>{user?.email || "Authenticated user"}</small>
            </div>
          </div>

          <div className="setting-row">
            <span className="setting-icon"><HeartPulse size={19} /></span>
            <div>
              <strong>Database status</strong>
              <small>Persistent session active</small>
            </div>
          </div>

          <button
            type="button"
            className="danger-btn full margin-top"
            onClick={onLogout}
          >
            <LogOut size={16} /> Sign out of account
          </button>
        </section>
      </div>
    </div>
  );
}

export default App;
