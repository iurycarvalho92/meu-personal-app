import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken, GoogleAuthProvider, signInWithRedirect, signInWithPopup, getRedirectResult, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, addDoc } from 'firebase/firestore';
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


// --- Gemini API Setup ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "COLOQUE_AQUI_SUA_API_KEY"; // Runtime provides the key

// Rate Limiting Logic (6 requests per minute)
const geminiRequestTimestamps = [];
const enforceRateLimit = async () => {
  const MAX_REQUESTS_PER_MINUTE = 6;
  const MINUTE_IN_MS = 60000;
  
  while (true) {
    const now = Date.now();
    // Clean up old timestamps
    while (geminiRequestTimestamps.length > 0 && now - geminiRequestTimestamps[0] >= MINUTE_IN_MS) {
      geminiRequestTimestamps.shift();
    }
    
    if (geminiRequestTimestamps.length < MAX_REQUESTS_PER_MINUTE) {
      geminiRequestTimestamps.push(Date.now());
      return;
    }
    
    // Need to wait. Calculate time until the oldest request expires
    const timeToWait = MINUTE_IN_MS - (now - geminiRequestTimestamps[0]);
    console.warn(`Gemini rate limit (6/min) reached. Waiting ${timeToWait}ms...`);
    // Add a small buffer (100ms) to ensure we pass the 1-minute mark
    await new Promise(resolve => setTimeout(resolve, timeToWait + 100));
  }
};

const callGemini = async (prompt, systemPrompt = "Você é um personal trainer expert.") => {
  await enforceRateLimit();
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] }
  };

  const fetchWithBackoff = async (retries = 0) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error?.message || 'API Error';
        const err = new Error(errorMsg);
        err.status = response.status;
        throw err;
      }
      return await response.json();
    } catch (err) {
      // Do not retry on client errors like 400 (Bad Request/Expired Key) or 404 (Model Not Found)
      if (err.status >= 400 && err.status < 500) {
        console.error("Gemini API Error:", err.message);
        throw err;
      }
      if (retries < 3) {
        await new Promise(res => setTimeout(res, Math.pow(2, retries) * 1000));
        return fetchWithBackoff(retries + 1);
      }
      throw err;
    }
  };

  const result = await fetchWithBackoff();
  return result.candidates?.[0]?.content?.parts?.[0]?.text;
};

// --- Data Constants ---
const MODALITIES = [
  { id: 'home', name: 'Em Casa', icon: Home, color: 'bg-blue-500' },
  { id: 'gym', name: 'Academia', icon: Dumbbell, color: 'bg-purple-500' },
  { id: 'run', name: 'Corrida', icon: Flame, color: 'bg-orange-500' },
  { id: 'footvolley', name: 'Futevôlei', icon: MapPin, color: 'bg-green-500' }
];

const WEEK_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

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
const PROGRAMS = {
  home: {
    1: { title: "Mês 1: Adaptação Funcional", desc: "Acordar o corpo e preparar as articulações.", exercises: [
      { name: 'Agachamento Livre', sets: 3, reps: '15' },
      { name: 'Flexão de Braços (pode usar joelhos)', sets: 3, reps: 'Máximo' },
      { name: 'Prancha Abdominal Frontal', sets: 3, reps: '30 seg' },
      { name: 'Polichinelos', sets: 3, reps: '40 seg' }
    ]},
    2: { title: "Mês 2: Força e Tensão", desc: "Aumentar o tempo sob tensão muscular.", exercises: [
      { name: 'Agachamento Isométrico (Pausa de 2s embaixo)', sets: 3, reps: '12' },
      { name: 'Flexão de Braços Padrão', sets: 3, reps: 'Até a falha' },
      { name: 'Afundo Alternado', sets: 3, reps: '12 por perna' },
      { name: 'Prancha Abdominal com Toque no Ombro', sets: 3, reps: '45 seg' }
    ]},
    3: { title: "Mês 3: Intensidade e Potência", desc: "Movimentos mais explosivos e suor.", exercises: [
      { name: 'Agachamento com Salto', sets: 4, reps: '15' },
      { name: 'Flexão Declinada (Pés no sofá)', sets: 3, reps: 'Máximo' },
      { name: 'Burpees Incompletos', sets: 4, reps: '12' },
      { name: 'Prancha Dinâmica (Sobe e Desce)', sets: 3, reps: '60 seg' }
    ]}
  },
  gym: {
    1: { title: "Mês 1: Full Body Base", desc: "Readaptação em máquinas, segurança primeiro.", exercises: [
      { name: 'Leg Press 45', sets: 3, reps: '15' },
      { name: 'Supino Máquina ou Halteres Leves', sets: 3, reps: '15' },
      { name: 'Puxada Frente (Pulldown)', sets: 3, reps: '15' },
      { name: 'Elevação Lateral Halteres', sets: 3, reps: '12' }
    ]},
    2: { title: "Mês 2: Full Body Força", desc: "Foco em pesos livres e exercícios compostos.", exercises: [
      { name: 'Agachamento Livre (Barra)', sets: 3, reps: '10' },
      { name: 'Supino Reto (Barra)', sets: 3, reps: '10' },
      { name: 'Remada Curvada', sets: 3, reps: '10' },
      { name: 'Desenvolvimento Militar Halteres', sets: 3, reps: '10' }
    ]},
    3: { title: "Mês 3: Hipertrofia Moderada", desc: "Mais volume para resultados visíveis.", exercises: [
      { name: 'Agachamento Búlgaro', sets: 3, reps: '10 por perna' },
      { name: 'Supino Inclinado Halteres', sets: 4, reps: '12' },
      { name: 'Puxada Triângulo + Remada (Super-série)', sets: 3, reps: '10+10' },
      { name: 'Rosca Direta + Tríceps Polia (Super-série)', sets: 3, reps: '12+12' }
    ]}
  },
  run: {
    1: { title: "Mês 1: Construção Aeróbica", desc: "Intervalado de caminhada e trote.", exercises: [
      { name: 'Aquecimento (Caminhada rápida)', sets: 1, reps: '5 min' },
      { name: 'Trote Leve / Caminhada (Alternando 3m / 2m)', sets: 4, reps: '20 min total' },
      { name: 'Desaquecimento', sets: 1, reps: '5 min' }
    ]},
    2: { title: "Mês 2: Corrida Contínua", desc: "Manter o ritmo sem parar para caminhar.", exercises: [
      { name: 'Aquecimento (Trote bem leve)', sets: 1, reps: '5 min' },
      { name: 'Corrida Contínua (Ritmo Conversacional)', sets: 1, reps: '20-25 min' },
      { name: 'Desaquecimento', sets: 1, reps: '5 min' }
    ]},
    3: { title: "Mês 3: Fartlek (Variação)", desc: "Brincar com a velocidade para ganhar fôlego.", exercises: [
      { name: 'Aquecimento', sets: 1, reps: '5 min' },
      { name: 'Tiro Forte 1 min / Trote Leve 1.5 min', sets: 8, reps: '20 min total' },
      { name: 'Desaquecimento', sets: 1, reps: '5 min' }
    ]}
  },
  footvolley: {
    1: { title: "Padrão", desc: "Sessão base de Futevôlei", exercises: [
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
  const [customWorkouts, setCustomWorkouts] = useState({}); // Stores AI overrides keyed by "modalityId_phase"
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPlannerLoading, setAiPlannerLoading] = useState(false);
  const [aiCalendarLoading, setAiCalendarLoading] = useState(false);
  const [bonusAiLoading, setBonusAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [calendarSuggestion, setCalendarSuggestion] = useState("");
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [swapLoadingIdx, setSwapLoadingIdx] = useState(null);
  const [workoutEffort, setWorkoutEffort] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState({ name: '', age: '', gender: 'Masculino', height: '', weight: '', goal: 'Ser ativo', activities: [] });

  // --- Helper: Get Current Phase based on Logs ---
  // Every 4 workouts of a specific modality = 1 Phase (Month)
  const getCurrentPhase = (modalityId) => {
    if (modalityId === 'footvolley' || modalityId === 'express') return 1;
    const count = workoutLogs.filter(l => l.modalityId === modalityId).length;
    if (count < 4) return 1;
    if (count < 8) return 2;
    return 3; // Max phase is 3
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
    setAiInsight("");
    setCalendarSuggestion("");
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
      if (docSnap.exists()) setWeeklyPlan(docSnap.data());
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

  // --- AI Actions ---
  const generateAiWorkout = async (modalityId) => {
    setAiLoading(true);
    try {
      const phase = getCurrentPhase(modalityId);
      const programBase = PROGRAMS[modalityId][phase];
      const mod = MODALITIES.find(m => m.id === modalityId);
      
      const prompt = `Atue como personal trainer. O usuário é um homem de 34 anos, voltando de inatividade. 
      Ele está na Fase ${phase} do programa de ${mod.name}. 
      O objetivo desta fase é: "${programBase.title} - ${programBase.desc}".
      A estrutura base atual é: ${JSON.stringify(programBase.exercises)}.
      
      TAREFA: Gere uma VARIAÇÃO deste treino. Mantenha a mesma estrutura lógica e foco, mas substitua os exercícios por equivalentes para trazer variedade e não cair na rotina. Duração alvo: 30-45min.
      Retorne APENAS um JSON neste formato, sem formatação markdown ou texto extra: 
      [{"name": "nome do exercicio", "sets": 3, "reps": "10-12"}]`;
      
      const responseText = await callGemini(prompt, "Você responde apenas com JSON válido.");
      const cleanedText = responseText.replace(/```json|```/g, "").trim();
      const newExercises = JSON.parse(cleanedText);
      
      const key = `${modalityId}_${phase}`;
      const updatedCustom = { ...customWorkouts, [key]: newExercises };
      setCustomWorkouts(updatedCustom);
      
      if (user) {
        const customRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'customWorkouts');
        await setDoc(customRef, updatedCustom);
      }
    } catch (err) {
      console.error(err);
      alert("Não foi possível gerar a variação no momento. Tente novamente.");
    } finally {
      setAiLoading(false);
    }
  };

  const analyzeProgress = async () => {
    setAiLoading(true);
    try {
      const recentLogs = workoutLogs.slice(0, 5).map(l => ({
        data: new Date(l.timestamp).toLocaleDateString(),
        modalidade: l.modalityId,
        exercicios: l.exercises.map(e => `${e.name}: ${e.weight}kg x ${e.actualReps}reps`)
      }));
      
      const prompt = `Analise meu progresso recente e dê 3 dicas práticas para melhorar: ${JSON.stringify(recentLogs)}`;
      const insight = await callGemini(prompt, "Você é um analista de performance fitness motivador. Seja conciso (max 300 caracteres).");
      setAiInsight(insight);
    } catch (error) {
      console.error(error);
      setAiInsight("Não consegui analisar agora. Continue treinando!");
    } finally {
      setAiLoading(false);
    }
  };

  const getDailyTip = async () => {
    if (aiInsight) return;
    setAiLoading(true);
    try {
      const tip = await callGemini("Dê uma dica de saúde ou fitness rápida para hoje para um coordenador de comunicação de 34 anos focado em fitness geral, que tem agenda cheia.");
      setAiInsight(tip);
    } finally {
      setAiLoading(false);
    }
  };

  const generateAiWeeklyPlan = async () => {
    setAiPlannerLoading(true);
    try {
      const prompt = `Atue como um personal trainer. O usuário é um coordenador de comunicação com agenda cheia e treina APENAS 1 a 2 vezes por semana.
      As modalidades disponíveis são: 'home' (Em Casa), 'gym' (Academia), 'run' (Corrida), 'footvolley' (Futevôlei).
      Crie um plano semanal distribuindo 2 dias de treino espaçados (ex: Terça e Quinta, ou Quarta e Sábado).
      Retorne APENAS um JSON onde as chaves são os índices dos dias (0=Domingo, 1=Segunda... 6=Sábado) e os valores são os IDs das modalidades escolhidas.
      Exemplo de saída desejada: {"2": "gym", "5": "run"}. NÃO inclua dias de descanso no JSON.`;
      
      const responseText = await callGemini(prompt, "Você responde apenas com JSON válido.");
      const cleanedText = responseText.replace(/```json|```/g, "").trim();
      const newPlan = JSON.parse(cleanedText);
      
      await saveWeeklyPlan(newPlan);
      setWeeklyPlan(newPlan); // Optmistic update
    } catch (err) {
      console.error("Erro ao gerar plano:", err);
      alert("Não foi possível gerar o plano. Tente novamente.");
    } finally {
      setAiPlannerLoading(false);
    }
  };

  const generateAiCalendarSuggestion = async () => {
    setAiCalendarLoading(true);
    try {
      const recent = workoutLogs.slice(0, 4).map(l => MODALITIES.find(m => m.id === l.modalityId)?.name || 'Treino').join(", ");
      const prompt = `O usuário treina 1-2x por semana. Histórico dos últimos 4 treinos: [${recent}]. 
      Considerando isso, sugira qual modalidade (Academia, Corrida, Em Casa ou Futevôlei) ele deve priorizar nesta semana para manter um condicionamento equilibrado. 
      Seja direto, motivador e mencione a profissão dele (coordenador de comunicação) sutilmente para incentivar a descompressão. Máximo 2 frases.`;
      
      const suggestion = await callGemini(prompt);
      setCalendarSuggestion(suggestion);
    } catch (err) {
      console.error(err);
      setCalendarSuggestion("Mantenha a constância! Qualquer treino hoje é melhor do que nenhum.");
    } finally {
      setAiCalendarLoading(false);
    }
  };

  const addBonusExercise = async () => {
    if (!currentWorkout) return;
    setBonusAiLoading(true);
    try {
      const mod = MODALITIES.find(m => m.id === currentWorkout.modalityId);
      const currentExNames = currentWorkout.exercises.map(e => e.name).join(', ');
      const prompt = `Atue como personal trainer de um coordenador de comunicação ocupado que precisa libertar stress. 
      Ele está no meio de um treino de ${mod?.name || 'Geral'} (Fase ${currentWorkout.phase || 1}). 
      Exercícios já feitos/planeados: ${currentExNames}.
      Sugira APENAS UM exercício BÓNUS final (ex: um 'finisher' divertido, um desafio rápido de core ou para aliviar a tensão do dia a dia).
      Retorne APENAS um JSON válido neste formato: {"name": "nome do exercicio", "sets": 2, "reps": "..."}`;
      
      const responseText = await callGemini(prompt, "Você responde apenas com JSON válido.");
      const cleanedText = responseText.replace(/```json|```/g, "").trim();
      const bonusEx = JSON.parse(cleanedText);
      
      setCurrentWorkout(prev => ({
        ...prev,
        exercises: [...prev.exercises, { ...bonusEx, weight: '', actualReps: '', completed: false, isBonus: true }]
      }));
    } catch (err) {
      console.error("Erro ao gerar exercício bónus:", err);
      // Fallback in case of failure so the user still gets a bonus
      setCurrentWorkout(prev => ({
        ...prev,
        exercises: [...prev.exercises, { name: 'Prancha Máxima (Até tremer!)', sets: 1, reps: 'Falha', weight: '', actualReps: '', completed: false, isBonus: true }]
      }));
    } finally {
      setBonusAiLoading(false);
    }
  };

  const swapExercise = async (index) => {
    if (!currentWorkout) return;
    setSwapLoadingIdx(index);
    try {
      const exToSwap = currentWorkout.exercises[index];
      const prompt = `Atue como personal trainer. O usuário precisa de uma alternativa para o exercício "${exToSwap.name}" porque não sabe fazer ou não tem o aparelho disponível. O objetivo é manter o mesmo grupo muscular e intenção (séries: ${exToSwap.sets}, reps: ${exToSwap.reps}).
      Retorne APENAS um JSON válido neste formato: {"name": "nome do exercicio alternativo", "sets": ${exToSwap.sets}, "reps": "${exToSwap.reps}"}`;
      
      const responseText = await callGemini(prompt, "Você responde apenas com JSON válido.");
      if (!responseText) {
        throw new Error("A IA retornou uma resposta vazia. Tente novamente.");
      }
      const cleanedText = responseText.replace(/```json|```/g, "").trim();
      const newEx = JSON.parse(cleanedText);
      
      const newExercises = [...currentWorkout.exercises];
      newExercises[index] = { 
        ...newExercises[index], 
        name: newEx.name, 
        sets: newEx.sets, 
        reps: newEx.reps 
      };
      setCurrentWorkout(prev => ({ ...prev, exercises: newExercises }));
    } catch (err) {
      console.error("Erro ao trocar exercício:", err);
      alert(`Não foi possível gerar uma alternativa agora. Erro: ${err.message}`);
    } finally {
      setSwapLoadingIdx(null);
    }
  };

  // --- Base Actions ---
  const saveProfile = async (e) => {
    e?.preventDefault();
    if (!user) return;
    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'profile');
    await setDoc(profileRef, onboardingData);
    setProfile(onboardingData);
    setActiveTab('dashboard'); // Also switch to dashboard if coming from an edit screen
  };

  const saveWeeklyPlan = async (newPlan) => {
    if (!user) return;
    const planRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'weeklyPlan');
    await setDoc(planRef, newPlan);
  };

  const startWorkout = (modalityId) => {
    const phase = getCurrentPhase(modalityId);
    const key = `${modalityId}_${phase}`;
    const baseExercises = customWorkouts[key] || PROGRAMS[modalityId][phase].exercises;
    
    setCurrentWorkout({
      modalityId,
      phase, // store the phase they ran this in
      date: new Date().toISOString(),
      exercises: baseExercises.map(ex => ({ ...ex, weight: '', actualReps: '', completed: false }))
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
    await addDoc(logsRef, {
      ...currentWorkout,
      effort: workoutEffort,
      timestamp: Date.now(),
      durationSeconds: workoutTimer,
      totalCompleted: currentWorkout.exercises.filter(e => e.completed).length
    });
    setCurrentWorkout(null);
    setWorkoutEffort(null);
    setAiInsight(""); // Clear insight to trigger new tip
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
    const today = new Date().getDay();
    const plannedForToday = weeklyPlan[today];

    const firstName = profile?.name || user?.displayName?.split(' ')[0] || 'Iury';
    const funnyPhrase = FUNNY_PHRASES[new Date().getDay() % FUNNY_PHRASES.length];

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

          <div className="mt-6 p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-md relative overflow-hidden">            <Sparkles className="absolute -right-2 -top-2 opacity-20 w-24 h-24 rotate-12" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Insight da IA</span>
              </div>
              {aiLoading && !aiInsight ? (
                <div className="h-10 flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              ) : (
                <p className="text-sm font-medium leading-relaxed italic">
                  {aiInsight || "Preparado para o treino? Clique aqui para uma dica rápida entre reuniões."}
                </p>
              )}
              {!aiInsight && !aiLoading && (
                <button 
                  onClick={getDailyTip}
                  className="mt-3 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
                >
                  ✨ Obter Dica
                </button>
              )}
            </div>
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
          <button onClick={() => setActiveTab('calendar')} className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col items-center gap-2 hover:border-blue-200 transition">
            <Calendar className="text-orange-500" />
            <span className="text-sm font-bold text-gray-700">Calendário</span>
          </button>
        </section>

        <section>
          <button onClick={() => {
            const expressPlan = [
              { name: 'Polichinelos / Burpees', sets: 3, reps: 'Máx em 40s', completed: false, weight: '', actualReps: '' },
              { name: 'Prancha Frontal', sets: 3, reps: '45s', completed: false, weight: '', actualReps: '' },
              { name: 'Agachamento Livre Rápido', sets: 3, reps: '20', completed: false, weight: '', actualReps: '' }
            ];
            setCurrentWorkout({ modalityId: 'express', phase: 1, date: new Date().toISOString(), exercises: expressPlan });
            setActiveTab('active-workout');
            setWorkoutTimer(0);
            setIsTimerRunning(true);
          }} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 p-5 rounded-2xl border border-orange-200 flex items-center justify-center gap-3 hover:opacity-90 transition text-white shadow-md mt-2">
            <Zap className="text-white" size={24} />
            <span className="font-bold text-lg">Treino Expresso SOS (15')</span>
          </button>
        </section>
      </div>
    );
  };

  const renderPlanner = () => {
    return (
      <div className="space-y-6">
        
        {/* Weekly Plan Settings */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold text-gray-800">Cronograma Semanal</h2>
            <button 
              onClick={generateAiWeeklyPlan}
              disabled={aiPlannerLoading}
              className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition disabled:opacity-50"
            >
              {aiPlannerLoading ? <Activity size={14} className="animate-spin" /> : <Wand2 size={14} />}
              Auto-Planejar IA
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">Agende os seus treinos da semana de acordo com a sua disponibilidade, ou peça à IA para distribuir 2 sessões otimizadas.</p>
          
          <div className="space-y-3">
            {WEEK_DAYS.map((day, index) => {
              const todayIdx = new Date().getDay();
              const startOfWeek = new Date();
              startOfWeek.setDate(startOfWeek.getDate() - todayIdx);
              const dateForDay = new Date(startOfWeek);
              dateForDay.setDate(startOfWeek.getDate() + index);
              const dateString = dateForDay.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const isToday = index === todayIdx;

              const selectedModality = MODALITIES.find(m => m.id === weeklyPlan[index]);

              return (
              <div key={day} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${isToday ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-md transform scale-[1.02]' : 'bg-white border border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-10 rounded-full ${isToday ? 'bg-blue-500' : selectedModality ? selectedModality.color.replace('bg-', 'bg-').replace('500', '400') : 'bg-gray-200'}`} />
                  <div className="flex flex-col">
                    <span className={`font-bold ${isToday ? 'text-blue-800' : 'text-gray-700'}`}>{day}</span>
                    <span className={`text-[10px] ${isToday ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>{dateString} {isToday && '(Hoje)'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedModality && (
                    <div className={`p-1.5 rounded-lg ${selectedModality.color} text-white shadow-sm`}>
                      {React.createElement(selectedModality.icon, { size: 14 })}
                    </div>
                  )}
                  <select 
                    className={`bg-white border-2 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all ${selectedModality ? 'border-blue-100 text-blue-700' : 'border-gray-100 text-gray-500'}`}
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
              </div>
              );
            })}
          </div>
        </div>

        {/* 3-Month Roadmap */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-gray-800">Progresso dos Programas (3 Meses)</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">O sistema avança o seu mês de treino automaticamente a cada 4 sessões concluídas por modalidade.</p>
          
          <div className="space-y-8">
            {['gym', 'home', 'run'].map(modId => {
              const mod = MODALITIES.find(m => m.id === modId);
              const currentPhase = getCurrentPhase(modId);
              const completedSessions = workoutLogs.filter(l => l.modalityId === modId).length;
              
              return (
                <div key={modId} className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-md ${mod.color} text-white`}>
                      {React.createElement(mod.icon, { size: 14 })}
                    </div>
                    <span className="font-bold text-gray-800 text-sm uppercase">{mod.name}</span>
                    <span className="text-xs text-gray-400 font-medium ml-auto">{completedSessions} treinos feitos</span>
                  </div>

                  <div className="flex justify-between relative z-10">
                    {[1, 2, 3].map(phase => {
                      const isPast = phase < currentPhase;
                      const isCurrent = phase === currentPhase;
                      const isFuture = phase > currentPhase;
                      
                      return (
                        <div key={phase} className="flex flex-col items-center gap-2 w-1/3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                            ${isPast ? 'bg-green-500 border-green-500 text-white' : ''}
                            ${isCurrent ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-110' : ''}
                            ${isFuture ? 'bg-white border-gray-200 text-gray-300' : ''}
                          `}>
                            {isPast ? <CheckCircle2 size={16} /> : isFuture ? <Lock size={14} /> : <span className="font-bold text-sm">{phase}</span>}
                          </div>
                          <span className={`text-[10px] font-bold uppercase text-center w-full px-1 ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
                            Mês {phase}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Progress Line Behind */}
                  <div className="absolute top-11 left-[16%] right-[16%] h-1 bg-gray-100 -z-0">
                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${((currentPhase - 1) / 2) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Customization */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={64} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">✨ Variar Exercícios com IA</h3>
          <p className="text-sm text-gray-500 mb-4">Gere novos exercícios mantendo a estrutura lógica do seu Mês Atual (para não enjoar da rotina).</p>
          <div className="grid grid-cols-2 gap-3">
            {['gym', 'home', 'run'].map(modId => {
              const m = MODALITIES.find(m => m.id === modId);
              return (
                <button
                  key={m.id}
                  disabled={aiLoading}
                  onClick={() => generateAiWorkout(m.id)}
                  className="flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition text-sm font-bold text-blue-700 disabled:opacity-50"
                >
                  {aiLoading ? <Activity size={16} className="animate-spin" /> : <BrainCircuit size={16} />}
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWorkoutLogger = () => {
    if (!currentWorkout) return null;
    const mod = MODALITIES.find(m => m.id === currentWorkout.modalityId);

    const updateEx = (index, field, value) => {
      const newExercises = [...currentWorkout.exercises];
      newExercises[index] = { ...newExercises[index], [field]: value };
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{ex.name}</h3>
                    <button 
                      onClick={() => swapExercise(idx)}
                      disabled={swapLoadingIdx === idx || ex.completed}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                      title="Trocar exercício por outro semelhante"
                    >
                      <RefreshCw size={16} className={swapLoadingIdx === idx ? 'animate-spin text-blue-500' : ''} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">
                      {ex.sets} séries
                    </span>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">
                      {ex.reps}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleComplete(idx)}
                  className={`p-3 rounded-2xl transition-all flex-shrink-0 ${ex.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 active:scale-90'}`}
                >
                  <CheckCircle2 size={28} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Carga (kg)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full bg-transparent p-0 text-xl font-bold text-gray-800 border-none focus:ring-0 placeholder:text-gray-300"
                    value={ex.weight}
                    onChange={(e) => updateEx(idx, 'weight', e.target.value)}
                  />
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Reps Feitas</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full bg-transparent p-0 text-xl font-bold text-gray-800 border-none focus:ring-0 placeholder:text-gray-300"
                    value={ex.actualReps}
                    onChange={(e) => updateEx(idx, 'actualReps', e.target.value)}
                  />
                </div>
              </div>
              {ex.isBonus && (
                <div className="mt-3 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1.5 rounded-lg uppercase text-center flex items-center justify-center gap-1.5">
                  <Sparkles size={14} /> Desafio Bónus da IA
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6 mb-8">
          <button
            onClick={addBonusExercise}
            disabled={bonusAiLoading}
            className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-100 transition disabled:opacity-50 shadow-sm active:scale-95"
          >
            {bonusAiLoading ? <Activity size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {bonusAiLoading ? 'A preparar o desafio...' : 'Pedir Desafio Bónus à IA'}
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
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Evolução</h2>
          <button 
            onClick={analyzeProgress}
            disabled={aiLoading || workoutLogs.length === 0}
            className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 shadow-md"
          >
            {aiLoading ? <Activity size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
            ✨ Analisar com IA
          </button>
        </div>

        {aiInsight && activeTab === 'history' && (
          <div className="bg-indigo-50 border-2 border-indigo-100 p-5 rounded-3xl text-indigo-900 shadow-inner">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="text-indigo-600" size={20} />
              <span className="font-bold text-sm uppercase tracking-wide">Análise Tática</span>
            </div>
            <p className="text-sm italic leading-relaxed">{aiInsight}</p>
          </div>
        )}
        
        {workoutLogs.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center">
            <p className="text-gray-400">Nenhum registro encontrado. Inicie seu primeiro treino!</p>
          </div>
        ) : (
          workoutLogs.map((log) => (
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
                  {log.durationSeconds !== undefined && (
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                      <Timer size={10} /> {Math.floor(log.durationSeconds / 60)} min
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mt-2">
                {log.exercises.map((ex, i) => (
                  <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600 font-medium pr-4 line-clamp-1">{ex.name}</span>
                    <span className="font-black text-blue-600 whitespace-nowrap bg-blue-50 px-2 py-1 rounded">
                      {ex.weight ? `${ex.weight}kg` : 'BW'} × {ex.actualReps || '0'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderCalendarView = () => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    const getLogsForDay = (day) => {
      return workoutLogs.filter(log => {
        const d = new Date(log.timestamp);
        return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
      });
    };

    return (
      <div className="space-y-6">
        
        {/* AI Suggestion Card */}
        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <Sparkles className="absolute -right-4 -top-4 opacity-10 w-32 h-32 rotate-12" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit size={20} className="text-indigo-200" />
                <h3 className="font-bold text-sm uppercase tracking-wide text-indigo-100">O que treinar a seguir?</h3>
              </div>
              <button 
                onClick={generateAiCalendarSuggestion}
                disabled={aiCalendarLoading}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition disabled:opacity-50"
              >
                <Wand2 size={16} />
              </button>
            </div>
            
            {aiCalendarLoading ? (
               <div className="h-10 flex items-center gap-2">
                 <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                 <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.4s]" />
               </div>
            ) : (
              <p className="text-sm font-medium leading-relaxed">
                {calendarSuggestion || "Toque na varinha mágica para a IA analisar o seu histórico recente e sugerir o próximo passo."}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold capitalize">{monthName}</h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, index) => (
              <span key={`day-${index}`} className="text-[10px] font-black text-gray-300 uppercase">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const logs = getLogsForDay(day);
              const hasWorkout = logs.length > 0;
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();

              const dayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay();
              const plannedModalityId = weeklyPlan[dayOfWeek];
              const isPlannedForDay = !!plannedModalityId && !hasWorkout;
              const plannedModality = MODALITIES.find(m => m.id === plannedModalityId);

              return (
                <div 
                  key={day} 
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl relative transition-all ${isToday ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-110 z-10 border border-blue-400' : hasWorkout ? 'bg-blue-50 text-blue-800 border border-blue-100 shadow-sm' : isPlannedForDay ? `bg-white border-2 border-dashed ${plannedModality ? plannedModality.color.replace('bg-', 'border-').replace('500', '200') : 'border-gray-200'} text-gray-700` : 'bg-gray-50 text-gray-400 border border-transparent'}`}
                >
                  <span className="text-xs font-bold">{day}</span>
                  {hasWorkout && !isToday && (
                    <div className="flex gap-1 mt-1">
                      {logs.map((l, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${MODALITIES.find(m => m.id === l.modalityId)?.color || 'bg-yellow-500'} shadow-sm`} />
                      ))}
                    </div>
                  )}
                  {isPlannedForDay && !isToday && (
                    <div className="flex gap-1 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full border-2 ${plannedModality ? plannedModality.color.replace('bg-', 'border-') : 'border-gray-300'}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl text-white shadow-xl">
          <p className="opacity-80 text-sm font-bold uppercase mb-4">Métrica de Constância</p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-black">{workoutLogs.filter(l => new Date(l.timestamp).getMonth() === currentMonth.getMonth()).length}</span>
            <span className="opacity-60 text-lg mb-1 font-bold">/ 8 treinos</span>
          </div>
          <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min(100, (workoutLogs.filter(l => new Date(l.timestamp).getMonth() === currentMonth.getMonth()).length / 8) * 100)}%` }}
            />
          </div>
        </div>
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
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Personal.ai</h1>
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
    <div className="min-h-screen bg-[#FDFDFF] text-gray-900 font-sans max-w-md mx-auto relative">
      <main className="p-4 pt-8 pb-32">
        {!profileLoading && !profile ? (
          renderOnboarding()
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'planner' && renderPlanner()}
            {activeTab === 'active-workout' && renderWorkoutLogger()}
            {activeTab === 'calendar' && renderCalendarView()}
            {activeTab === 'history' && renderHistory()}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      {activeTab !== 'active-workout' && profile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 flex justify-around py-4 z-50 max-w-md mx-auto rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.06)] px-4">
          {[
            { id: 'dashboard', icon: Activity, label: 'Resumo' },
            { id: 'planner', icon: Settings, label: 'Plano' },
            { id: 'calendar', icon: Calendar, label: 'Agenda' },
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