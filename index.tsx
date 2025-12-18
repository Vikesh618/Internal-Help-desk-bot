import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Types & Constants ---
type Role = 'user' | 'admin';
type ViewState = 'landing' | 'login' | 'authenticated';

interface Ticket {
  id: string;
  userName: string;
  category: 'IT' | 'HR' | 'Admin';
  description: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'Open' | 'Closed';
  createdAt: string;
  replies: string[];
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

const STORAGE_KEYS = {
  TICKETS: 'nexus_tickets_v3',
  AUTH: 'nexus_auth_v3'
};

const MockDB = {
  getTickets: (): Ticket[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
    return data ? JSON.parse(data) : [];
  },
  saveTicket: (ticket: Ticket) => {
    const tickets = MockDB.getTickets();
    tickets.unshift(ticket);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  },
  updateTicketStatus: (id: string, status: 'Open' | 'Closed') => {
    const tickets = MockDB.getTickets();
    const updated = tickets.map(t => t.id === id ? { ...t, status } : t);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));
  }
};

// --- Icons ---
const ItemIcon = ({ d }: { d: string }) => (
  <svg className="w-4 h-4 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={d} />
  </svg>
);

const RobotIcon = ({ className = "w-16 h-16 text-white" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

// --- Components ---

const LandingPage = ({ onGoToLogin }: { onGoToLogin: () => void }) => {
  const scrollToAbout = () => {
    document.getElementById('about-features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Landing Navbar */}
      <nav className="fixed top-0 w-full h-24 glass-panel z-50 flex items-center justify-between px-8 md:px-20 border-b border-white/40">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">A</div>
          <div className="leading-none">
            <span className="text-xl font-extrabold tracking-tight text-emerald-600 block">AI Chat Bot</span>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Nexus Suite</span>
          </div>
        </div>
        <div className="flex items-center space-x-8">
          <div className="hidden md:flex items-center space-x-10 text-sm font-bold text-slate-500">
             <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-emerald-600 font-extrabold">Home</button>
             <button onClick={scrollToAbout} className="hover:text-emerald-600 transition-colors font-extrabold">About</button>
          </div>
          <button 
            onClick={onGoToLogin}
            className="px-10 py-3.5 bg-[#51e28d] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-[#3ecb78] hover:scale-105 transition-all"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-52 pb-24 px-8 md:px-20 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-1/2 space-y-8 animate-fade-scale text-center md:text-left">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100">
            Enterprise Intelligence v4.0
          </div>
          <h1 className="text-6xl md:text-8xl font-[900] text-slate-900 leading-[0.95] tracking-tighter">
            The Future of <br/> <span className="text-emerald-500">Service Ops.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-lg font-medium leading-relaxed">
            Eliminate support bottlenecks with the most advanced AI workplace assistant ever created. Real-time diagnostics for IT, HR, and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            <button 
              onClick={onGoToLogin}
              className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl hover:bg-black hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              Get Started Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center relative animate-fade-scale" style={{ animationDelay: '0.2s' }}>
          <div className="relative w-80 h-80 md:w-[450px] md:h-[450px]">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[5rem] flex items-center justify-center shadow-[0_60px_120px_-20px_rgba(81,226,141,0.5)] transform rotate-12 hover:rotate-0 transition-all duration-1000 group">
              <div className="transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <RobotIcon className="w-52 h-52 text-white drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items / About Section */}
      <section id="about-features" className="px-8 md:px-20 py-32 bg-white/50 border-t border-slate-100 scroll-mt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
           <div className="space-y-6 group">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">01</div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Instant Diagnostics</h3>
              <p className="text-slate-500 font-medium leading-relaxed">No more waiting for tickets. Get immediate technical help for Wi-Fi, systems, and hardware through our neural assistance engine.</p>
           </div>
           <div className="space-y-6 group">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">02</div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">HR Intelligence</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Policy queries, leave management, and payroll insights delivered through natural conversation, personalized to your role.</p>
           </div>
           <div className="space-y-6 group">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">03</div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Secure & Private</h3>
              <p className="text-slate-500 font-medium leading-relaxed">Enterprise-grade security layer ensures all internal data and requests remain strictly confidential and encrypted at rest.</p>
           </div>
        </div>
      </section>
    </div>
  );
};

const LoginPage = ({ onLogin, onBack }: { onLogin: (role: Role, name: string) => void, onBack: () => void }) => {
  const [role, setRole] = useState<Role>('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'user' && username === 'user' && password === 'user123') {
      onLogin('user', 'Alex Johnson');
    } else if (role === 'admin' && username === 'admin' && password === 'admin123') {
      onLogin('admin', 'Sarah Miller');
    } else {
      setError('Authentication failed. Check credentials and try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent relative">
      <button 
        onClick={onBack}
        className="absolute top-10 left-10 flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-black uppercase tracking-widest text-xs transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Home
      </button>

      <div className="tilt-card glass-panel w-full max-w-lg p-12 rounded-[3.5rem] shadow-2xl animate-fade-scale border border-white/80">
        <div className="flex justify-center mb-10">
           <div className="w-28 h-28 bg-[#51e28d] rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(81,226,141,0.3)] transform transition-transform duration-700 hover:rotate-6 hover:scale-110">
              <RobotIcon />
           </div>
        </div>
        
        <h1 className="text-5xl font-[900] text-center text-slate-900 mb-2 tracking-tight">AI Chat Bot</h1>
        <p className="text-slate-500 text-center mb-12 font-medium text-lg max-w-[280px] mx-auto leading-tight opacity-80">Authenticate to access the enterprise service desk.</p>

        <div className="flex mb-10 bg-slate-100/50 p-2 rounded-2xl border border-slate-200/40">
          <button 
            type="button"
            onClick={() => setRole('user')}
            className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${role === 'user' ? 'bg-white shadow-xl text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Employee
          </button>
          <button 
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${role === 'admin' ? 'bg-white shadow-xl text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <input 
              type="text" placeholder="Corporate ID" required
              className="w-full pl-14 pr-6 py-5 rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <input 
              type="password" placeholder="Credential" required
              className="w-full pl-14 pr-6 py-5 rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 outline-none transition-all font-semibold text-slate-700 placeholder:text-slate-300"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-fade-in">{error}</p>}
          
          <button type="submit" className="w-full bg-[#51e28d] text-white font-[900] py-5 rounded-2xl hover:bg-[#3ecb78] shadow-[0_20px_40px_rgba(81,226,141,0.25)] transition-all transform hover:-translate-y-1 active:translate-y-0 uppercase tracking-[0.2em] text-xs">
            Authenticate & Proceed
          </button>
        </form>
      </div>
    </div>
  );
};

const UserDashboard = ({ userName, onLogout }: { userName: string, onLogout: () => void }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: `Systems Online. Welcome, Associate ${userName.split(' ')[0]}. My diagnostic engine is ready for your IT, HR, or Administrative queries.` }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [initialTicketDesc, setInitialTicketDesc] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const userText = inputText;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: `You are Nexus AI Assistant. 
          Provide technical, professional, and clear advice.
          Escalate to "Raising a Support Incident" if the issue requires manual intervention.
          Use bullet points for steps.`,
        }
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Diagnostic failed. Please escalate." }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "Service Tunnel Error. Please log a manual ticket." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const supportCategories = [
    {
      title: 'IT Support',
      iconBg: 'bg-emerald-600',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      items: [
        { label: 'Wi-Fi Connectivity Issues', icon: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' },
        { label: 'Password Reset', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { label: 'Email Setup', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { label: 'System Issues', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
        { label: 'Software Installation', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
      ]
    },
    {
      title: 'HR Help',
      iconBg: 'bg-emerald-500',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z',
      featured: true,
      items: [
        { label: 'Leave Management', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { label: 'Payroll Queries', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
        { label: 'ID Card Issues', icon: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' },
        { label: 'Policy Information', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { label: 'Benefits Inquiry', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      ]
    },
    {
      title: 'Admin Queries',
      iconBg: 'bg-teal-600',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5',
      items: [
        { label: 'Office Facilities', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' },
        { label: 'Access & Permissions', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
        { label: 'Directory & Contacts', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z' },
        { label: 'Location Info', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
        { label: 'General Inquiries', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 5-8-5' },
      ]
    }
  ];

  const triggerUnresolvedTicket = () => {
    const lastUserQuery = [...messages].reverse().find(m => m.role === 'user')?.text || "";
    setInitialTicketDesc(`Issue Not Resolved via Chat: ${lastUserQuery}`);
    setShowTicketModal(true);
  };

  const scrollToCategories = () => {
    document.getElementById('support-categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Dashboard Navbar */}
      <nav className="fixed top-0 w-full h-24 glass-panel z-40 flex items-center justify-between px-8 md:px-20 border-b border-white/40">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">A</div>
          <div className="leading-none">
            <span className="text-xl font-extrabold tracking-tight text-emerald-600 block">AI Chat Bot</span>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Nexus Suite</span>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-500">
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-emerald-600 px-4 py-2 bg-emerald-50 rounded-lg transition-all">Home</button>
          <button onClick={scrollToCategories} className="hover:text-emerald-600 transition-colors">Departments</button>
          <button onClick={() => setIsChatOpen(true)} className="hover:text-emerald-600 transition-colors">Chatbot</button>
          <button onClick={onLogout} className="ml-4 px-6 py-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all font-extrabold text-slate-700 shadow-sm">Logout</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-52 pb-16 px-8 md:px-20 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-1/2 space-y-10 animate-fade-scale text-center md:text-left">
          <div className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100 mb-2">
            AI-Powered Operations
          </div>
          <h1 className="text-5xl md:text-7xl font-[900] text-slate-900 leading-[1.1] tracking-tight">
            Workplace <br/> <span className="text-emerald-500">AI Chat Bot</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-lg font-medium leading-relaxed">
            Smarter support for enterprise associates — Wi-Fi, HR policies, IT troubleshooting & more. Smooth, secure, and fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="px-10 py-5 bg-[#51e28d] text-white rounded-2xl font-black shadow-2xl shadow-emerald-200 hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              Ask the AI Bot
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center relative animate-fade-scale" style={{ animationDelay: '0.2s' }}>
          <div className="relative w-80 h-80 md:w-96 md:h-96">
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[4rem] flex items-center justify-center shadow-[0_50px_100px_-20px_rgba(81,226,141,0.4)] transform rotate-12 hover:rotate-0 transition-all duration-1000 group">
              <div className="transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <RobotIcon className="w-40 h-40 text-white drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Categories Section */}
      <section id="support-categories" className="px-8 md:px-20 py-24 bg-slate-50/30 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-[900] text-slate-900 text-center mb-16 tracking-tight">Service Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportCategories.map((cat, idx) => (
              <div 
                key={idx} 
                className={`tilt-card bg-white p-10 rounded-[2.5rem] border-2 transition-all cursor-default ${cat.featured ? 'border-emerald-400 shadow-xl' : 'border-slate-100 shadow-sm hover:border-emerald-300 hover:shadow-lg'}`}
              >
                <div className={`w-16 h-16 ${cat.iconBg} rounded-2xl flex items-center justify-center mb-8 shadow-lg`}>
                   <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cat.icon} />
                   </svg>
                </div>
                <h3 className="text-2xl font-black mb-8 text-slate-900">{cat.title}</h3>
                <ul className="space-y-5">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-start text-slate-500 font-semibold group cursor-pointer hover:text-emerald-600 transition-colors">
                      <ItemIcon d={item.icon} />
                      <span className="text-sm">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Side Chat Console */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[500px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-700 cubic-bezier(0.23, 1, 0.32, 1) ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <header className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-emerald-50/30">
            <div>
              <h3 className="text-2xl font-black text-emerald-600 tracking-tight">AI Diagnostic Console</h3>
              <div className="flex items-center text-[11px] uppercase tracking-widest text-emerald-600 font-black mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 status-glow animate-pulse"></span>
                Secure Operational
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-200">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto p-10 space-y-2 no-scrollbar bg-white">
            {messages.map((m, i) => (
              <div key={i} className="flex flex-col">
                <div className={`chat-bubble ${m.role === 'user' ? 'user' : 'ai'}`}>
                  {m.text}
                </div>
                {m.role === 'ai' && i > 0 && (
                  <button 
                    onClick={triggerUnresolvedTicket}
                    className="self-start text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-800 mb-4 ml-4 tracking-widest transition-colors flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Not resolved? Escalation Registry
                  </button>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold animate-pulse p-4">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                <span>Bot is processing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-10 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md">
            <div className="flex items-center space-x-4 bg-white p-3 rounded-[2rem] border border-slate-200 shadow-xl focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
              <input 
                type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                placeholder="How can I help you today?"
                className="flex-1 px-5 py-3 bg-transparent outline-none text-[0.95rem] font-medium text-slate-700"
              />
              <button disabled={isLoading} className="p-4 bg-[#51e28d] text-white rounded-2xl hover:bg-[#3ecb78] transition-all transform active:scale-95 shadow-lg shadow-emerald-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <button 
                type="button"
                onClick={() => {
                  setInitialTicketDesc("");
                  setShowTicketModal(true);
                }}
                className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:underline"
              >
                Log Incident Manually
              </button>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Powered by AI Chat Bot v3.4</span>
            </div>
          </form>
        </div>
      </div>

      {/* Modern Floating Action Button */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-12 right-12 w-20 h-20 bg-[#51e28d] text-white rounded-[2.5rem] shadow-[0_20px_40px_rgba(81,226,141,0.4)] flex items-center justify-center z-40 group hover:scale-110 transition-transform duration-300"
        >
          <div className="relative">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 border-4 border-white rounded-full animate-bounce"></span>
          </div>
          <span className="absolute right-24 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest whitespace-nowrap">Open AI Chat Bot</span>
        </button>
      )}

      {/* Ticket Creation Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-4xl overflow-hidden animate-fade-scale">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Raise Service Incident</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Formal Support Request</p>
              </div>
              <button onClick={() => setShowTicketModal(false)} className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-800 transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              MockDB.saveTicket({
                id: `INC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                userName: userName,
                category: d.get('cat') as any || 'IT',
                description: d.get('desc') as string,
                priority: d.get('pri') as any || 'P3',
                status: 'Open',
                createdAt: new Date().toLocaleString(),
                replies: []
              });
              setShowTicketModal(false);
            }} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Priority Level</label>
                  <select name="pri" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm">
                    <option value="P4">P4 - Routine</option>
                    <option value="P3">P3 - Standard</option>
                    <option value="P2">P2 - Urgent</option>
                    <option value="P1">P1 - Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Service Domain</label>
                  <select name="cat" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold text-sm">
                    <option value="IT">IT Infrastructure</option>
                    <option value="HR">Human Capital</option>
                    <option value="Admin">Admin Ops</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Detailed Description</label>
                <textarea 
                  name="desc" required 
                  defaultValue={initialTicketDesc}
                  placeholder="Provide technical specifics and impact analysis..." 
                  className="w-full h-44 p-6 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none font-medium text-sm leading-relaxed"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-[#51e28d] text-white font-black py-5 rounded-2xl hover:bg-[#3ecb78] shadow-2xl shadow-emerald-200 transition-all text-sm uppercase tracking-widest">
                Submit Support Incident
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Professional Footer */}
      <footer className="py-20 px-8 md:px-20 text-center border-t border-slate-100">
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">© 2025 AI Chat Bot Global Solutions</p>
      </footer>
    </div>
  );
};

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const refreshTickets = () => setTickets(MockDB.getTickets());

  useEffect(() => {
    refreshTickets();
    const i = setInterval(refreshTickets, 5000);
    return () => clearInterval(i);
  }, []);

  const handleCloseTicket = (id: string) => {
    MockDB.updateTicketStatus(id, 'Closed');
    refreshTickets();
    if (selectedTicket?.id === id) {
      setSelectedTicket(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-10 md:p-20">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-20">
          <div>
            <div className="inline-flex items-center space-x-2 text-emerald-600 mb-4">
              <span className="w-3 h-3 bg-emerald-600 rounded-full animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Support Command</span>
            </div>
            <h1 className="text-5xl font-[900] text-slate-900 tracking-tight">Support Metrics</h1>
            <p className="text-slate-500 font-medium text-lg mt-2">Managing the future of enterprise support.</p>
          </div>
          <button onClick={onLogout} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs text-slate-600 hover:bg-slate-50 shadow-sm transition-all uppercase tracking-widest">Terminate Session</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          {[
            { label: 'Active Queue', val: tickets.filter(t => t.status === 'Open').length, color: 'text-emerald-600' },
            { label: 'Pending SLA', val: tickets.filter(t => t.priority === 'P1').length, color: 'text-orange-500' },
            { label: 'SLA Achievement', val: '99.2%', color: 'text-teal-600' }
          ].map((s, idx) => (
            <div key={idx} className="glass-panel p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all border-white">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
              <h3 className={`text-5xl font-black ${s.color}`}>{s.val}</h3>
            </div>
          ))}
        </div>

        <div className="glass-panel rounded-[3rem] shadow-2xl overflow-hidden border-white">
          <div className="p-10 border-b border-slate-100 bg-white/40 flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Incident Registry</h2>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  <th className="px-10 py-6">UID</th>
                  <th className="px-10 py-6">Domain</th>
                  <th className="px-10 py-6">Associate</th>
                  <th className="px-10 py-6">Lifecycle</th>
                  <th className="px-10 py-6">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {tickets.map(t => (
                  <tr key={t.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-10 py-8 font-mono text-[11px] text-slate-400 font-bold">{t.id}</td>
                    <td className="px-10 py-8">
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tight">{t.category}</span>
                    </td>
                    <td className="px-10 py-8 font-extrabold text-slate-800 text-sm">{t.userName}</td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex items-center space-x-2 ${t.status === 'Open' ? 'text-orange-600' : 'text-emerald-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'Open' ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                        <span className="text-[11px] font-black uppercase tracking-widest">{t.status}</span>
                      </span>
                    </td>
                    <td className="px-10 py-8">
                       <button 
                        onClick={() => setSelectedTicket(t)}
                        className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:underline"
                       >
                         Review
                       </button>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr><td colSpan={5} className="px-10 py-32 text-center text-slate-300 font-black uppercase tracking-[0.4em] text-xs">Registry Empty</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ticket Review Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-4xl overflow-hidden animate-fade-scale">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Incident Review: {selectedTicket.id}</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">Status: {selectedTicket.status}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-800 transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="bg-slate-50 p-6 rounded-2xl">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Issue Details</label>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">{selectedTicket.description}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Priority</label>
                  <p className="text-sm font-black text-slate-900">{selectedTicket.priority}</p>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Associate</label>
                  <p className="text-sm font-black text-slate-900">{selectedTicket.userName}</p>
                </div>
              </div>

              {selectedTicket.status === 'Open' && (
                <button 
                  onClick={() => handleCloseTicket(selectedTicket.id)}
                  className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl hover:bg-emerald-700 shadow-2xl shadow-emerald-200 transition-all text-sm uppercase tracking-widest"
                >
                  Mark as Resolved
                </button>
              )}
              {selectedTicket.status === 'Closed' && (
                <div className="w-full bg-slate-100 text-slate-400 font-black py-5 rounded-2xl text-center text-sm uppercase tracking-widest cursor-not-allowed">
                  Closed Registry
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [viewState, setViewState] = useState<ViewState>('landing');
  const [auth, setAuth] = useState<{ role: Role, name: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (saved) {
      setAuth(JSON.parse(saved));
      setViewState('authenticated');
    }
  }, []);

  const login = (role: Role, name: string) => {
    const s = { role, name };
    setAuth(s);
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(s));
    setViewState('authenticated');
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    setViewState('landing');
  };

  if (viewState === 'landing') return <LandingPage onGoToLogin={() => setViewState('login')} />;
  if (viewState === 'login' && !auth) return <LoginPage onLogin={login} onBack={() => setViewState('landing')} />;
  
  return auth?.role === 'admin' ? <AdminDashboard onLogout={logout} /> : <UserDashboard userName={auth?.name || 'Guest'} onLogout={logout} />;
};

const rootElement = document.getElementById('root');
if (rootElement) createRoot(rootElement).render(<App />);
