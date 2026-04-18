import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken, GoogleAuthProvider, signInWithRedirect, signInWithPopup, getRedirectResult, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Dumbbell, 
  Home, 
  Play, 
  TrendingUp, 
  Settings, 
  CheckCircle2, 
  Plus, 
  Trash2,
  Clock,
  MapPin,
  Flame,
  User,
  Activity,
  Sparkles,
  BrainCircuit,
  Lightbulb,
  Timer,
  Zap,
  Target,
  Lock,
  Unlock,
  Wand2,
  RefreshCw
} from 'lucide-react';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyD4Reis3cLu9cv0vY-X80xO0CszciErbiA",
  authDomain: "personal-99360.firebaseapp.com",
  projectId: "personal-99360",
  storageBucket: "personal-99360.firebasestorage.app",
  messagingSenderId: "86709470591",
  appId: "1:86709470591:web:5d54f14a55086bfe1e464a"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.appId;


// --- Data Constants ---
const MODALITIES = [
  { id: 'home', name: 'Em Casa', icon: Home, color: 'bg-blue-500' },
  { id: 'gym', name: 'Academia', icon: Dumbbell, color: 'bg-purple-500' },
  { id: 'run', name: 'Corrida', icon: Flame, color: 'bg-orange-500' },
  { id: 'footvolley', name: 'Futevôlei', icon: MapPin, color: 'bg-green-500' }
];

const WEEK_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];


const SUBSTITUTES = {
  'Pernas': ['Subida no Degrau (Step-up)', 'Agachamento Isométrico na Parede (45s)'],
  'Posterior': ['Ponte de Glúteo Unilateral', 'Flexão Nórdica Reversa'],
  'Costas': ['Remada Alta na Polia', 'Crucifixo Inverso com Halteres'],
  'Peito/Ombro': ['Crucifixo com Halteres', 'Elevação Lateral de Ombros'],
  'Core': ['Escalador (Mountain Climber)', 'Abdominal Infra (Elevação de pernas)']
};

const FUNNY_PHRASES = [
  "Bora suar essa camisa?",
  "Tá pago ou tá devendo?",
  "O sofá não constrói glúteos!",
  "Mais um dia, mais um treino!",
  "Sem dor, sem pizza!",
  "A dor é a fraqueza saindo do corpo!",
  "Levanta e vai, o shape não vem pelo correio!"
];

// --- 3-Month Progression Programs ---
const STRENGTH_WORKOUTS = [
  // A1: Base e Estabilidade
  [
    { name: 'Agachamento com Halteres', sets: 3, reps: '12' },
    { name: 'Afundo Alternado (Peso do corpo)', sets: 3, reps: '10 cada perna' },
    { name: 'Elevação Pélvica (Costas na Bola)', sets: 3, reps: '15' },
    { name: 'Puxada Frontal na Polia Alta', sets: 3, reps: '12' },
    { name: 'Prancha Isométrica na Bola', sets: 3, reps: '40 seg' }
  ],
  // B1: Força e Postura
  [
    { name: 'Supino com Halteres (Deitado na Bola)', sets: 3, reps: '12' },
    { name: 'Remada Curvada com Halteres', sets: 3, reps: '12' },
    { name: 'Desenvolvimento de Ombros em pé', sets: 3, reps: '10' },
    { name: 'Tríceps na Polia Alta', sets: 3, reps: '12' },
    { name: 'Rotação de Tronco na Polia Alta', sets: 3, reps: '12 cada lado' }
  ],
  // A2: Posterior e Unilateral
  [
    { name: 'Agachamento Sumô com Halter', sets: 3, reps: '12' },
    { name: 'Stiff com Halteres', sets: 3, reps: '12' },
    { name: 'Agachamento Búlgaro', sets: 3, reps: '8 cada perna' },
    { name: 'Face Pull na Polia Alta', sets: 3, reps: '15' },
    { name: 'Perdigueiro Dinâmico', sets: 3, reps: '12 cada lado' }
  ],
  // B2: Potência e Funcional
  [
    { name: 'Flexão de Braço (Solo)', sets: 3, reps: 'Máx (até falha)' },
    { name: 'Remada Unilateral / Serrote', sets: 3, reps: '12 cada braço' },
    { name: 'Thruster (Agachamento + Desenv.)', sets: 3, reps: '10' },
    { name: 'Tríceps Francês com Halter', sets: 3, reps: '12' },
    { name: 'Russian Twist na Bola', sets: 3, reps: '15 cada lado' }
  ]
];

const PROGRAMS = {
  home: {
    1: { title: "Mês 1 (Técnica): Adaptação Funcional", desc: "Foca na execução perfeita. Não te preocupes com cargas altas.", workouts: STRENGTH_WORKOUTS },
    2: { title: "Mês 2 (Sobrecarga): Tensão Muscular", desc: "Tenta aumentar o peso dos halteres ou a carga da polia.", workouts: STRENGTH_WORKOUTS },
    3: { title: "Mês 3 (Intensidade): Explosão", desc: "Reduz o descanso para 30s e faz os movimentos com mais explosão.", workouts: STRENGTH_WORKOUTS }
  },
  gym: {
    1: { title: "Mês 1 (Técnica): Base e Estabilidade", desc: "Foca na execução perfeita. Não te preocupes com cargas altas.", workouts: STRENGTH_WORKOUTS },
    2: { title: "Mês 2 (Sobrecarga): Força", desc: "Tenta aumentar o peso dos halteres ou a carga da polia.", workouts: STRENGTH_WORKOUTS },
    3: { title: "Mês 3 (Intensidade): Potência", desc: "Reduz o descanso para 30s e faz os movimentos com mais explosão.", workouts: STRENGTH_WORKOUTS }
  },
  run: {
    1: { title: "Mês 1: Adaptação (Intervalos)", desc: "1 min de Corrida leve / 2 min de Caminhada rápida.", workouts: [
      [ { name: 'Trote Leve / Caminhada', sets: 8, reps: '1m / 2m' }, { name: 'Tempo Total', sets: 1, reps: '24 min' } ]
    ]},
    2: { title: "Mês 2: Resistência", desc: "Evolução do tempo de corrida (Semanas 5-8).", workouts: [
      [ { name: 'Corrida / Caminhada (Sem. 5-6)', sets: 6, reps: '3m / 1m' }, { name: 'Tempo Total', sets: 1, reps: '24 min' } ],
      [ { name: 'Corrida / Caminhada (Sem. 7-8)', sets: 4, reps: '5m / 1m' }, { name: 'Tempo Total', sets: 1, reps: '24 min' } ]
    ]},
    3: { title: "Mês 3: Performance", desc: "Treino Longo e HIIT.", workouts: [
      [ { name: 'Corrida Contínua', sets: 1, reps: '25-30 min no teu ritmo' } ],
      [ { name: 'Tiro Rápido / Caminhada (HIIT)', sets: 10, reps: '1m / 1m' }, { name: 'Tempo Total', sets: 1, reps: '20 min' } ]
    ]}
  },
  footvolley: {
    1: { title: "Padrão: Futevôlei", desc: "Sessão base de Futevôlei", exercises: [
      { name: 'Aquecimento Técnico (Altinha)', sets: 1, reps: '10 min' },
      { name: 'Partida / Set', sets: 3, reps: '18 pts' },
      { name: 'Alongamento Final', sets: 1, reps: '5 min' }
    ]}
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [monthlyPlan, setMonthlyPlan] = useState({}); // Custom overrides per date 'YYYY-MM-DD'
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editingLogData, setEditingLogData] = useState(null);
  const [customWorkouts, setCustomWorkouts] = useState({}); // Stores AI overrides keyed by "modalityId_phase"
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [workoutEffort, setWorkoutEffort] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState({ name: '', age: '', gender: 'Masculino', height: '', weight: '', goal: 'Ser ativo', activities: [] });

  // --- Helper: Get Current Phase based on Logs ---
  const getCurrentPhase = (modalityId) => {
    if (modalityId === 'footvolley' || modalityId === 'express') return 1;
    const count = workoutLogs.filter(l => l.modalityId === modalityId).length;
    const totalPerPhase = (modalityId === 'gym' || modalityId === 'home') ? 12 : 4;
    if (count < totalPerPhase) return 1;
    if (count < totalPerPhase * 2) return 2;
    return 3;
  };

  const getPhaseProgress = (modalityId) => {
    if (modalityId === 'footvolley' || modalityId === 'express') return null;
    const count = workoutLogs.filter(l => l.modalityId === modalityId).length;
    const totalPerPhase = (modalityId === 'gym' || modalityId === 'home') ? 12 : 4;
    const phase = getCurrentPhase(modalityId);
    if (phase === 3 && count >= totalPerPhase * 3) {
      return { remaining: 0, total: totalPerPhase };
    }
    const phaseStartCount = (phase - 1) * totalPerPhase;
    const completedInPhase = count - phaseStartCount;
    return { remaining: totalPerPhase - completedInPhase, total: totalPerPhase };
  };

  const normalizeDateKey = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const hasLoggedWorkoutForDate = (date) => {
    const targetDate = normalizeDateKey(date);
    return workoutLogs.some(log => normalizeDateKey(log.timestamp) === targetDate);
  };

  const calculateVolume = (log) => {
    return (log.exercises || []).reduce((total, ex) => {
      if (Array.isArray(ex.setDetails) && ex.setDetails.length) {
        return total + ex.setDetails.reduce((sum, set) => sum + (Number(set.weight) * Number(set.reps) || 0), 0);
      }
      return total + (Number(ex.weight) * Number(ex.actualReps) || 0);
    }, 0);
  };

  const getWorkoutPoints = (log) => {
    const completed = log.totalCompleted || (log.exercises || []).filter(e => e.completed).length;
    const effort = log.effort || 3;
    const volume = calculateVolume(log);
    return 10 + effort * 5 + completed * 2 + Math.floor(volume / 100);
  };

  const getBadgeLevel = (points) => {
    if (points >= 400) return { title: 'Atleta', color: 'bg-green-500', subtitle: 'Fase de alta performance' };
    if (points >= 200) return { title: 'Forte', color: 'bg-blue-500', subtitle: 'Mantendo a consistência' };
    if (points >= 100) return { title: 'Regular', color: 'bg-orange-500', subtitle: 'Boa jornada' };
    return { title: 'Iniciante', color: 'bg-indigo-500', subtitle: 'Vamos começar!' };
  };

  const getStreak = () => {
    const days = new Set(workoutLogs.map(log => normalizeDateKey(log.timestamp)));
    let current = new Date();
    current.setDate(current.getDate() - 1); // Começa a contar a partir de ontem
    let streak = 0;
    while (true) {
      const dayKey = normalizeDateKey(current);
      if (!days.has(dayKey)) break;
      streak += 1;
      current.setDate(current.getDate() - 1);
    }
    return streak;
  };

  const getMaxStreak = () => {
    const sortedLogs = [...workoutLogs].sort((a, b) => a.timestamp - b.timestamp);
    if (!sortedLogs.length) return 0;
    
    let maxStreak = 1;
    let currentStreak = 1;
    let lastDate = null;
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const currentDate = normalizeDateKey(sortedLogs[i].timestamp);
      if (i === 0) {
        lastDate = currentDate;
        continue;
      }
      
      const lastTime = new Date(lastDate).getTime();
      const currentTime = new Date(currentDate).getTime();
      const dayDiff = (currentTime - lastTime) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        currentStreak += 1;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (dayDiff > 1) {
        currentStreak = 1;
      }
      lastDate = currentDate;
    }
    
    return maxStreak;
  };


  const getUpcomingWorkoutSequence = (modalityId, count = 2) => {
    const phase = getCurrentPhase(modalityId);
    const key = `${modalityId}_${phase}`;
    const loggedCount = workoutLogs.filter(l => l.modalityId === modalityId).length;
    let baseWorkouts = [];
    const prog = PROGRAMS[modalityId]?.[phase];
    if (prog?.workouts) baseWorkouts = prog.workouts;
    else if (prog?.exercises) baseWorkouts = [prog.exercises];
    if (!baseWorkouts.length) return [];
    
    const customExercises = customWorkouts[key];
    const result = [];
    for (let i = 0; i < count; i++) {
      const nextLogCount = loggedCount + i;
      const workoutIndex = nextLogCount % baseWorkouts.length;
      const isCustomized = customExercises && nextLogCount === loggedCount;
      result.push({
        phase,
        workoutIndex: workoutIndex + 1,
        totalWorkouts: baseWorkouts.length,
        exercises: isCustomized ? customExercises : baseWorkouts[workoutIndex],
        label: isCustomized ? 'Personalizado' : `Treino ${workoutIndex + 1}/${baseWorkouts.length}`
      });
    }
    return result;
  };

  const getUpcomingWorkoutForModality = (modalityId, offset = 0) => {
    return getUpcomingWorkoutSequence(modalityId, offset + 1)[offset] || { phase: getCurrentPhase(modalityId), exercises: [], label: 'Próximo treino' };
  };

  // --- Timer Setup ---
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // --- Auth Setup ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        }
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Logged in via redirect", result.user);
        }
      } catch (err) {
        console.error("Auth error during init:", err);
        if (err.code === 'auth/unauthorized-domain') {
          alert(`Para testar no celular via Wi-Fi, adicione este IP (${window.location.hostname}) na aba "Authentication > Settings > Authorized domains" do seu painel do Firebase Console.`);
        } else {
          alert("Erro na autenticação: " + err.message);
        }
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    // Try popup first as it is more stable on PC and most modern browsers
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro no login com Google (Popup):", error);
      
      if (error.code === 'auth/unauthorized-domain') {
        alert(`Acesso bloqueado! Para testar no celular ou num IP local, você deve adicionar "${window.location.hostname}" na aba "Authentication > Settings > Authorized domains" do Firebase Console.`);
        return;
      }
      
      // Fallback to redirect if popup is blocked (common in in-app browsers like WhatsApp/Instagram)
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          console.error("Erro no login com Google (Redirect):", redirectError);
          alert("Não foi possível realizar o login. Tente abrir no navegador padrão do celular (Chrome/Safari).");
        }
      } else {
        alert("Erro na autenticação: " + error.message);
      }
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await signOut(auth);
    // Reset state after logout
    setWeeklyPlan({});
    setCustomWorkouts({});
    setWorkoutLogs([]);
    setCurrentWorkout(null);
    setActiveTab('dashboard');
    // Force reload to ensure clean state
    window.location.reload();
  };

  // --- Firestore Data Fetching ---
  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        setProfile(null);
      }
      setProfileLoading(false);
    }, (err) => {
      console.error("Erro ao carregar o perfil:", err);
      setProfileLoading(false);
    });

    const planRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'weeklyPlan');
    const unsubPlan = onSnapshot(planRef, (docSnap) => {
      if (docSnap.exists()) {
        setWeeklyPlan(docSnap.data().weekly || {});
        setMonthlyPlan(docSnap.data().monthly || {});
      }
      setLoading(false);
    }, (err) => {
      console.error("Erro ao carregar o plano semanal:", err);
      setLoading(false);
    });

    const customRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'customWorkouts');
    const unsubCustom = onSnapshot(customRef, (docSnap) => {
      if (docSnap.exists()) setCustomWorkouts(docSnap.data());
    }, (err) => console.error("Erro ao carregar treinos personalizados:", err));

    const logsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'workoutLogs');
    const unsubLogs = onSnapshot(logsRef, (querySnapshot) => {
      const logs = [];
      querySnapshot.forEach((doc) => logs.push({ id: doc.id, ...doc.data() }));
      logs.sort((a, b) => b.timestamp - a.timestamp);
      setWorkoutLogs(logs);
    }, (err) => console.error("Erro ao carregar registos de treino:", err));

    return () => { unsubProfile(); unsubPlan(); unsubCustom(); unsubLogs(); };
  }, [user]);

  // --- Base Actions ---
  const saveProfile = async (e) => {
    e?.preventDefault();
    if (!user) return;
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    await setDoc(profileRef, onboardingData);
    setProfile(onboardingData);
    setActiveTab('dashboard'); // Also switch to dashboard if coming from an edit screen
  };

  const savePlanData = async (weekly, monthly) => {
    if (!user) return;
    const planRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'weeklyPlan');
    await setDoc(planRef, { weekly, monthly });
  };

  const saveMonthlyPlan = async (newMonthly) => {
    setMonthlyPlan(newMonthly);
    await savePlanData(weeklyPlan, newMonthly);
  };

  const saveWeeklyPlan = async (newPlan) => {
    if (!user) return;
    await savePlanData(newPlan, monthlyPlan);
  };

  const startWorkout = (modalityId) => {
    const phase = getCurrentPhase(modalityId);
    const key = `${modalityId}_${phase}`;
    let baseExercises = [];

    if (customWorkouts[key]) {
      baseExercises = customWorkouts[key];
    } else {
      const preview = getUpcomingWorkoutSequence(modalityId, 1)[0];
      if (preview) {
        baseExercises = preview.exercises;
      } else {
        const prog = PROGRAMS[modalityId][phase];
        baseExercises = prog?.workouts ? prog.workouts[0] : prog?.exercises || [];
      }
    }

    setCurrentWorkout({
      modalityId,
      phase, // store the phase they ran this in
      date: new Date().toISOString(),
      exercises: baseExercises.map(ex => {
        const setsCount = Number(ex.sets) || 1;
        return {
          ...ex,
          weight: '',
          actualReps: '',
          completed: false,
          setDetails: Array.from({ length: setsCount }, () => ({ weight: '', reps: '', completed: false }))
        };
      })
    });
    setWorkoutEffort(null);
    setActiveTab('active-workout');
    setWorkoutTimer(0);
    setIsTimerRunning(true);
  };

  const finishWorkout = async () => {
    if (!user || !currentWorkout) return;
    if (!workoutEffort) {
      alert("Por favor, avalie o esforço do treino antes de finalizar.");
      return;
    }
    setIsTimerRunning(false);
    const logsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'workoutLogs');
    const totalCompleted = currentWorkout.exercises.filter(e => e.completed).length;
    const durationSeconds = workoutTimer;
    const volume = currentWorkout.exercises.reduce((total, ex) => {
      if (Array.isArray(ex.setDetails) && ex.setDetails.length) {
        return total + ex.setDetails.reduce((sum, set) => sum + (Number(set.weight) * Number(set.reps) || 0), 0);
      }
      return total + (Number(ex.weight) * Number(ex.actualReps) || 0);
    }, 0);
    const points = 10 + workoutEffort * 5 + totalCompleted * 2 + Math.floor(volume / 100);

    await addDoc(logsRef, {
      ...currentWorkout,
      effort: workoutEffort,
      timestamp: Date.now(),
      durationSeconds,
      totalCompleted,
      volume,
      points
    });
    setCurrentWorkout(null);
    setWorkoutEffort(null);
    setActiveTab('history');
  };

  // --- Components ---

  const renderOnboarding = () => {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-800">Bem-vindo(a)! 🎉</h2>
          <p className="text-gray-500 text-sm mt-2">Para criar os seus treinos com IA no futuro, precisamos de algumas informações básicas.</p>
        </div>
        
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Como quer ser chamado?</label>
            <input required type="text" value={onboardingData.name} onChange={e => setOnboardingData({...onboardingData, name: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition" placeholder="Ex: Iury" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Idade</label>
              <input required type="number" value={onboardingData.age} onChange={e => setOnboardingData({...onboardingData, age: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition" placeholder="Anos" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Gênero</label>
              <select value={onboardingData.gender} onChange={e => setOnboardingData({...onboardingData, gender: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition bg-white">
                <option>Masculino</option>
                <option>Feminino</option>
                <option>Outro</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Altura (cm)</label>
              <input required type="number" value={onboardingData.height} onChange={e => setOnboardingData({...onboardingData, height: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition" placeholder="Ex: 170" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Peso (kg)</label>
              <input required type="number" value={onboardingData.weight} onChange={e => setOnboardingData({...onboardingData, weight: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition" placeholder="Ex: 67" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Objetivo Principal</label>
            <select value={onboardingData.goal} onChange={e => setOnboardingData({...onboardingData, goal: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition bg-white">
              <option>Ser ativo (Saúde)</option>
              <option>Perder peso (Emagrecimento)</option>
              <option>Ganhar músculo (Hipertrofia)</option>
              <option>Performance Esportiva</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Esportes / Atividades</label>
            <div className="grid grid-cols-2 gap-2">
              {MODALITIES.map(mod => (
                <label key={mod.id} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition ${onboardingData.activities.includes(mod.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={onboardingData.activities.includes(mod.id)}
                    onChange={(e) => {
                      const acts = onboardingData.activities;
                      if (e.target.checked) setOnboardingData({...onboardingData, activities: [...acts, mod.id]});
                      else setOnboardingData({...onboardingData, activities: acts.filter(a => a !== mod.id)});
                    }}
                  />
                  <mod.icon size={16} className={onboardingData.activities.includes(mod.id) ? 'text-blue-500' : 'text-gray-400'} />
                  <span className={`text-sm font-bold ${onboardingData.activities.includes(mod.id) ? 'text-blue-700' : 'text-gray-600'}`}>{mod.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition shadow-lg mt-4">
            Salvar e Começar
          </button>
        </form>
      </div>
    );
  };

  const renderDashboard = () => {
    const todayDate = new Date();
    const getPlannedModalityForDate = (date) => {
      const dateStr = normalizeDateKey(date);
      if (monthlyPlan[dateStr] !== undefined) return monthlyPlan[dateStr];
      return weeklyPlan[date.getDay()] || '';
    };
    const plannedForToday = getPlannedModalityForDate(todayDate);

    const firstName = profile?.name || user?.displayName?.split(' ')[0] || 'Iury';
    const funnyPhrase = FUNNY_PHRASES[new Date().getDay() % FUNNY_PHRASES.length];
    const totalPoints = workoutLogs.reduce((sum, log) => sum + getWorkoutPoints(log), 0);
    const currentStreak = getStreak();
    const badge = getBadgeLevel(totalPoints);
    const homeGymMonthlyCount = workoutLogs.filter(l => l.modalityId === 'home' || l.modalityId === 'gym').filter(l => {
      const logDate = new Date(l.timestamp);
      const now = new Date();
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    }).length;
    const runMonthlyCount = workoutLogs.filter(l => l.modalityId === 'run').filter(l => {
      const logDate = new Date(l.timestamp);
      const now = new Date();
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    }).length;

    return (
      <div className="space-y-6">
        <header className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Olá, {firstName}! 👋</h1>
              <p className="text-gray-500 mt-1 text-sm font-medium">{funnyPhrase}</p>
              {profile && (
                <p className="text-gray-400 mt-2 text-xs font-bold bg-gray-50 inline-block px-2 py-1 rounded-md">
                  {profile.age} anos • {profile.height}cm • {profile.weight}kg
                </p>
              )}
            </div>
            <button 
              onClick={() => {
                if (profile) setOnboardingData(profile);
                setProfile(null); // Triggers the onboarding view to act as an edit screen
              }}
              className="text-blue-500 bg-blue-50 p-2 rounded-full hover:bg-blue-100 transition active:scale-95"
              title="Editar Perfil"
            >
              <User size={24} />
            </button>
          </div>


        </header>

        <section>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Logado como:</p>
                <p className="font-bold text-gray-800">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-600 transition active:scale-95"
              >
                Sair
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" /> Seu Treino de Hoje
          </h2>
          {plannedForToday ? (
            <div className="bg-white p-5 rounded-2xl border-2 border-blue-500 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${MODALITIES.find(m => m.id === plannedForToday)?.color} text-white shadow-inner`}>
                    {React.createElement(MODALITIES.find(m => m.id === plannedForToday)?.icon || Dumbbell, { size: 24 })}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">
                      {MODALITIES.find(m => m.id === plannedForToday)?.name}
                    </p>
                    <p className="text-xs font-semibold text-blue-600 uppercase mt-0.5">
                      {plannedForToday !== 'footvolley' ? `Mês ${getCurrentPhase(plannedForToday)}: ${PROGRAMS[plannedForToday][getCurrentPhase(plannedForToday)].title.split(':')[1] || 'Treino'}` : 'Treino Padrão'}
                    </p>
                    {plannedForToday !== 'footvolley' && getPhaseProgress(plannedForToday) && (
                      <p className="text-[10px] text-gray-500 font-medium mt-1">
                        Faltam {getPhaseProgress(plannedForToday).remaining} treinos nesta fase
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => startWorkout(plannedForToday)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md active:scale-95 transition"
                >
                  Treinar <Play size={18} fill="currentColor" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-2xl border-2 border-dashed border-gray-200 text-center">
              <p className="text-gray-500 mb-4">Hoje é dia de descanso (ou futevôlei com os amigos!).</p>
              <button onClick={() => setActiveTab('planner')} className="text-blue-600 font-bold hover:underline">
                Planejar minha semana →
              </button>
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 gap-4">
          <button onClick={() => setActiveTab('history')} className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center gap-2 hover:border-blue-200 transition">
            <TrendingUp className="text-purple-500" />
            <span className="text-sm font-bold text-gray-700">Progressão</span>
          </button>
          <button onClick={() => setActiveTab('planner')} className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center gap-2 hover:border-blue-200 transition">
            <Calendar className="text-orange-500" />
            <span className="text-sm font-bold text-gray-700">Calendário</span>
          </button>
        </section>

        <section>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Target size={24} className="text-green-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-800">Progresso e Desempenho</h2>
                <p className="text-sm text-gray-500">Acompanhe sua evolução nos próximos 3 meses</p>
              </div>
            </div>

            <div className="grid gap-4 mb-6 md:grid-cols-3">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-5 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${badge.color} text-white text-lg font-black`}>{badge.title[0]}</span>
                  <div>
                    <p className="text-lg font-black">{badge.title}</p>
                    <p className="text-xs text-white/80">{badge.subtitle}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-white/90">
                  <div className="flex justify-between"><span>Sequência</span><span className="font-bold">{currentStreak}d</span></div>
                  <div className="flex justify-between"><span>Máximo</span><span className="font-bold">{getMaxStreak()}d</span></div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Dumbbell size={18} className="text-blue-600" />
                  <p className="text-sm font-bold text-blue-900">Home + Academia</p>
                </div>
                <p className="text-3xl font-black text-blue-900">{homeGymMonthlyCount} / 8</p>
                <p className="text-xs text-blue-600 mt-1">meta mensal combinada</p>
                <div className="mt-3 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, (homeGymMonthlyCount / 8) * 100)}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
                  {[1, 2, 3].map(m => <span key={m} className={`px-2 py-1 rounded ${m === Math.max(getCurrentPhase('home'), getCurrentPhase('gym')) ? 'bg-blue-700 text-white' : 'bg-white text-blue-600'}`}>M{m}</span>)}
                </div>
              </div>
              
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={18} className="text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-900">Corrida</p>
                </div>
                <p className="text-3xl font-black text-emerald-900">{runMonthlyCount} / 4</p>
                <p className="text-xs text-emerald-600 mt-1">meta mensal de corrida</p>
                <div className="mt-3 h-2 bg-emerald-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600" style={{ width: `${Math.min(100, (runMonthlyCount / 4) * 100)}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
                  {[1, 2, 3].map(m => <span key={m} className={`px-2 py-1 rounded ${m === getCurrentPhase('run') ? 'bg-emerald-700 text-white' : 'bg-white text-emerald-600'}`}>M{m}</span>)}
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    );
  };

  
  
  const [selectedDateForModal, setSelectedDateForModal] = useState(null);

  const renderPlanner = () => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    const getLogsForDay = (day) => {
      return workoutLogs.filter(log => {
        const d = new Date(log.timestamp);
        return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
      });
    };

    const getPlannedModalityForDate = (date) => {
      const dateStr = normalizeDateKey(date);
      if (monthlyPlan[dateStr] !== undefined) {
        return monthlyPlan[dateStr];
      }
      return weeklyPlan[date.getDay()] || '';
    };

    const getNextScheduledWorkouts = (count = 3) => {
      const upcoming = [];
      const today = new Date();
      const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const modalityFutureCount = {};
      while (upcoming.length < count) {
        const modality = getPlannedModalityForDate(cursor);
        if (modality && !hasLoggedWorkoutForDate(cursor)) {
          const futureIndex = modalityFutureCount[modality] || 0;
          const workout = getUpcomingWorkoutForModality(modality, futureIndex);
          upcoming.push({ date: new Date(cursor), modality, workout });
          modalityFutureCount[modality] = futureIndex + 1;
        }
        cursor.setDate(cursor.getDate() + 1);
        if ((cursor - today) / 86400000 > 30) break;
      }
      return upcoming;
    };

    return (
      <div className="space-y-6">
        {/* Calendar Section */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold capitalize">{monthName}</h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
             <p className="text-xs text-gray-500">Toque num dia para definir o treino</p>
             <button onClick={() => setShowWeeklyModal(true)} className="text-blue-500 bg-blue-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase hover:bg-blue-100">
               Padrão Semanal
             </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, index) => (
              <span key={`day-${index}`} className="text-[10px] font-black text-gray-300 uppercase">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateForDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              
              const logs = getLogsForDay(day);
              const hasWorkout = logs.length > 0;
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();

              const plannedModalityId = getPlannedModalityForDate(dateForDay);
              const isPlannedForDay = !!plannedModalityId && !hasWorkout;
              const plannedModality = MODALITIES.find(m => m.id === plannedModalityId);

              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDateForModal(dateForDay)}
                  className={`cursor-pointer aspect-square flex flex-col items-center justify-center rounded-xl relative transition-all ${isToday ? 'ring-2 ring-offset-2 ring-blue-500 font-black scale-105 z-10' : 'hover:bg-gray-100'} ${hasWorkout ? 'bg-blue-50 text-blue-800 border border-blue-100 shadow-sm' : isPlannedForDay ? `bg-white border-2 border-dashed ${plannedModality ? plannedModality.color.replace('bg-', 'border-').replace('500', '200') : 'border-gray-200'} text-gray-700` : 'bg-gray-50 text-gray-400 border border-transparent'}`}
                >
                  <span className="text-xs font-bold">{day}</span>
                  {hasWorkout && (
                    <div className="flex gap-1 mt-1">
                      {logs.map((l, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${MODALITIES.find(m => m.id === l.modalityId)?.color || 'bg-yellow-500'} shadow-sm`} />
                      ))}
                    </div>
                  )}
                  {isPlannedForDay && (
                    <div className="flex gap-1 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full border-2 ${plannedModality ? plannedModality.color.replace('bg-', 'border-') : 'border-gray-300'}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Selector Modal */}
        {selectedDateForModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-xs space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-800">
                  Treino do dia {selectedDateForModal.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}
                </h3>
                <button onClick={() => setSelectedDateForModal(null)} className="text-gray-400 p-2 rounded-full hover:bg-gray-100"><Plus className="rotate-45" size={20}/></button>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                     const dateStr = normalizeDateKey(selectedDateForModal);
                     saveMonthlyPlan({ ...monthlyPlan, [dateStr]: '' });
                     setSelectedDateForModal(null);
                  }}
                  className={`w-full p-4 rounded-2xl flex items-center gap-3 font-bold border-2 transition-all ${getPlannedModalityForDate(selectedDateForModal) === '' ? 'border-gray-400 bg-gray-50 text-gray-800' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                >
                  <div className="p-2 rounded-lg bg-gray-200 text-white"><Home size={18}/></div>
                  Descanso
                </button>
                {MODALITIES.map(mod => {
                  const isSelected = getPlannedModalityForDate(selectedDateForModal) === mod.id;
                  return (
                    <button 
                      key={mod.id}
                      onClick={() => {
                         const dateStr = normalizeDateKey(selectedDateForModal);
                         saveMonthlyPlan({ ...monthlyPlan, [dateStr]: mod.id });
                         setSelectedDateForModal(null);
                      }}
                      className={`w-full p-4 rounded-2xl flex items-center gap-3 font-bold border-2 transition-all ${isSelected ? `${mod.color.replace('bg-', 'border-')} ${mod.color.replace('bg-', 'bg-').replace('500', '50')} text-gray-800` : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                    >
                      <div className={`p-2 rounded-lg ${mod.color} text-white`}><mod.icon size={18}/></div>
                      {mod.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Próximos treinos</h2>
              <p className="text-sm text-gray-500">Visualize os próximos 3 treinos planejados com as modalidades e exercícios principais.</p>
            </div>
          </div>
          <div className="grid gap-4">
            {(() => {
              const upcoming = getNextScheduledWorkouts(3);
              return upcoming.length ? upcoming.map((item, idx) => {
                const mod = MODALITIES.find(m => m.id === item.modality);
                return (
                  <div key={idx} className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${mod?.color || 'bg-gray-400'} text-white`}>
                          {mod ? React.createElement(mod.icon, { size: 18 }) : <Dumbbell size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{mod?.name || 'Treino'}</p>
                          <p className="text-xs text-gray-500">{item.date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-1">
                        <span className="text-[10px] font-black uppercase text-gray-500">Mês {item.workout.phase}</span>
                        <span className="text-[10px] font-bold uppercase text-blue-600">{item.workout.label}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(item.workout.exercises || []).slice(0, 2).map((ex, exIdx) => (
                        <div key={exIdx} className="rounded-2xl bg-white p-3 border border-gray-100">
                          <p className="font-bold text-sm text-gray-800">{ex.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">{ex.sets}x {ex.reps}</p>
                        </div>
                      ))}
                      {(item.workout.exercises || []).length > 2 && (
                        <p className="text-[10px] text-gray-500 font-medium">+{(item.workout.exercises || []).length - 2} exercícios</p>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div className="bg-gray-50 p-4 rounded-3xl border border-dashed border-gray-200 text-center text-sm text-gray-500">
                  Nenhum treino agendado nos próximos dias. Defina a sua semana para ver os próximos treinos aqui.
                </div>
              );
            })()}
          </div>
        </section>

        {/* Carousels Per Modality */}
        <div className="space-y-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
             <Target size={20} className="text-blue-500" /> Seus Treinos por Modalidade
          </h2>
          
          {MODALITIES.filter(m => m.id !== 'footvolley').map(mod => {
            const logsForMod = workoutLogs.filter(l => l.modalityId === mod.id).sort((a,b) => a.timestamp - b.timestamp);
            const upcoming = getUpcomingWorkoutForModality(mod.id);
            const upcomingSequence = getUpcomingWorkoutSequence(mod.id, 2);
            
            const handleAddExercise = async () => {
              if (!user) return;
              const key = `${mod.id}_${upcoming.phase}`;
              const newExercises = [...upcoming.exercises, { name: 'Novo Exercício', sets: 3, reps: '10' }];
              const newCustom = { ...customWorkouts, [key]: newExercises };
              setCustomWorkouts(newCustom);
              const customRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'customWorkouts');
              await setDoc(customRef, newCustom);
            };

            const saveCustomExerciseName = async (index, newName) => {
              if (!user) return;
              const key = `${mod.id}_${upcoming.phase}`;
              const newExercises = [...upcoming.exercises];
              newExercises[index] = { ...newExercises[index], name: newName };
              const newCustom = { ...customWorkouts, [key]: newExercises };
              setCustomWorkouts(newCustom);
              const customRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'customWorkouts');
              await setDoc(customRef, newCustom);
              setEditingWorkout(null);
            };

            const handleRemoveExercise = async (index) => {
              if (!user) return;
              const key = `${mod.id}_${upcoming.phase}`;
              const newExercises = [...upcoming.exercises];
              newExercises.splice(index, 1);
              const newCustom = { ...customWorkouts, [key]: newExercises };
              setCustomWorkouts(newCustom);
              const customRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'customWorkouts');
              await setDoc(customRef, newCustom);
            };

            return (
              <div key={mod.id} className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                  <div className={`p-1.5 rounded-lg ${mod.color} text-white`}><mod.icon size={16} /></div>
                  <h3 className="font-black text-gray-800">{mod.name}</h3>
                </div>
                
                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  
                  {/* Past Workouts */}
                  {logsForMod.map((log) => (
                    <div key={log.id} className="w-[260px] min-w-[260px] bg-white rounded-3xl border border-gray-100 shadow-sm snap-center flex-shrink-0 flex flex-col opacity-75 grayscale-[0.3]">
                      <div className="p-4 bg-gray-50 rounded-t-3xl border-b border-gray-100 flex items-center justify-between">
                         <span className="font-bold text-gray-600 text-sm">Feito: {new Date(log.timestamp).toLocaleDateString('pt-BR')}</span>
                         <CheckCircle2 size={16} className="text-green-500" />
                      </div>
                      <div className="p-4 flex-1 space-y-2">
                        {log.exercises.slice(0, 3).map((ex, i) => (
                           <div key={i} className="text-xs text-gray-500 truncate">• {ex.name}</div>
                        ))}
                        {log.exercises.length > 3 && <div className="text-xs text-gray-400 font-medium italic">+{log.exercises.length - 3} exercícios</div>}
                      </div>
                    </div>
                  ))}

                  {/* Next Workout */}
                  <div className={`w-[300px] min-w-[300px] bg-white rounded-3xl border-2 ${mod.color.replace('bg-', 'border-').replace('500', '200')} shadow-md snap-center flex-shrink-0 flex flex-col relative`}>
                    <div className="absolute -top-2 -right-1 bg-blue-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm z-10 animate-bounce">A SEGUIR</div>
                    <div className={`p-4 rounded-t-2xl ${mod.color} text-white flex items-center justify-between`}>
                       <span className="font-bold">Treino Atual</span>
                       <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded-md">Mês {upcoming.phase}</span>
                    </div>
                    <div className="px-4 py-3 border-b border-white/20 text-[10px] text-white/80 bg-white/5">
                      <div className="flex flex-wrap gap-2">
                        {upcomingSequence.map((item, idx) => (
                          <span key={idx} className="rounded-full bg-white/15 px-2 py-1">
                            {idx === 0 ? 'Próximo' : 'Depois'} • {item.exercises.length} exer{item.exercises.length === 1 ? 'cício' : 'cios'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 flex-1 space-y-3">
                       {upcoming.exercises.map((ex, i) => (
                         <div key={i} className="flex flex-col bg-gray-50 p-3 rounded-xl border border-gray-100">
                           <div className="flex items-start justify-between gap-2">
                             <div className="flex flex-col w-full">
                               {editingWorkout === `${mod.id}_${i}` ? (
                                 <input type="text" className="w-full text-sm font-bold text-gray-800 bg-white border border-gray-200 rounded px-2 py-1 mb-1 focus:outline-blue-500" value={ex.name} onChange={(e) => {
                                    const newExercises = [...upcoming.exercises];
                                    newExercises[i] = { ...newExercises[i], name: e.target.value };
                                    setCustomWorkouts({ ...customWorkouts, [`${mod.id}_${upcoming.phase}`]: newExercises });
                                 }} />
                               ) : (
                                 <span className="font-bold text-gray-800 text-sm leading-tight">{ex.name}</span>
                               )}
                               <span className="text-[10px] text-gray-500 font-bold uppercase">{ex.sets}x {ex.reps}</span>
                             </div>
                             <div className="flex gap-1">
                               {editingWorkout === `${mod.id}_${i}` ? (
                                 <button onClick={() => saveCustomExerciseName(i, ex.name)} className="text-[10px] text-green-600 bg-green-50 p-1.5 rounded-lg"><CheckCircle2 size={14}/></button>
                               ) : (
                                 <button onClick={() => setEditingWorkout(`${mod.id}_${i}`)} className="text-[10px] text-blue-500 bg-blue-50 p-1.5 rounded-lg"><Wand2 size={14}/></button>
                               )}
                               <button onClick={() => handleRemoveExercise(i)} className="text-[10px] text-red-500 bg-red-50 p-1.5 rounded-lg"><Trash2 size={14}/></button>
                             </div>
                           </div>
                           
                           {editingWorkout === `${mod.id}_${i}` && (
                             <div className="mt-2 pt-2 border-t border-gray-200">
                               <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wide">Substitutos:</p>
                               <div className="flex flex-wrap gap-1.5">
                                 {Object.entries(SUBSTITUTES).flatMap(([, subs]) => 
                                   subs.map(sub => (
                                     <button 
                                       key={sub}
                                       onClick={() => saveCustomExerciseName(i, sub)}
                                       className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded hover:border-blue-500 hover:text-blue-600 transition text-left"
                                     >
                                       {sub}
                                     </button>
                                   ))
                                 )}
                               </div>
                             </div>
                           )}
                         </div>
                       ))}
                       <button onClick={handleAddExercise} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-xs font-bold hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center gap-1 transition">
                         <Plus size={14} /> Adicionar Exercício
                       </button>
                    </div>

                    <div className="p-4 border-t border-gray-50">
                      <button 
                        onClick={() => startWorkout(mod.id)}
                        className={`w-full ${mod.color} text-white font-bold py-3 rounded-xl hover:opacity-90 active:scale-95 transition shadow-sm flex items-center justify-center gap-2`}
                      >
                        Iniciar Agora <Play size={16} fill="currentColor" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };


  const renderWorkoutLogger = () => {
    if (!currentWorkout) return null;
    const mod = MODALITIES.find(m => m.id === currentWorkout.modalityId);

    const updateEx = (index, field, value) => {
      const newExercises = [...currentWorkout.exercises];
      const updated = { ...newExercises[index], [field]: value };
      if (field === 'sets') {
        const setsCount = Number(value) || 1;
        const setDetails = Array.from({ length: setsCount }, (_, idx) => {
          const existing = updated.setDetails?.[idx] || { weight: '', reps: '', completed: false };
          return { ...existing, weight: existing.weight || '', reps: existing.reps || '' };
        });
        updated.setDetails = setDetails;
      }
      newExercises[index] = updated;
      setCurrentWorkout({ ...currentWorkout, exercises: newExercises });
    };

    const updateSetDetail = (exerciseIndex, setIndex, field, value) => {
      const newExercises = [...currentWorkout.exercises];
      const newSetDetails = [...(newExercises[exerciseIndex].setDetails || [])];
      newSetDetails[setIndex] = { ...newSetDetails[setIndex], [field]: value };
      newExercises[exerciseIndex] = { ...newExercises[exerciseIndex], setDetails: newSetDetails };
      setCurrentWorkout({ ...currentWorkout, exercises: newExercises });
    };

    const toggleComplete = (index) => {
      const newExercises = [...currentWorkout.exercises];
      newExercises[index] = { ...newExercises[index], completed: !newExercises[index].completed };
      setCurrentWorkout({ ...currentWorkout, exercises: newExercises });
    };

    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${mod?.color || 'bg-yellow-500'} text-white`}>
                {React.createElement(mod?.icon || Zap, { size: 20 })}
              </div>
              <div>
                <h2 className="text-xl font-bold leading-tight">{mod?.name || 'Treino Expresso'}</h2>
                {currentWorkout.modalityId !== 'express' && currentWorkout.modalityId !== 'footvolley' && (
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fase {currentWorkout.phase}</p>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowCancelConfirm(true)}
              className="text-gray-400 hover:text-red-500 transition"
            >
              <Trash2 size={20} />
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 bg-gray-50 py-2 rounded-xl text-gray-700 font-mono text-lg font-bold border border-gray-100">
            <Timer size={20} className={isTimerRunning ? 'text-blue-500 animate-pulse' : 'text-gray-400'} />
            <span className={workoutTimer > 2700 ? 'text-red-500' : ''}>{formatTime(workoutTimer)}</span>
          </div>
        </header>

        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Cancelar Treino?</h3>
              <p className="text-gray-500 mb-6 text-sm">Todo o progresso desta sessão será perdido. Tem a certeza?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold"
                >
                  Voltar
                </button>
                <button 
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCurrentWorkout(null);
                    setIsTimerRunning(false);
                    setActiveTab('dashboard');
                  }}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold"
                >
                  Sim, cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 px-1">
          {currentWorkout.exercises.map((ex, idx) => (
            
            <div key={idx} className={`p-5 rounded-3xl border-2 transition-all ${ex.completed ? 'bg-green-50 border-green-200 opacity-75 scale-95' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="pr-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    {editingWorkout === `logger_${idx}` ? (
                       <input type="text" className="w-full text-lg font-bold text-gray-800 bg-white border border-gray-200 rounded px-2 py-1 mb-1 focus:outline-blue-500" value={ex.name} onChange={(e) => updateEx(idx, 'name', e.target.value)} />
                    ) : (
                       <h3 className="font-bold text-gray-800 text-lg leading-tight">{ex.name}</h3>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 items-center">
                    {editingWorkout === `logger_${idx}` ? (
                       <>
                         <input type="number" className="w-16 text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded px-2 py-1 focus:outline-blue-500" value={ex.sets} onChange={(e) => updateEx(idx, 'sets', e.target.value)} placeholder="Séries" />
                         <input type="text" className="w-16 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-1 focus:outline-blue-500" value={ex.reps} onChange={(e) => updateEx(idx, 'reps', e.target.value)} placeholder="Reps" />
                       </>
                    ) : (
                      <>
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">
                          {ex.sets} séries
                        </span>
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">
                          {ex.reps}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button 
                    onClick={() => toggleComplete(idx)}
                    className={`p-3 rounded-2xl transition-all flex-shrink-0 ${ex.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 active:scale-90'}`}
                  >
                    <CheckCircle2 size={24} />
                  </button>
                  <div className="flex gap-1 mt-1">
                     {editingWorkout === `logger_${idx}` ? (
                       <button onClick={() => setEditingWorkout(null)} className="p-1.5 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={16}/></button>
                     ) : (
                       <button onClick={() => setEditingWorkout(`logger_${idx}`)} className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><Wand2 size={16}/></button>
                     )}
                     <button onClick={() => {
                        const newEx = [...currentWorkout.exercises];
                        newEx.splice(idx, 1);
                        setCurrentWorkout({...currentWorkout, exercises: newEx});
                     }} className="p-1.5 bg-red-50 text-red-500 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
              
              {editingWorkout === `logger_${idx}` && (
                 <div className="mb-4 pt-2 border-t border-gray-100">
                   <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wide">Substitutos:</p>
                   <div className="flex flex-wrap gap-1.5">
                     {Object.entries(SUBSTITUTES).flatMap(([, subs]) => 
                       subs.map(sub => (
                         <button 
                           key={sub}
                           onClick={() => {
                              updateEx(idx, 'name', sub);
                              setEditingWorkout(null);
                           }}
                           className="text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded hover:border-blue-500 hover:text-blue-600 transition text-left"
                         >
                           {sub}
                         </button>
                       ))
                     )}
                   </div>
                 </div>
              )}


              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-gray-400">
                  <span>Detalhes por série</span>
                  <span>{ex.setDetails?.length || 0} séries</span>
                </div>
                <div className="space-y-2">
                  {(ex.setDetails || []).map((set, setIdx) => (
                    <div key={setIdx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Peso (kg)</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full bg-transparent p-0 text-lg font-bold text-gray-800 border-none focus:ring-0 placeholder:text-gray-300"
                          value={set.weight}
                          onChange={(e) => updateSetDetail(idx, setIdx, 'weight', e.target.value)}
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Reps</label>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full bg-transparent p-0 text-lg font-bold text-gray-800 border-none focus:ring-0 placeholder:text-gray-300"
                          value={set.reps}
                          onChange={(e) => updateSetDetail(idx, setIdx, 'reps', e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newExercises = [...currentWorkout.exercises];
                          const newSetDetails = [...(newExercises[idx].setDetails || [])];
                          newSetDetails[setIdx] = { ...newSetDetails[setIdx], completed: !newSetDetails[setIdx].completed };
                          newExercises[idx] = { ...newExercises[idx], setDetails: newSetDetails };
                          setCurrentWorkout({ ...currentWorkout, exercises: newExercises });
                        }}
                        className={`rounded-2xl p-3 ${set.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <CheckCircle2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-1 mt-4 mb-6">
          <button 
            onClick={() => {
              const newEx = [...currentWorkout.exercises, {
                name: 'Novo Exercício',
                sets: 3,
                reps: '10',
                completed: false,
                weight: '',
                actualReps: '',
                setDetails: Array.from({ length: 3 }, () => ({ weight: '', reps: '', completed: false }))
              }];
              setCurrentWorkout({ ...currentWorkout, exercises: newEx });
            }}
            className="w-full py-3 border-2 border-dashed border-blue-200 rounded-2xl text-blue-500 text-sm font-bold hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center gap-2 transition"
          >
            <Plus size={18} /> Adicionar Exercício Extra
          </button>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-24">
          <h3 className="font-bold text-gray-800 mb-3 text-center text-sm">Como foi o treino?</h3>
          <div className="flex justify-between gap-1">
            {[
              { value: 1, label: 'Muito Leve', emoji: '🥱' },
              { value: 2, label: 'Leve', emoji: '🙂' },
              { value: 3, label: 'Moderado', emoji: '😅' },
              { value: 4, label: 'Difícil', emoji: '🥵' },
              { value: 5, label: 'Máximo', emoji: '💀' }
            ].map(level => (
              <button 
                key={level.value}
                onClick={() => setWorkoutEffort(level.value)}
                className={`flex-1 flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-all ${workoutEffort === level.value ? 'bg-blue-50 border-2 border-blue-500 scale-105 shadow-sm' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}`}
              >
                <span className="text-2xl mb-1">{level.emoji}</span>
                <span className={`text-[9px] font-bold uppercase text-center leading-tight ${workoutEffort === level.value ? 'text-blue-700' : 'text-gray-500'}`}>{level.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto">
          <button 
            onClick={finishWorkout}
            className="w-full bg-blue-600 text-white py-4 rounded-3xl font-bold shadow-2xl hover:bg-blue-700 active:scale-95 transition text-lg"
          >
            Finalizar Treino
          </button>
        </div>
      </div>
    );
  };

  
  const renderHistory = () => {
    const handleUpdateLog = async () => {
      if (!user || !editingLogId || !editingLogData) return;
      const logRef = doc(db, 'artifacts', appId, 'users', user.uid, 'workoutLogs', editingLogId);
      await updateDoc(logRef, { exercises: editingLogData.exercises });
      setEditingLogId(null);
      setEditingLogData(null);
    };

    const handleDeleteLog = async (id) => {
      if (!user) return;
      if (confirm("Tem certeza que deseja apagar este treino?")) {
        const logRef = doc(db, 'artifacts', appId, 'users', user.uid, 'workoutLogs', id);
        await deleteDoc(logRef);
      }
    };

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="text-purple-500" />
          Seu Histórico
        </h2>

        {workoutLogs.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500">Nenhum treino registado ainda.</p>
          </div>
        ) : (
          workoutLogs.map((log) => {
            const isEditing = editingLogId === log.id;
            return (
              <div key={log.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${MODALITIES.find(m => m.id === log.modalityId)?.color || 'bg-yellow-500'} text-white`}>
                      {React.createElement(MODALITIES.find(m => m.id === log.modalityId)?.icon || Zap, { size: 16 })}
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block">{MODALITIES.find(m => m.id === log.modalityId)?.name || 'Treino Expresso'}</span>
                      {log.phase && <span className="text-[10px] font-bold text-blue-500 uppercase">Mês {log.phase}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-gray-400">{new Date(log.timestamp).toLocaleDateString('pt-BR')}</span>
                    <div className="flex gap-2">
                      {!isEditing && <button onClick={() => { setEditingLogId(log.id); setEditingLogData(log); }} className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 uppercase">Editar</button>}
                      <button onClick={() => handleDeleteLog(log.id)} className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded hover:bg-red-100 uppercase"><Trash2 size={12}/></button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mt-2">
                  {isEditing ? (
                    <div className="space-y-3">
                      {editingLogData.exercises.map((ex, i) => (
                        <div key={i} className="flex gap-2 text-sm items-center">
                           <span className="w-1/2 text-gray-600 font-medium truncate" title={ex.name}>{ex.name}</span>
                           <input type="text" className="w-16 p-1 bg-gray-50 border rounded text-center text-xs" value={ex.weight} onChange={e => {
                             const newEx = [...editingLogData.exercises];
                             newEx[i].weight = e.target.value;
                             setEditingLogData({...editingLogData, exercises: newEx});
                           }} placeholder="Kg" />
                           <span className="text-gray-400">×</span>
                           <input type="number" className="w-16 p-1 bg-gray-50 border rounded text-center text-xs" value={ex.actualReps} onChange={e => {
                             const newEx = [...editingLogData.exercises];
                             newEx[i].actualReps = e.target.value;
                             setEditingLogData({...editingLogData, exercises: newEx});
                           }} placeholder="Reps" />
                        </div>
                      ))}
                      <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                        <button onClick={() => setEditingLogId(null)} className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 rounded-lg">Cancelar</button>
                        <button onClick={handleUpdateLog} className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-sm">Salvar</button>
                      </div>
                    </div>
                  ) : (
                    log.exercises.map((ex, i) => (
                      <div key={i} className="space-y-2 py-2 border-b border-gray-50 last:border-0">
                        <div className="flex justify-between items-start gap-3">
                          <span className="text-gray-600 font-medium">{ex.name}</span>
                          <span className="text-[10px] font-semibold uppercase text-gray-400">{ex.sets}x {ex.reps}</span>
                        </div>
                        {(ex.setDetails && ex.setDetails.length) ? (
                          <div className="grid gap-2">
                            {ex.setDetails.map((set, setIdx) => (
                              <div key={setIdx} className="flex items-center justify-between rounded-2xl bg-gray-50 p-2 text-xs font-bold text-gray-600">
                                <span>Série {setIdx + 1}</span>
                                <span>{set.weight || 0}kg × {set.reps || 0}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>{ex.weight ? `${ex.weight}kg` : 'BW'}</span>
                            <span>{ex.actualReps || '0'} reps</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Activity className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-400 font-bold animate-pulse">A carregar o seu Personal...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFDFF] p-4 text-center space-y-8">
        <div className="bg-blue-600 p-6 rounded-full shadow-lg">
          <Dumbbell size={64} className="text-white" />
        </div>
        <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Personal</h1>
            <p className="text-gray-500 font-medium">Sua evolução fitness, guiada por inteligência.</p>
        </div>
        <button 
          onClick={handleGoogleLogin}
          className="bg-white border-2 border-gray-100 flex items-center justify-center gap-3 w-full max-w-sm py-4 rounded-2xl shadow-sm hover:bg-gray-50 hover:border-gray-200 transition-all font-bold text-gray-700 active:scale-95"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
          Continuar com o Google
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-gray-900 font-sans max-w-md mx-auto relative overflow-x-hidden">
      <main className="p-4 pt-8 pb-32">
        {!profileLoading && !profile ? (
          renderOnboarding()
        ) : (
          <>
            
      {showWeeklyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-gray-800">Predefinição Semanal</h3>
              <button onClick={() => setShowWeeklyModal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full"><Plus className="rotate-45" size={20}/></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Esta predefinição será aplicada aos dias do mês que não têm um treino específico atribuído.</p>
            <div className="space-y-3">
              {WEEK_DAYS.map((day, index) => {
                return (
                  <div key={day} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="font-bold text-sm text-gray-700">{day}</span>
                    <select 
                      className="bg-white border-2 border-gray-200 rounded-xl px-2 py-1 text-sm outline-none focus:border-blue-500 font-bold text-gray-600"
                      value={weeklyPlan[index] || ''}
                      onChange={(e) => {
                        const newPlan = { ...weeklyPlan, [index]: e.target.value };
                        if (!e.target.value) delete newPlan[index];
                        saveWeeklyPlan(newPlan);
                      }}
                    >
                      <option value="">Descanso</option>
                      {MODALITIES.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowWeeklyModal(false)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4">Fechar</button>
          </div>
        </div>
      )}

            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'planner' && renderPlanner()}
            {activeTab === 'active-workout' && renderWorkoutLogger()}
            
            {activeTab === 'history' && renderHistory()}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      {activeTab !== 'active-workout' && profile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 flex justify-around py-4 z-50 max-w-md mx-auto rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] px-4">
          {[
            { id: 'dashboard', icon: Activity, label: 'Resumo' },
            { id: 'planner', icon: Calendar, label: 'Plano' },
            { id: 'history', icon: TrendingUp, label: 'Evolução' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon size={activeTab === tab.id ? 24 : 22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className={`text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}