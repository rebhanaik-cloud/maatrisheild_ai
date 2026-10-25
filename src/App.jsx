import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Activity, ArrowDown, ArrowLeft, ArrowRight, Baby, Bell, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, ClipboardList,
  FileText, Heart, HeartPulse, Home, Menu, MessageCircle, Pill, Plus,
  Search, Send, Settings, ShieldCheck, Sparkles, Stethoscope, Syringe,
  Upload, UserRound, Users, X, Flower2, MapPin, Clock, Droplets, Smile,
  HandHeart, BookOpen, LogOut, Languages, AlertTriangle, Trash2, Loader2
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
  ["Home", Home], ["My Journey", Activity], ["Appointments", CalendarDays],
  ["Health Records", FileText], ["Referrals", HandHeart], ["AI Companion", MessageCircle],
  ["Care Team", Users], ["Settings", Settings]
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
  // Safe profile hydration
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [active, setActive] = useState("Home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [mood, setMood] = useState("Good");
  const [symptom, setSymptom] = useState("");
  const [checkedTasks, setCheckedTasks] = useState([0]);
  const [settingsSaved, setSettingsSaved] = useState(false);

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
      text: "Hi! I'm your Maatri companion. I'm here to help you organise your care journey, record your notes, and prepare questions for your healthcare team. How can I support you today?",
    },
  ]);

  // Load backend profile if missing in local state
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

  // Load appointments from backend
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

  // Load health notes from backend
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
    setActive("Home");
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

  const resetProfile = () => {
    setStoredProfile(null);
    setProfile(null);
  };

  const firstName = profile?.name || user?.email?.split("@")[0] || "there";
  const isIVF = !!profile?.ivf;
  const currentStage = stages.find((s) => s.id === profile?.stage) || stages[1];
  const toggleTask = (i) =>
    setCheckedTasks((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  // AI Chat message sender
  const addChatMessage = async () => {
    const question = chatInput.trim();
    if (!question || chatBusy) return;

    setChatError("");
    setMessages((prev) => [...prev, { from: "you", text: question }]);
    setChatInput("");
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
      const newNote = await notesAPI.create({
        category: mood ? `Mood: ${mood}` : "Daily Check-in",
        content: symptom.trim(),
      });
      setNotes((prev) => [newNote, ...prev]);
      setSymptom("");
      setSymptomNotice("Your health note has been saved to your account database.");
      setTimeout(() => setSymptomNotice(""), 4000);
    } catch (err) {
      alert("Could not save health note. Please check your network connection.");
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
            <button title="Sign out of account" onClick={onLogout} aria-label="Sign out">
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
                alert("Language selector: English is currently active. Additional languages can be enabled in a future release.")
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
                    Session connected to secure database.
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
            />
          )}

          {active === "Appointments" && (
            <AppointmentsPage
              appointments={appointments}
              loading={appointmentsLoading}
              onRefresh={loadAppointments}
            />
          )}

          {active === "Health Records" && (
            <RecordsPage
              notes={notes}
              loading={notesLoading}
              onRefresh={loadNotes}
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

          {active === "Care Team" && <CareTeamPage />}

          {active === "Settings" && (
            <SettingsPage
              profile={profile}
              user={user}
              onSave={finishOnboarding}
              onReset={resetProfile}
              onLogout={onLogout}
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
      {action && (
        <button className="text-action" onClick={onAction}>
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
          <div className="stage-chip">
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
              <p className="success-text margin-top">
                <CheckCircle2 size={15} /> {symptomNotice}
              </p>
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
                icon={Upload}
                label="Health records & notes"
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
                    ? `Status: ${nextApp.status || "requested"}`
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

function JourneyPage({ isIVF, stage, setProfile, profile }) {
  const [selected, setSelected] = useState(stage || "treatment");
  const [saving, setSaving] = useState(false);
  const [questionNote, setQuestionNote] = useState("");
  const [questionSaved, setQuestionSaved] = useState(false);

  const handleSaveStage = async () => {
    setSaving(true);
    try {
      await setProfile({
        ...profile,
        stage: isIVF ? selected : "non-ivf",
      });
      alert("Your care journey stage has been updated and saved to your account.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!questionNote.trim()) return;
    try {
      await notesAPI.create({
        category: "Visit Question",
        content: questionNote.trim(),
      });
      setQuestionNote("");
      setQuestionSaved(true);
      setTimeout(() => setQuestionSaved(false), 3000);
    } catch {
      alert("Could not save question to the database.");
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
                    {current && <span className="current-badge">YOUR STAGE</span>}
                  </div>
                  <p>{s.description}</p>
                  {current && (
                    <small>Use this space to organise questions and next steps with your clinician.</small>
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
            subtitle="Update your stage as your care progresses."
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
              Your non-IVF maternity path is selected. You can adjust your care pathway in Settings anytime.
            </p>
          )}
          <button
            className="primary-btn full margin-top"
            onClick={handleSaveStage}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save journey stage"} <Check size={16} />
          </button>
        </section>

        <section className="surface">
          <SectionHeader
            title="Questions for your next visit"
            subtitle="Store questions here so you don't forget during clinician appointments."
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
            disabled={!questionNote.trim()}
          >
            Save question to records <ArrowRight size={15} />
          </button>
          {questionSaved && (
            <p className="success-text margin-top">
              <CheckCircle2 size={15} /> Question saved to your Health Records.
            </p>
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
  const [deletingId, setDeletingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      await appointmentsAPI.create({
        title: kind,
        appointment_at: date || null,
        notes: notesText.trim(),
      });
      setDate("");
      setNotesText("");
      setSuccess(true);
      if (onRefresh) await onRefresh();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      alert(err.message || "Could not save appointment record.");
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
          action="Plan an appointment"
          onAction={() => document.getElementById("appointment-form")?.scrollIntoView({ behavior: "smooth" })}
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
            <p>Request a check-in or log your upcoming clinic visit details using the form.</p>
          </div>
        )}

        <div className="appointment-tip">
          <Clock size={18} />
          <p>
            <strong>Helpful care reminder</strong>
            <br />
            Keep a short list of symptoms and questions in your Health Records to share with your clinician.
          </p>
        </div>

        <div style={{ marginTop: "14px", fontSize: "10px", color: "var(--muted)", lineHeight: 1.5 }}>
          ℹ️ <em>Real database persistence:</em> Appointment records are stored in your user account. Clinic API integrations for automatic EHR booking require clinical coordination.
        </div>
      </section>

      <section className="surface" id="appointment-form">
        <SectionHeader
          title="Plan a check-in"
          subtitle="Records are saved directly to your account database."
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
            Preferred or scheduled date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label>
            Notes for your care team
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Questions, current medication dosages, or symptoms to discuss..."
            />
          </label>

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

function RecordsPage({ notes, loading, onRefresh }) {
  const [newCategory, setNewCategory] = useState("Care note");
  const [newContent, setNewContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Simulated uploaded document labels
  const [simulatedFiles, setSimulatedFiles] = useState([
    "Bloodwork Report — Q3 (Simulated demo file)",
    "Ultrasound scan summary (Simulated demo file)",
  ]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newContent.trim() || savingNote) return;

    setSavingNote(true);
    try {
      await notesAPI.create({
        category: newCategory,
        content: newContent.trim(),
      });
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
          title="Your health notes & symptoms"
          subtitle="Persistent health notes stored securely in your database."
        />

        <div className="record-banner">
          <div className="record-banner-icon"><FileText size={23} /></div>
          <div>
            <strong>Persistent Health Records</strong>
            <p>Notes logged here or from the home check-in are saved to your account database.</p>
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
            subtitle="Prototype file attachment interface. Cloud storage (AWS S3/GCS with encryption) can be connected for PDF scans."
          />
          <div className="record-list">
            {simulatedFiles.map((file, i) => (
              <div className="record-row" key={file}>
                <span className="record-icon" style={{ background: "#fdf0f5", color: "#b94f84" }}>
                  <FileText size={18} />
                </span>
                <div>
                  <strong>{file}</strong>
                  <small>Prototype document label · Local device simulation</small>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setSimulatedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove item"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
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
              if (label?.trim()) {
                setSimulatedFiles((prev) => [label.trim(), ...prev]);
              }
            }}
          >
            <Upload size={23} />
            <strong>Add document label</strong>
            <small>Prototype demonstration · No binary file uploaded</small>
          </button>
        </div>
      </section>
    </div>
  );
}

function ReferralsPage() {
  const [status, setStatus] = useState("All");
  const [referrals, setReferrals] = useState([
    { name: "Women's health consultation", detail: "Discuss reproductive health with a qualified gynaecologist.", status: "Suggested" },
    { name: "Fertility specialist", detail: "For IVF treatment protocols, egg retrieval, and embryo monitoring.", status: "Suggested" },
    { name: "Maternal mental wellbeing", detail: "Empathetic emotional support for fertility and pregnancy stress.", status: "Available" },
    { name: "Pelvic health physiotherapist", detail: "Prenatal and postpartum pelvic floor strengthening and recovery.", status: "Available" },
  ]);

  const shown = referrals.filter((r) => status === "All" || r.status === status);

  return (
    <section className="surface">
      <SectionHeader
        title="Care referrals"
        subtitle="Keep track of specialist consultations and recommended follow-up conversations."
      />
      <div className="referral-notice">
        <ShieldCheck size={18} />
        <span>
          Suggestions are informational guides only. A licensed healthcare professional must determine appropriate clinical referrals.
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
        {shown.map((r) => (
          <div className="referral-card" key={r.name}>
            <div className="referral-symbol"><Stethoscope size={20} /></div>
            <div className="referral-copy">
              <strong>{r.name}</strong>
              <p>{r.detail}</p>
              <span className={`referral-status ${r.status === "Available" ? "status-green" : ""}`}>
                {r.status}
              </span>
            </div>
            <button
              className="soft-btn"
              onClick={() =>
                setReferrals((prev) =>
                  prev.map((x) => (x.name === r.name ? { ...x, status: "Requested" } : x))
                )
              }
              disabled={r.status === "Requested"}
            >
              {r.status === "Requested" ? "Requested" : "Mark for follow-up"} <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChatPage({ messages, input, setInput, send, busy, error }) {
  const suggestions = [
    "What questions should I ask during an IVF consultation?",
    "How can I manage mild morning sickness and nausea?",
    "I'm feeling anxious about treatment results",
    "What should I prepare for my next clinician visit?",
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
                {m.text}
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
            placeholder="Ask a question or share what's on your mind..."
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
          <ShieldCheck size={14} /> This assistant is a prototype care coordinator. It does not diagnose, prescribe, or monitor emergencies.
        </p>
      </section>

      <aside className="surface chat-suggestions">
        <SectionHeader title="Things we can explore" />
        {suggestions.map((x, i) => (
          <button
            key={x}
            type="button"
            className="suggestion-row"
            onClick={() => setInput(x)}
          >
            <span>
              {[<ClipboardList size={17} />, <Smile size={17} />, <Heart size={17} />, <CalendarDays size={17} />][i]}
            </span>
            {x}
            <ChevronRight size={15} />
          </button>
        ))}

        <div className="chat-warning">
          <AlertTriangle size={18} />
          <p>
            <strong>EMERGENCY NOTICE:</strong> If you experience heavy bleeding, severe abdominal pain, chest pain, or fluid leakage, contact emergency services or your maternal emergency unit immediately. Do not wait for an app response.
          </p>
        </div>
      </aside>
    </div>
  );
}

function CareTeamPage() {
  const [sent, setSent] = useState("");
  const team = [
    ["Care coordinator", "Helps you organise questions, records, and clinician appointments", "CC", "#EEDFF8"],
    ["Obstetrician / Gynaecologist", "Maternal monitoring, reproductive health, and delivery care", "OB", "#F9DDE7"],
    ["Fertility specialist", "IVF treatment protocols, egg retrieval, and embryo monitoring", "FS", "#FCE7D9"],
    ["Wellbeing counsellor", "Emotional and mental health support through all maternal stages", "WB", "#DDEFE7"],
  ];

  return (
    <section className="surface">
      <SectionHeader
        title="Your care team"
        subtitle="Use these roles as a guide when deciding which clinician or specialist to contact."
      />
      <div className="team-grid">
        {team.map(([name, desc, initial, bg]) => (
          <div className="team-card" key={name}>
            <div className="team-avatar" style={{ background: bg }}>{initial}</div>
            <h3>{name}</h3>
            <p>{desc}</p>
            <button className="soft-btn" onClick={() => setSent(name)}>
              Prepare questions for {name} <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {sent && (
        <div className="success-panel margin-top">
          <MessageCircle size={20} />
          <div>
            <strong>Question prep initiated: {sent}</strong>
            <p>
              You can write down questions in your Health Records tab before contacting your actual care provider.
            </p>
          </div>
          <button className="icon-btn" onClick={() => setSent("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

function SettingsPage({ profile, user, onSave, onReset, onLogout, saved, setSaved }) {
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

        <section className="surface">
          <SectionHeader
            title="Reset care journey"
            subtitle="Re-run the onboarding questions without deleting your account."
          />
          <div className="referral-notice">
            <CircleHelp size={17} />
            <span>
              This clears your current journey stage selection so you can re-experience the onboarding questions.
            </span>
          </div>
          <button
            type="button"
            className="soft-btn full margin-top"
            onClick={onReset}
          >
            Reset journey stage
          </button>
        </section>
      </div>
    </div>
  );
}

export default App;
