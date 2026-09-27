import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc 
} from 'firebase/firestore';
import { 
  Layout, ListTodo, Wallet, HeartPulse, Target, Plus, Trash2, CheckCircle2, 
  Circle, CloudRain, Sun, Play, Pause, RotateCcw, X, Droplets, Moon, Utensils, 
  Sparkles, Send, Loader2, ArrowRight, MapPin, Quote, BookA, BrainCircuit, 
  Headphones, ChevronRight, GraduationCap, Clock, MessageCircle, Maximize, Minimize, Trophy
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip
} from 'recharts';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'lumina-v5-tracker';

const DOG_AVATAR = "https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=200&h=200";
const DOG_THINKING = "https://images.unsplash.com/photo-1537151608804-ea2f1faac39a?auto=format&fit=crop&q=80&w=200&h=200"; 

const getTodayStr = () => {
  const d = new Date();
  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
};

const INSPIRATIONS = [
  { verse: "I can do all things through Christ who strengthens me. - Philippians 4:13", vocab: { word: "Perspicacious", def: "Having a ready insight into and understanding of things." } },
  { verse: "For God gave us a spirit not of fear but of power and love and self-control. - 2 Tim 1:7", vocab: { word: "Tenacity", def: "The quality or fact of being very determined." } },
  { verse: "Commit your work to the Lord, and your plans will be established. - Proverbs 16:3", vocab: { word: "Diligence", def: "Careful and persistent work or effort." } },
  { verse: "Let all that you do be done in love. - 1 Corinthians 16:14", vocab: { word: "Resilience", def: "The capacity to recover quickly from difficulties; toughness." } }
];

const getDailyInspiration = () => {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return INSPIRATIONS[dayOfYear % INSPIRATIONS.length];
};

const getRank = (level) => {
  if (level < 5) return { title: "Novice", color: "text-slate-500", bg: "bg-slate-100" };
  if (level < 10) return { title: "Scholar", color: "text-blue-600", bg: "bg-blue-100" };
  if (level < 20) return { title: "Master", color: "text-violet-600", bg: "bg-violet-100" };
  return { title: "Luminary", color: "text-amber-500", bg: "bg-amber-100" };
};

const LofiPlayerSidebar = memo(() => (
  <div className="hidden lg:flex w-full flex-col bg-white/80 rounded-3xl p-4 mt-4 shadow-sm border border-slate-100/50">
     <div className="flex items-center gap-2 mb-3 text-indigo-600">
       <Headphones size={16}/>
       <span className="text-xs font-bold uppercase tracking-widest">Lofi Beats</span>
     </div>
     <div className="w-full h-24 rounded-2xl overflow-hidden bg-slate-900 shadow-inner">
       <iframe width="100%" height="100%" src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0&controls=0&modestbranding=1" title="Lofi" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
     </div>
  </div>
));

const LofiPlayerZen = memo(() => (
  <div className="w-full max-w-md bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
     <div className="flex items-center gap-3 mb-4 text-slate-300">
       <Headphones size={20}/>
       <span className="text-sm font-bold uppercase tracking-widest">Focus Frequencies</span>
     </div>
     <div className="w-full h-32 rounded-2xl overflow-hidden bg-black/50">
       <iframe width="100%" height="100%" src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&controls=0&modestbranding=1" title="Lofi Zen" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
     </div>
  </div>
));

const LuminaLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
    <path d="M20 0L24.4903 15.5097L40 20L24.4903 24.4903L20 40L15.5097 24.4903L0 20L15.5097 15.5097L20 0Z" fill="url(#paint0_linear)"/>
    <circle cx="20" cy="20" r="6" fill="white"/>
    <defs>
      <linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1" />
        <stop offset="1" stopColor="#A855F7" />
      </linearGradient>
    </defs>
  </svg>
);

const Card = ({ children, className = '', noPad = false }) => (
  <div className={`bg-white/70 backdrop-blur-3xl border border-white/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 relative z-10 ${noPad ? '' : 'p-6 lg:p-8'} ${className}`}>
    {children}
  </div>
);

const Input = ({ label, type = "text", value, onChange, placeholder, required = false, min, as = "input" }) => (
  <div className="flex flex-col gap-2 w-full relative z-20">
    {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">{label} {required && <span className="text-rose-500">*</span>}</label>}
    {as === "textarea" ? (
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={4}
        className="bg-white/90 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all text-sm w-full resize-none shadow-sm relative z-20"
      />
    ) : (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min}
        className="bg-white/90 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all text-sm w-full shadow-sm relative z-20"
      />
    )}
  </div>
);

const Button = ({ children, onClick, disabled, variant = 'primary', className = '', icon: Icon }) => {
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none active:scale-[0.98] relative z-20 ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayStr, setTodayStr] = useState(getTodayStr());
  
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(null);

  const [finance, setFinance] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [dailyLogs, setDailyLogs] = useState({ toothbrushAM: false, toothbrushPM: false, meals: [], mood: null, water: 0, sleep: 0 });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('task'); 
  const [isZenMode, setIsZenMode] = useState(false);
  const dailyInspo = useMemo(getDailyInspiration, [todayStr]);
  const [showXpToast, setShowXpToast] = useState(0);
  
  const [onboardForm, setOnboardForm] = useState({ name: '', focus: '', location: 'Calamba, Laguna' });
  const [taskForm, setTaskForm] = useState({ title: '', deadline: '', priority: 'Medium' });
  const [finForm, setFinForm] = useState({ type: 'expense', amount: '', desc: '' });
  const [mealForm, setMealForm] = useState({ desc: '' });
  const [milestoneForm, setMilestoneForm] = useState({ title: '', targetDate: '' });
  const [subjectForm, setSubjectForm] = useState({ name: '', schedule: '', grade: '' });

  const [timerTime, setTimerTime] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState('focus');
  const [studyNotes, setStudyNotes] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [generationType, setGenerationType] = useState('flashcards');

  const [chatOpen, setChatOpen] = useState(false);
  const [aiChat, setAiChat] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) { console.error("Auth Error:", error); }
    };
    initAuth();
    
    const interval = setInterval(() => { setTime(new Date()); setTodayStr(getTodayStr()); }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, `artifacts/${appId}/users`, currentUser.uid);
        
        onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const p = docSnap.data();
            setProfile(p);
            fetchWeather(p.location || 'Calamba, Laguna');
          } else {
            setProfile(null);
            setLoading(false);
          }
        });

        const basePath = `artifacts/${appId}/users/${currentUser.uid}`;
        const unsubFin = onSnapshot(collection(db, `${basePath}/finance`), (snap) => setFinance(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubTasks = onSnapshot(collection(db, `${basePath}/tasks`), (snap) => setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubMiles = onSnapshot(collection(db, `${basePath}/milestones`), (snap) => setMilestones(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        const unsubSubj = onSnapshot(collection(db, `${basePath}/subjects`), (snap) => setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
        
        const unsubDaily = onSnapshot(doc(db, `${basePath}/daily`, todayStr), (docSnap) => {
          if (docSnap.exists()) setDailyLogs(prev => ({ ...prev, ...docSnap.data() }));
          else setDailyLogs({ toothbrushAM: false, toothbrushPM: false, meals: [], mood: null, water: 0, sleep: 0 });
          setLoading(false);
        });

        return () => { unsubFin(); unsubTasks(); unsubMiles(); unsubSubj(); unsubDaily(); };
      }
    });
    return () => unsubscribe();
  }, [todayStr]);

  const fetchWeather = async (locQuery) => {
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locQuery)}&count=1`);
      const geoData = await geoRes.json();
      if (geoData.results && geoData.results.length > 0) {
        const { latitude, longitude, name } = geoData.results[0];
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherRes.json();
        setWeather({ ...weatherData.current_weather, name });
      }
    } catch (err) { console.error("Weather fetch failed", err); }
  };

  useEffect(() => {
    let interval = null;
    if (timerActive && timerTime > 0) {
      interval = setInterval(() => setTimerTime(prev => prev - 1), 1000);
    } else if (timerTime === 0 && timerActive) {
      setTimerActive(false);
      if (timerMode === 'focus') { 
        handleAddXp(50);
        setTimerMode('break'); setTimerTime(5 * 60); 
      }
      else { setTimerMode('focus'); setTimerTime(25 * 60); }
    }
    return () => clearInterval(interval);
  }, [timerActive, timerTime, timerMode]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddXp = async (amount) => {
    if (!user || !profile) return;
    const currentXp = profile.xp || 0;
    await setDoc(doc(db, `artifacts/${appId}/users`, user.uid), { xp: currentXp + amount }, { merge: true });
    
    setShowXpToast(amount);
    setTimeout(() => setShowXpToast(0), 2000);
  };

  const handleCompleteOnboarding = async () => {
    if (!onboardForm.name.trim() || !user) return;
    await setDoc(doc(db, `artifacts/${appId}/users`, user.uid), {
      name: onboardForm.name, focus: onboardForm.focus, location: onboardForm.location, createdAt: Date.now(), xp: 0
    });
  };

  const handleAddTask = async () => {
    if (!taskForm.title || !taskForm.deadline || !user) return;
    await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/tasks`), { ...taskForm, completed: false, createdAt: Date.now() });
    setTaskForm({ title: '', deadline: '', priority: 'Medium' }); setShowModal(false);
    handleAddXp(5);
  };

  const handleTaskToggle = async (t) => {
    if (!user) return;
    await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/tasks`, t.id), { completed: !t.completed });
    if (!t.completed) handleAddXp(20);
  };

  const handleAddMilestone = async () => {
    if (!milestoneForm.title || !user) return;
    await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/milestones`), { ...milestoneForm, progress: 0, createdAt: Date.now() });
    setMilestoneForm({ title: '', targetDate: '' }); setShowModal(false);
  };

  const handleAddFinance = async () => {
    if (!finForm.amount || !user) return;
    await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/finance`), { ...finForm, amount: parseFloat(finForm.amount), createdAt: Date.now() });
    setFinForm({ type: 'expense', amount: '', desc: '' }); setShowModal(false);
  };
  
  const handleAddSubject = async () => {
    if (!subjectForm.name || !user) return;
    await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/subjects`), { ...subjectForm, createdAt: Date.now() });
    setSubjectForm({ name: '', schedule: '', grade: '' }); setShowModal(false);
    handleAddXp(10);
  };

  const handleToggleDaily = async (field, value = null) => {
    if (!user) return;
    const newValue = value !== null ? value : !dailyLogs[field];
    await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/daily`, todayStr), { [field]: newValue }, { merge: true });
    
    if ((field === 'toothbrushAM' || field === 'toothbrushPM') && newValue === true) handleAddXp(10);
    if (field === 'water' && newValue > dailyLogs.water) handleAddXp(5);
  };

  const deleteDocItem = async (collectionName, id) => {
    if (!user) return;
    await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/${collectionName}`, id));
  };

  const handleGenerateStudyMaterial = async () => {
    if (!studyNotes.trim()) return;
    setIsGeneratingNotes(true);
    
    setTimeout(() => {
      if (generationType === 'flashcards') {
        setGeneratedContent({
          type: 'flashcards',
          data: [
            { q: "What is the core concept of the provided text?", a: "It discusses the fundamental principles of the topic you pasted." },
            { q: "Identify a key term from your notes.", a: "Always ensure you are actively recalling information rather than passively reading." },
            { q: "How can you apply this knowledge?", a: "By testing yourself using these generated flashcards regularly." }
          ]
        });
      } else {
        setGeneratedContent({
          type: 'quiz',
          data: [
            { q: "Which of the following best describes the main idea?", options: ["Option A", "Option B", "Option C", "Option D"], answer: 1 },
            { q: "What is a critical application of this study material?", options: ["Memorization", "Active Recall", "Passive Reading", "Ignoring it"], answer: 1 }
          ]
        });
      }
      setIsGeneratingNotes(false);
      setStudyNotes('');
      handleAddXp(20);
    }, 2500);
  };

  const handleAskAndrei = async () => {
    if (!userInput.trim() || !user || aiLoading) return;
    const query = userInput;
    setUserInput(""); setAiLoading(true);
    setAiChat(prev => [...prev, { role: 'user', text: query }]);

    const userLvl = Math.floor((profile?.xp || 0) / 100) + 1;
    const rankTitle = getRank(userLvl).title;

    const context = `You are Coach Andrei, a friendly, hyper-intelligent life coach represented by a smiling dog. 
    User Name: ${profile?.name}. Location: ${weather?.name || profile?.location}. Rank: ${rankTitle} (Lvl ${userLvl}).
    Current Stats: ${tasks.filter(t=>!t.completed).length} pending tasks, ${dailyLogs.water} glasses of water.
    Respond in short, friendly, punchy sentences. Be encouraging but firm. If they leveled up recently, congratulate them!`;

    try {
      const apiKey = ""; 
      let text = "Woof! That sounds like a solid plan. Keep pushing, I see you have some pending tasks to crush today! Make sure you stay hydrated.";
      
      if (apiKey) {
         const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: query }] }], systemInstruction: { parts: [{ text: context }] } })
         });
         const data = await res.json();
         text = data.candidates?.[0]?.content?.parts?.[0]?.text || text;
      } else {
         await new Promise(r => setTimeout(r, 1500)); 
      }
      setAiChat(prev => [...prev, { role: 'andrei', text }]);
    } catch (err) {
      setAiChat(prev => [...prev, { role: 'andrei', text: "Woof! My connection dropped. Give me a second and try again!" }]);
    }
    setAiLoading(false);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiChat, aiLoading, chatOpen]);

  const stats = useMemo(() => {
    let income = 0, expenses = 0;
    finance.forEach(f => f.type === 'income' ? income += f.amount : expenses += f.amount);
    const chartData = finance.slice(-15).map((f, i) => ({ name: `T${i}`, value: f.amount * (f.type === 'expense' ? -1 : 1) }));
    if(chartData.length === 0) chartData.push({name: 'Start', value: 0});
    return { balance: income - expenses, income, expenses, chartData };
  }, [finance]);

  const userXp = profile?.xp || 0;
  const currentLevel = Math.floor(userXp / 100) + 1;
  const xpProgress = userXp % 100;
  const rank = getRank(currentLevel);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <LuminaLogo />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs mt-6 animate-pulse">Igniting Lumina...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-300/20 blur-[120px] animate-blob pointer-events-none"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-fuchsia-300/20 blur-[120px] animate-blob animation-delay-2000 pointer-events-none"></div>
        </div>

        <Card className="w-full max-w-md z-10 shadow-2xl p-10">
          <div className="mx-auto mb-8 flex justify-center transform hover:scale-110 transition-transform">
             <LuminaLogo />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-center text-slate-900 mb-2">Welcome to Lumina</h1>
          <p className="text-slate-500 text-sm text-center mb-10 font-medium">Your personal command center for academics and life.</p>
          
          <div className="space-y-5 text-left">
            <Input label="What is your name?" required value={onboardForm.name} onChange={e => setOnboardForm({...onboardForm, name: e.target.value})} placeholder="e.g. John" />
            <Input label="Where are you located?" required value={onboardForm.location} onChange={e => setOnboardForm({...onboardForm, location: e.target.value})} placeholder="e.g. Calamba, Laguna" />
            <Input label="What is your main goal right now?" value={onboardForm.focus} onChange={e => setOnboardForm({...onboardForm, focus: e.target.value})} placeholder="e.g. Graduating, Saving Money" />
            
            <Button onClick={handleCompleteOnboarding} disabled={!onboardForm.name.trim() || !onboardForm.location.trim()} className="w-full mt-4 py-4 text-base rounded-2xl">
              Enter Dashboard <ArrowRight size={18}/>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isZenMode) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-white animate-in fade-in duration-700">
         <button onClick={() => setIsZenMode(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white flex items-center gap-2 font-bold uppercase tracking-widest text-xs transition-colors cursor-pointer z-50">
           <Minimize size={16}/> Exit Zen Mode
         </button>
         
         <div className="flex flex-col items-center max-w-2xl w-full px-6 relative z-10">
            <div className="text-[12rem] font-black tracking-tighter mb-12 font-mono tabular-nums bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 leading-none">
              {formatTime(timerTime)}
            </div>
            
            <div className="flex items-center justify-center gap-6 mb-20 w-full max-w-md">
              <button onClick={() => setTimerActive(!timerActive)} className={`flex-1 py-5 font-black rounded-3xl hover:scale-105 transition-all text-lg flex justify-center items-center gap-3 cursor-pointer ${timerActive ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.3)]'}`}>
                {timerActive ? <Pause size={24} /> : <Play size={24} fill="currentColor" />} {timerActive ? 'Pause' : 'Deep Focus'}
              </button>
              <button onClick={() => { setTimerActive(false); setTimerTime(timerMode === 'focus' ? 25*60 : 5*60); }} className="p-5 bg-white/5 text-slate-400 rounded-3xl hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                <RotateCcw size={24} />
              </button>
            </div>

            <LofiPlayerZen />
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F9] text-slate-900 font-sans flex antialiased selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[50%] rounded-full bg-violet-200/40 blur-[120px] pointer-events-none"></div>
      </div>

      {showXpToast > 0 && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
          <div className="bg-emerald-500 text-white px-6 py-2 rounded-full font-black text-lg shadow-xl shadow-emerald-500/30 flex items-center gap-2">
            <Sparkles size={20}/> +{showXpToast} XP
          </div>
        </div>
      )}

      {}
      <aside className="w-20 lg:w-[260px] bg-white/60 backdrop-blur-3xl border-r border-white/60 flex flex-col items-center lg:items-start p-4 lg:p-6 shrink-0 h-screen sticky top-0 z-20 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4 mb-12 lg:px-2 w-full mt-2">
          <LuminaLogo />
          <h1 className="font-black text-2xl tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-slate-700">Lumina</h1>
        </div>
        
        <nav className="flex-1 w-full space-y-2 relative z-20">
          {[
            { id: 'dashboard', icon: Layout, label: 'Dashboard' },
            { id: 'academics', icon: GraduationCap, label: 'Academics' },
            { id: 'study', icon: BrainCircuit, label: 'Study Hub' },
            { id: 'tasks', icon: ListTodo, label: 'Tasks' },
            { id: 'health', icon: HeartPulse, label: 'Wellness' },
            { id: 'money', icon: Wallet, label: 'Finances' },
            { id: 'goals', icon: Target, label: 'Milestones' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center justify-center lg:justify-start gap-4 p-3.5 lg:px-4 rounded-2xl transition-all duration-300 font-bold cursor-pointer relative z-20 ${activeTab === t.id ? 'bg-white shadow-md shadow-indigo-100/50 border border-slate-100/50 text-indigo-600 translate-x-1' : 'text-slate-500 hover:bg-white/40 hover:text-slate-900 hover:translate-x-1'}`}>
              <t.icon size={20} className={activeTab === t.id ? 'text-indigo-600' : 'text-slate-400'} />
              <span className="hidden lg:block text-sm">{t.label}</span>
            </button>
          ))}
        </nav>

        <LofiPlayerSidebar />

        <Button onClick={() => setShowModal(true)} icon={Plus} className="w-full h-14 lg:h-auto rounded-full lg:rounded-2xl shadow-xl shadow-indigo-200 mt-6 flex justify-center items-center cursor-pointer relative z-30">
          <span className="hidden lg:block">Quick Log</span>
        </Button>
      </aside>

      {}
      <main className="flex-1 h-screen overflow-y-auto px-4 lg:px-10 py-8 lg:py-10 z-10 custom-scrollbar relative">
        
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-10 gap-6 relative z-20">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
               <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${rank.bg} ${rank.color} border border-white/50 shadow-sm`}>
                 <Trophy size={14}/> Level {currentLevel} • {rank.title}
               </div>
               <div className="w-32 lg:w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-500" style={{width: `${xpProgress}%`}}></div>
               </div>
               <span className="text-xs font-bold text-slate-400">{xpProgress}/100 XP</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-2">
              Good {time.getHours() < 12 ? 'morning' : time.getHours() < 18 ? 'afternoon' : 'evening'}, {profile.name}.
            </h2>
            <div className="text-base font-bold text-slate-500 flex items-center gap-2">
              <MapPin size={16} className="text-indigo-500" /> <span>{weather?.name || profile.location} • {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          
          {weather && (
            <Card className="flex items-center gap-5 py-4 px-6 animate-in fade-in slide-in-from-right-4 duration-500" noPad>
               <div className="text-right">
                 <div className="text-sm font-black text-slate-900">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                 <div className="text-xs font-bold text-slate-400 capitalize">{weather.weathercode > 50 ? 'Rainy' : 'Clear Sky'}</div>
               </div>
               <div className="h-10 w-[2px] bg-slate-100 rounded-full"></div>
               <div className="flex items-center gap-3">
                 {weather.weathercode > 50 ? <CloudRain size={28} className="text-blue-500" /> : <Sun size={28} className="text-amber-500" />}
                 <span className="text-3xl font-black text-slate-900 tracking-tighter">{weather.temperature}°</span>
               </div>
            </Card>
          )}
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-20">
            
            <Card className="col-span-1 xl:col-span-8 flex flex-col justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white border-none shadow-2xl shadow-indigo-500/20 relative overflow-hidden p-8 lg:p-10 group">
              <div className="absolute top-0 right-0 p-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-white/20 transition-colors duration-1000"></div>
              <div className="absolute bottom-0 left-0 p-32 bg-indigo-900/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
              
              <div className="z-10 w-full mb-8 relative">
                <div className="text-xs font-bold text-indigo-200 mb-4 flex items-center gap-2 uppercase tracking-widest"><Quote size={14}/> Daily Inspiration</div>
                <div className="text-2xl lg:text-3xl font-bold leading-tight drop-shadow-md pr-8">"{dailyInspo.verse}"</div>
              </div>
              
              <div className="z-10 bg-white/10 rounded-3xl p-5 backdrop-blur-md border border-white/20 w-fit inline-flex flex-col gap-1 shadow-lg relative">
                <div className="text-[10px] font-bold text-indigo-200 flex items-center gap-1.5 uppercase tracking-widest mb-1"><BookA size={12}/> Word of the Day</div>
                <div className="flex flex-col lg:flex-row lg:items-baseline gap-2">
                   <span className="text-xl font-black tracking-tight">{dailyInspo.vocab.word}</span>
                   <span className="text-sm font-medium text-indigo-100">{dailyInspo.vocab.def}</span>
                </div>
              </div>
            </Card>

            <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
              <Card className="flex-1 flex flex-col justify-center relative overflow-hidden group hover:shadow-xl transition-shadow cursor-default">
                <div className="flex items-center gap-2 text-slate-500 mb-3 z-10 relative">
                  <Wallet size={18} className="text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">Total Finances</span>
                </div>
                <span className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 z-10 relative">₱{stats.balance.toLocaleString()}</span>
                <div className="absolute -bottom-8 -right-8 text-emerald-50 opacity-40 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none"><Wallet size={140}/></div>
              </Card>
              
              <Card className="flex-1 flex flex-col justify-center relative overflow-hidden group hover:shadow-xl transition-shadow cursor-default">
                 <div className="flex items-center gap-2 text-slate-500 mb-3 z-10 relative">
                   <ListTodo size={18} className="text-rose-500" />
                   <span className="text-xs font-bold uppercase tracking-widest">Pending Tasks</span>
                 </div>
                 <div className="flex items-end gap-3 z-10 relative">
                   <span className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900">{tasks.filter(t=>!t.completed).length}</span>
                   <span className="text-sm font-bold text-rose-500 mb-1">Items need focus</span>
                 </div>
                 <div className="absolute -bottom-8 -right-8 text-rose-50 opacity-40 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 pointer-events-none"><ListTodo size={140}/></div>
              </Card>
            </div>

            <Card className="col-span-1 xl:col-span-12">
               <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2"><HeartPulse size={16}/> Daily Wellness Protocol</div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <button onClick={() => handleToggleDaily('toothbrushAM')} className={`p-5 rounded-3xl border transition-all flex flex-col justify-center items-center gap-3 cursor-pointer relative z-20 ${dailyLogs.toothbrushAM ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-inner' : 'bg-white border-slate-100 text-slate-500 hover:shadow-md hover:border-slate-200'}`}>
                   <CheckCircle2 size={32} className={dailyLogs.toothbrushAM ? 'text-emerald-500' : 'text-slate-300'} />
                   <span className="text-sm font-bold tracking-wide">AM Brush</span>
                 </button>
                 <button onClick={() => handleToggleDaily('toothbrushPM')} className={`p-5 rounded-3xl border transition-all flex flex-col justify-center items-center gap-3 cursor-pointer relative z-20 ${dailyLogs.toothbrushPM ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-inner' : 'bg-white border-slate-100 text-slate-500 hover:shadow-md hover:border-slate-200'}`}>
                   <CheckCircle2 size={32} className={dailyLogs.toothbrushPM ? 'text-emerald-500' : 'text-slate-300'} />
                   <span className="text-sm font-bold tracking-wide">PM Brush</span>
                 </button>
                 <div className="col-span-2 p-5 rounded-3xl bg-blue-50/80 border border-blue-100 flex items-center justify-between shadow-sm relative z-20">
                   <div className="flex items-center gap-4 text-blue-700">
                     <div className="p-4 bg-blue-100 rounded-2xl"><Droplets size={28} className="text-blue-600" /></div>
                     <div>
                       <div className="text-base font-black block">Hydration</div>
                       <div className="text-xs font-bold uppercase tracking-wider text-blue-500">Glasses today</div>
                     </div>
                   </div>
                   <div className="flex items-center gap-4 bg-white p-2 pl-6 rounded-2xl shadow-sm border border-blue-50">
                     <span className="text-3xl font-black text-blue-900 tracking-tighter">{dailyLogs.water}</span>
                     <button onClick={() => handleToggleDaily('water', dailyLogs.water + 1)} className="bg-blue-600 p-3 rounded-xl shadow-md text-white hover:bg-blue-700 hover:scale-105 transition-all cursor-pointer"><Plus size={20}/></button>
                   </div>
                 </div>
               </div>
            </Card>
          </div>
        )}

        {activeTab === 'academics' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-20">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3"><GraduationCap className="text-indigo-500"/> Academic Hub</h2>
                <div className="relative z-30">
                  <Button onClick={() => {setModalType('subject'); setShowModal(true);}} icon={Plus} variant="secondary" className="rounded-full cursor-pointer">Add Subject</Button>
                </div>
             </div>
             
             <Card className="min-h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {subjects.length === 0 && <p className="text-slate-400 font-medium col-span-full text-center py-12">No subjects tracked. Add your current classes!</p>}
                  {subjects.map(sub => (
                    <div key={sub.id} className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative group cursor-default">
                       <button onClick={() => deleteDocItem('subjects', sub.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-50 rounded-full cursor-pointer"><Trash2 size={16}/></button>
                       <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
                          <BookA size={24}/>
                       </div>
                       <h3 className="font-black text-xl text-slate-900 mb-2 truncate pr-8">{sub.name}</h3>
                       <div className="flex items-center gap-2 text-sm font-bold text-slate-500 mb-4">
                         <Clock size={14}/> {sub.schedule || 'TBA'}
                       </div>
                       <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                         <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Grade</span>
                         <span className="text-2xl font-black text-indigo-600">{sub.grade || 'N/A'}</span>
                       </div>
                    </div>
                  ))}
                </div>
             </Card>
           </div>
        )}

        {activeTab === 'study' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-20">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3"><BrainCircuit className="text-indigo-500"/> Study & Focus</h2>
                <div className="relative z-30">
                   <Button onClick={() => setIsZenMode(true)} icon={Maximize} variant="primary" className="rounded-full shadow-indigo-500/40 cursor-pointer">Enter Zen Mode</Button>
                </div>
             </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <Card className="col-span-1 xl:col-span-5 flex flex-col items-center justify-center text-center py-12 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
                   <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: timerActive ? '100%' : '0%' }}></div>
                 </div>
                 
                 <div className="flex bg-slate-100 p-1.5 rounded-full mb-8 z-10 w-full max-w-[240px] relative">
                    <button onClick={() => {setTimerMode('focus'); setTimerTime(25*60); setTimerActive(false);}} className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${timerMode === 'focus' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Deep Focus</button>
                    <button onClick={() => {setTimerMode('break'); setTimerTime(5*60); setTimerActive(false);}} className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${timerMode === 'break' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Rest Break</button>
                 </div>
                 
                 <div className="text-7xl lg:text-[6rem] font-black tracking-tighter mb-10 font-mono tabular-nums text-slate-900 z-10 leading-none">
                   {formatTime(timerTime)}
                 </div>
                 
                 <div className="flex items-center justify-center gap-4 z-10 w-full px-6 relative">
                   <button onClick={() => setTimerActive(!timerActive)} className={`flex-1 py-4 font-black rounded-2xl hover:scale-105 transition-all shadow-lg flex justify-center items-center gap-2 cursor-pointer ${timerActive ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-slate-900 text-white'}`}>
                     {timerActive ? <Pause size={20} /> : <Play size={20} fill="currentColor" />} {timerActive ? 'Pause' : 'Start Session'}
                   </button>
                   <button onClick={() => { setTimerActive(false); setTimerTime(timerMode === 'focus' ? 25*60 : 5*60); }} className="p-4 bg-white text-slate-500 border border-slate-200 rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm cursor-pointer">
                     <RotateCcw size={20} />
                   </button>
                 </div>
              </Card>

              <Card className="col-span-1 xl:col-span-7 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><BrainCircuit size={20}/></div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Scholar AI</h3>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Material Generator</div>
                    </div>
                  </div>
                  {generatedContent && (
                    <button onClick={() => setGeneratedContent(null)} className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full cursor-pointer"><RotateCcw size={14}/> Reset</button>
                  )}
                </div>
                
                {!generatedContent ? (
                  <div className="flex-1 flex flex-col gap-4 relative z-10">
                    <div className="text-sm font-medium text-slate-500">Paste your lecture notes, textbook excerpts, or PDF text here. The AI will instantly build study materials.</div>
                    <Input as="textarea" value={studyNotes} onChange={e=>setStudyNotes(e.target.value)} placeholder="Paste your study materials here..." className="flex-1" />
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                       <Button onClick={() => {setGenerationType('flashcards'); handleGenerateStudyMaterial();}} disabled={!studyNotes.trim() || isGeneratingNotes} variant="secondary" className="border-indigo-100 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer">
                         {isGeneratingNotes && generationType === 'flashcards' ? <Loader2 className="animate-spin" size={18}/> : <BookA size={18}/>} Generate Flashcards
                       </Button>
                       <Button onClick={() => {setGenerationType('quiz'); handleGenerateStudyMaterial();}} disabled={!studyNotes.trim() || isGeneratingNotes} variant="primary" className="cursor-pointer">
                         {isGeneratingNotes && generationType === 'quiz' ? <Loader2 className="animate-spin" size={18}/> : <Target size={18}/>} Generate Mock Quiz
                       </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col relative z-10">
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                      {generatedContent.type === 'flashcards' ? (
                        generatedContent.data.map((card, i) => (
                          <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:border-indigo-200">
                            <button onClick={() => setActiveCard(activeCard === i ? null : i)} className="w-full p-5 flex justify-between items-center text-left hover:bg-slate-50 transition-colors cursor-pointer">
                              <span className="font-bold text-slate-800 pr-4">{card.q}</span>
                              <ChevronRight size={20} className={`text-slate-400 transition-transform duration-300 ${activeCard === i ? 'rotate-90 text-indigo-500' : ''}`}/>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${activeCard === i ? 'max-h-96' : 'max-h-0'}`}>
                              <div className="p-5 bg-indigo-50 border-t border-indigo-100 text-sm font-medium text-indigo-900 leading-relaxed">
                                {card.a}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        generatedContent.data.map((q, i) => (
                          <div key={i} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
                             <div className="font-black text-slate-800 mb-4">{i+1}. {q.q}</div>
                             <div className="space-y-2">
                               {q.options.map((opt, idx) => (
                                 <button key={idx} className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-sm font-medium text-slate-700 transition-colors flex items-center gap-3 cursor-pointer">
                                    <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold">{String.fromCharCode(65 + idx)}</div>
                                    {opt}
                                 </button>
                               ))}
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab !== 'dashboard' && activeTab !== 'study' && activeTab !== 'academics' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-20">
             <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black tracking-tight capitalize text-slate-900">{activeTab}</h2>
             </div>
             
             <Card className="min-h-[500px]">
               {activeTab === 'tasks' && (
                 <div className="space-y-3">
                   {tasks.length === 0 && <p className="text-slate-400 text-center py-12 font-medium">Your task list is clear. Add a new task to begin.</p>}
                   {tasks.map(t => (
                     <div key={t.id} className={`flex items-center justify-between p-4 lg:p-5 rounded-2xl border transition-all ${t.completed ? 'bg-slate-50/50 border-transparent opacity-60' : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'}`}>
                       <div className="flex items-center gap-4">
                         <button onClick={() => handleTaskToggle(t)} className="transform hover:scale-110 transition-transform p-1 cursor-pointer">
                           {t.completed ? <CheckCircle2 size={28} className="text-emerald-500"/> : <Circle size={28} className="text-slate-300 hover:text-indigo-400"/>}
                         </button>
                         <div>
                           <div className={`font-bold text-lg block ${t.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>{t.title}</div>
                           <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 mt-1 ${t.completed ? 'text-slate-400' : 'text-rose-500'}`}>Deadline: {new Date(t.deadline).toLocaleDateString()}</div>
                         </div>
                       </div>
                       <button onClick={() => deleteDocItem('tasks', t.id)} className="text-slate-300 hover:text-rose-500 p-3 bg-slate-50 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"><Trash2 size={18}/></button>
                     </div>
                   ))}
                 </div>
               )}

               {activeTab === 'health' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
                   <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-center">
                     <div className="p-5 bg-indigo-100 rounded-3xl"><Moon className="text-indigo-600" size={40}/></div>
                     <div>
                       <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest block mb-2">Sleep Tracker</span>
                       <span className="font-black text-5xl text-indigo-950 tracking-tighter">{dailyLogs.sleep} <span className="text-2xl text-indigo-400">hrs</span></span>
                     </div>
                     <input type="range" min="0" max="12" step="0.5" value={dailyLogs.sleep} onChange={(e) => handleToggleDaily('sleep', parseFloat(e.target.value))} className="w-full max-w-[240px] accent-indigo-600 mt-4 cursor-pointer relative z-30"/>
                   </div>
                   <div className="p-8 bg-orange-50/50 border border-orange-100 rounded-[2rem] flex flex-col h-[300px]">
                     <div className="flex justify-between items-center mb-6 text-orange-800">
                        <div className="flex items-center gap-3"><div className="p-2 bg-orange-200 rounded-xl"><Utensils size={20} className="text-orange-700"/></div><div className="font-bold uppercase tracking-widest text-sm">Meals Logged</div></div>
                     </div>
                     <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 relative z-30">
                       {(!dailyLogs.meals || dailyLogs.meals.length === 0) && <p className="text-sm text-orange-400 font-medium text-center mt-10">No meals logged today.</p>}
                       {dailyLogs.meals?.map((m,i) => (
                         <div key={i} className="text-sm bg-white p-4 rounded-2xl border border-orange-100 font-bold text-slate-700 shadow-sm flex items-center gap-3">
                           <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div> {m.desc}
                         </div>
                       ))}
                     </div>
                   </div>
                 </div>
               )}

               {activeTab === 'money' && (
                 <div className="h-[450px] w-full flex flex-col relative z-20">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                     <div>
                       <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Net Capital</div>
                       <div className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">₱{stats.balance.toLocaleString()}</div>
                     </div>
                     <div className="flex gap-4 md:text-right">
                       <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl">
                         <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Income</div>
                         <div className="text-lg font-black text-emerald-700">₱{stats.income.toLocaleString()}</div>
                       </div>
                       <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-2xl">
                         <div className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Expenses</div>
                         <div className="text-lg font-black text-rose-700">₱{stats.expenses.toLocaleString()}</div>
                       </div>
                     </div>
                   </div>
                   <div className="flex-1 bg-slate-50/50 rounded-[2rem] border border-slate-100 p-6 pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}/>
                        <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                   </div>
                 </div>
               )}

               {activeTab === 'goals' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-20">
                   {milestones.length === 0 && <p className="text-slate-400 font-medium col-span-full text-center py-12">No big goals set yet. Define your future!</p>}
                   {milestones.map(m => (
                     <div key={m.id} className="p-6 lg:p-8 border border-slate-200 bg-white rounded-[2rem] group relative shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                       <button onClick={() => deleteDocItem('milestones', m.id)} className="absolute top-5 right-5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-50 rounded-full cursor-pointer"><X size={16}/></button>
                       <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600"><Target size={24}/></div>
                       <h4 className="font-black text-2xl mb-2 text-slate-900 pr-6 leading-tight">{m.title}</h4>
                       <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Target: {new Date(m.targetDate).toLocaleDateString()}</div>
                       
                       <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-4"><div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-1000 relative" style={{width: `${m.progress}%`}}><div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div></div></div>
                       <div className="flex justify-between items-center text-sm font-black text-slate-600 mb-8"><span>Progress</span><span className="text-indigo-600">{m.progress}%</span></div>
                       
                       <div className="flex gap-3">
                         <button onClick={() => updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/milestones`, m.id), { progress: Math.max(0, m.progress - 10) })} className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">-10%</button>
                         <button onClick={() => {
                            updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/milestones`, m.id), { progress: Math.min(100, m.progress + 10) });
                            if (m.progress + 10 >= 100) handleAddXp(100);
                         }} className="flex-1 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer">+10%</button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </Card>
           </div>
        )}

      </main>

      {}
      <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end">
        <div className={`mb-4 w-80 sm:w-96 bg-white/95 backdrop-blur-3xl border border-white/80 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${chatOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10 pointer-events-none'}`}>
           <div className="p-5 bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-between shadow-md relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
             <div className="flex items-center gap-3 z-10">
               <img src={DOG_AVATAR} alt="Coach Andrei" className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-sm" />
               <div>
                 <h3 className="font-black text-white text-base leading-tight">Coach Andrei</h3>
                 <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Online</div>
               </div>
             </div>
             <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white z-10 bg-black/10 p-2 rounded-full cursor-pointer"><X size={16}/></button>
           </div>
           
           <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar flex flex-col">
             {aiChat.length === 0 && (
               <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 p-4">
                 <img src={DOG_AVATAR} alt="Andrei" className="w-16 h-16 rounded-full opacity-50 mb-3 grayscale mix-blend-multiply" />
                 <p className="text-xs font-bold text-slate-500">I'm tracking your progress. Ask me for advice or motivation anytime!</p>
               </div>
             )}
             
             {aiChat.map((msg, i) => (
               <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                 {msg.role === 'andrei' && <img src={DOG_AVATAR} className="w-6 h-6 rounded-full mr-2 mt-auto mb-1 border border-slate-200 shadow-sm" alt="Andrei"/>}
                 <div className={`max-w-[85%] text-sm font-medium leading-relaxed p-4 rounded-3xl shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm shadow-indigo-500/20' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                   {msg.text}
                 </div>
               </div>
             ))}
             
             {aiLoading && (
               <div className="flex justify-start animate-in fade-in duration-300">
                 <img src={DOG_THINKING} className="w-8 h-8 rounded-full mr-2 mt-auto mb-1 shadow-sm border-2 border-white object-cover" alt="Thinking"/>
                 <div className="bg-white border border-slate-200 text-slate-800 rounded-3xl rounded-bl-sm p-4 shadow-sm flex items-center gap-2">
                   <div className="flex space-x-1.5">
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                   </div>
                 </div>
               </div>
             )}
             <div ref={chatEndRef} />
           </div>

           <div className="p-3 bg-white border-t border-slate-100">
             <div className="relative flex items-center">
               <input 
                 type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAndrei()}
                 placeholder="Message Andrei..."
                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder-slate-400 relative z-20"
               />
               <button onClick={handleAskAndrei} disabled={!userInput.trim() || aiLoading} className="absolute right-1.5 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer z-30">
                 <Send size={14} className="ml-0.5" />
               </button>
             </div>
           </div>
        </div>

        <button onClick={() => setChatOpen(!chatOpen)} className="group relative w-16 h-16 rounded-full shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all duration-300 active:scale-95 border-4 border-white z-50 cursor-pointer">
           <img src={DOG_AVATAR} alt="Coach" className="w-full h-full rounded-full object-cover" />
           {!chatOpen && <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white animate-bounce pointer-events-none">1</div>}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border-white/80 bg-white/95 backdrop-blur-xl relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black tracking-tight text-slate-900">Add New Entry</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"><X size={18}/></button>
            </div>
            
            <div className="flex gap-2 p-1.5 rounded-2xl mb-6 bg-slate-100 overflow-x-auto custom-scrollbar relative z-20">
              {['task', 'finance', 'meal', 'subject', 'milestone'].map(type => (
                <button key={type} onClick={() => setModalType(type)} className={`flex-1 min-w-[80px] py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer ${modalType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {type === 'finance' ? 'Money' : type === 'subject' ? 'Class' : type === 'milestone' ? 'Goal' : type}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {modalType === 'task' && (
                <>
                  <Input label="Task Title" required value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} placeholder="e.g. Finish math homework" />
                  <Input label="Deadline" type="date" required value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} min={todayStr} />
                  <Button onClick={handleAddTask} disabled={!taskForm.title || !taskForm.deadline} className="w-full mt-4 cursor-pointer">Save Task</Button>
                </>
              )}
              {modalType === 'finance' && (
                <>
                  <div className="flex gap-2 mb-2 relative z-20">
                     <button onClick={() => setFinForm({...finForm, type: 'expense'})} className={`flex-1 py-3 text-sm font-bold rounded-2xl border transition-all cursor-pointer ${finForm.type === 'expense' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>Expense</button>
                     <button onClick={() => setFinForm({...finForm, type: 'income'})} className={`flex-1 py-3 text-sm font-bold rounded-2xl border transition-all cursor-pointer ${finForm.type === 'income' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>Income</button>
                  </div>
                  <Input label="Amount (₱)" type="number" required value={finForm.amount} onChange={e => setFinForm({...finForm, amount: e.target.value})} placeholder="0" />
                  <Input label="Description" required value={finForm.desc} onChange={e => setFinForm({...finForm, desc: e.target.value})} placeholder="e.g. Lunch" />
                  <Button onClick={handleAddFinance} disabled={!finForm.amount} className="w-full mt-4 cursor-pointer">Save Money Record</Button>
                </>
              )}
              {modalType === 'meal' && (
                <>
                  <Input label="What did you eat?" required value={mealForm.desc} onChange={e => setMealForm({...mealForm, desc: e.target.value})} placeholder="e.g. Grilled Chicken & Rice" />
                  <Button onClick={async () => {
                    const newMeals = [...(dailyLogs.meals || []), { desc: mealForm.desc }];
                    await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/daily`, todayStr), { meals: newMeals }, { merge: true });
                    setMealForm({ desc: '' }); setShowModal(false); handleAddXp(5);
                  }} disabled={!mealForm.desc} className="w-full mt-4 cursor-pointer">Log Meal</Button>
                </>
              )}
              {modalType === 'subject' && (
                <>
                  <Input label="Course Name" required value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} placeholder="e.g. CS101 Data Structures" />
                  <Input label="Schedule" required value={subjectForm.schedule} onChange={e => setSubjectForm({...subjectForm, schedule: e.target.value})} placeholder="e.g. Mon/Wed 10:00 AM" />
                  <Input label="Current Grade (Optional)" value={subjectForm.grade} onChange={e => setSubjectForm({...subjectForm, grade: e.target.value})} placeholder="e.g. 95 or A" />
                  <Button onClick={handleAddSubject} disabled={!subjectForm.name || !subjectForm.schedule} className="w-full mt-4 cursor-pointer">Save Subject</Button>
                </>
              )}
              {modalType === 'milestone' && (
                <>
                  <Input label="Big Goal" required value={milestoneForm.title} onChange={e => setMilestoneForm({...milestoneForm, title: e.target.value})} placeholder="e.g. Graduate with Honors" />
                  <Input label="Target Date" type="date" required value={milestoneForm.targetDate} onChange={e => setMilestoneForm({...milestoneForm, targetDate: e.target.value})} min={todayStr} />
                  <Button onClick={handleAddMilestone} disabled={!milestoneForm.title} className="w-full mt-4 cursor-pointer">Save Milestone</Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .animate-in { animation-duration: 500ms; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); animation-fill-mode: forwards; }
        .fade-in { animation-name: fadeIn; }
        .slide-in-from-bottom-4 { animation-name: slideInBottom; }
        .slide-in-from-left-4 { animation-name: slideInLeft; }
        .slide-in-from-right-4 { animation-name: slideInRight; }
        .slide-in-from-bottom-2 { animation-name: slideInBottomSmall; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInBottom { from { transform: translateY(1.5rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideInLeft { from { transform: translateX(-1.5rem); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(1.5rem); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInBottomSmall { from { transform: translateX(0) translateY(0.5rem); opacity: 0; } to { transform: translateX(0) translateY(0); opacity: 1; } }
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite alternate; }
        .animation-delay-2000 { animation-delay: 2s; }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}