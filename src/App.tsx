import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, 
  Pizza, 
  User, 
  Battery, 
  Activity, 
  Search, 
  Navigation, 
  Cpu, 
  Camera,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface RobotStatus {
  mission: string;
  battery: number;
  isBalancing: boolean;
  lastDetection: string;
  isSearching: boolean;
}

export default function App() {
  const [status, setStatus] = useState<RobotStatus>({
    mission: "None",
    battery: 85,
    isBalancing: true,
    lastDetection: "None",
    isSearching: false
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const speak = (text: string) => {
    if (!voiceEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.8; // Robotic voice
    window.speechSynthesis.speak(utterance);
  };

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 10));
  };

  const analyzeScene = async () => {
    setIsAnalyzing(true);
    addLog("Gemini: Analyzing scene context...");
    try {
      const res = await fetch('/api/analyze-scene', { method: 'POST', body: JSON.stringify({}) });
      const data = await res.json();
      addLog(`Gemini: ${data.description}`);
      speak(data.description);
    } catch (e) {
      addLog("Gemini: Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error("Failed to fetch status", e);
    }
  };

  const setMission = async (mission: string) => {
    try {
      const res = await fetch('/api/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mission })
      });
      const data = await res.json();
      if (data.success) {
        addLog(`Mission set: ${mission}`);
        if (mission !== "None") {
          speak(`Initiating mission: ${mission}. Navigating to landmark.`);
        } else {
          speak("Mission aborted. Returning to idle state.");
        }
        fetchStatus();
      }
    } catch (e) {
      addLog(`Error setting mission: ${mission}`);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate VLM reasoning logs
    const mockVLM = setInterval(() => {
      if (status.mission !== "None") {
        const thoughts = [
          `VLM: Analyzing triple-camera stream...`,
          `eGPU: Searching for ${status.mission} in front view...`,
          `VLM: Detected potential landmark at [450, 210]`,
          `Body: Adjusting lateral control (PID: 0.005)`,
          `VLM: Confidence 0.89 for ${status.mission}`
        ];
        addLog(thoughts[Math.floor(Math.random() * thoughts.length)]);
      }
    }, 3000);
    return () => clearInterval(mockVLM);
  }, [status.mission]);

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase italic">
            Automated <span className="text-blue-500">Office</span> Assistant
          </h1>
          <p className="text-xs font-mono text-white/50 uppercase tracking-widest mt-1">
            Comma Body v2 // Comma Four // eGPU VLM
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`flex items-center gap-2 px-4 py-2 glass rounded-full transition-all ${voiceEnabled ? 'text-blue-500' : 'text-white/30'}`}
          >
            <Activity className="w-4 h-4" />
            <span className="font-mono text-sm uppercase">{voiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
            <Battery className={`w-4 h-4 ${status.battery < 20 ? 'text-red-500' : 'text-green-500'}`} />
            <span className="font-mono text-sm">{status.battery}%</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Camera Feed & Status */}
        <div className="lg:col-span-8 space-y-8">
          {/* Mock Camera Feed */}
          <div className="relative aspect-video glass rounded-3xl overflow-hidden border-2 border-white/10 group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            
            {/* Camera Views Grid */}
            <div className="absolute inset-0 grid grid-cols-3 gap-1 opacity-40">
              <div className="bg-white/5 flex items-center justify-center border-r border-white/10">
                <span className="text-[10px] font-mono uppercase rotate-90">Wide Left</span>
              </div>
              <div className="bg-white/5 flex items-center justify-center border-r border-white/10">
                <span className="text-[10px] font-mono uppercase">Front Main</span>
              </div>
              <div className="bg-white/5 flex items-center justify-center">
                <span className="text-[10px] font-mono uppercase -rotate-90">Wide Right</span>
              </div>
            </div>

            {/* Target Overlay */}
            {status.mission !== "None" && !status.isSearching && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <div className="w-32 h-32 border-2 border-blue-500 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                </div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase whitespace-nowrap">
                  {status.mission} Detected
                </div>
              </motion.div>
            )}

            {/* Searching Overlay */}
            {status.isSearching && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-orange-500/10">
                <div className="text-center">
                  <Search className="w-12 h-12 text-orange-500 mx-auto animate-bounce" />
                  <p className="text-orange-500 font-mono text-sm uppercase mt-4 tracking-widest">
                    Searching for Landmark...
                  </p>
                </div>
              </div>
            )}

            <div className="absolute bottom-6 left-6 z-20 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-tighter">Live Stream // 1080p // 20fps</span>
              </div>
              <p className="text-xs text-white/50 font-mono uppercase tracking-tighter">
                Lat: 0.00 | Lon: 0.00 | Alt: 0.00
              </p>
            </div>
            
            <div className="absolute top-6 right-6 z-20 flex gap-2">
              <button 
                onClick={analyzeScene}
                disabled={isAnalyzing}
                className="p-3 glass rounded-xl hover:bg-white/10 transition-all group"
                title="Analyze Scene with Gemini"
              >
                <Cpu className={`w-5 h-5 ${isAnalyzing ? 'animate-spin text-orange-500' : 'text-white/50 group-hover:text-orange-500'}`} />
              </button>
              <div className="p-3 glass rounded-xl">
                <Camera className="w-5 h-5 text-white/30" />
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass p-6 rounded-2xl">
              <p className="text-[10px] font-mono text-white/40 uppercase mb-2">Current Mission</p>
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-blue-500" />
                <span className="text-xl font-bold uppercase tracking-tight">{status.mission}</span>
              </div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <p className="text-[10px] font-mono text-white/40 uppercase mb-2">VLM Reasoning</p>
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-orange-500" />
                <span className="text-xl font-bold uppercase tracking-tight">eGPU Active</span>
              </div>
            </div>
            <div className="glass p-6 rounded-2xl">
              <p className="text-[10px] font-mono text-white/40 uppercase mb-2">Hardware Health</p>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-xl font-bold uppercase tracking-tight">Nominal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mission Selector & Logs */}
        <div className="lg:col-span-4 space-y-8">
          {/* Mission Selector */}
          <section className="glass p-8 rounded-3xl glow-blue">
            <h2 className="text-xl font-bold uppercase italic mb-6 flex items-center gap-2">
              <Navigation className="w-5 h-5" /> Mission Selector
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setMission("Pizza")}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${status.mission === "Pizza" ? 'bg-blue-500 text-black' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <Pizza className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-tight">Go to Pizza</span>
                </div>
                <span className="text-[10px] font-mono opacity-50">01</span>
              </button>
              <button 
                onClick={() => setMission("Judge")}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${status.mission === "Judge" ? 'bg-blue-500 text-black' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-tight">Find Judge</span>
                </div>
                <span className="text-[10px] font-mono opacity-50">02</span>
              </button>
              <button 
                onClick={() => setMission("Coffee Machine")}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${status.mission === "Coffee Machine" ? 'bg-blue-500 text-black' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <Coffee className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-tight">Coffee Run</span>
                </div>
                <span className="text-[10px] font-mono opacity-50">03</span>
              </button>
              <button 
                onClick={() => setMission("None")}
                className="flex items-center justify-center p-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all font-bold uppercase tracking-tight mt-4"
              >
                Abort Mission
              </button>
            </div>
          </section>

          {/* AI Logs */}
          <section className="glass p-8 rounded-3xl h-[400px] flex flex-col">
            <h2 className="text-xl font-bold uppercase italic mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" /> System Logs
            </h2>
            <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 pr-2">
              <AnimatePresence initial={false}>
                {logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-2 border-l border-white/10 bg-white/5"
                  >
                    <span className="text-white/30 mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
              {logs.length === 0 && (
                <p className="text-white/20 italic">No logs yet. Select a mission to begin.</p>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-white/30 uppercase tracking-widest">
        <p>© 2026 Comma Hack 6 // Team Office Assistant</p>
        <div className="flex gap-8">
          <p>AGNOS 9.2.1</p>
          <p>Cereal v0.1.0</p>
          <p>BodyJim v1.4</p>
        </div>
      </footer>
    </div>
  );
}
