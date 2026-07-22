import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Cpu, 
  Layers, 
  Layout, 
  Server, 
  Database, 
  Network, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  User, 
  Briefcase, 
  ArrowRight,
  Check
} from 'lucide-react';

interface RoleSelectionProps {
  onStartInterview: (candidateName: string, role: string, experience: string, timerSeconds: number) => void;
  isLoading: boolean;
}

const PRESET_ROLES = [
  { id: 'java', title: 'Java Developer', icon: Code2, desc: 'JVM, Collections, Multithreading, Spring Boot, OOP', badge: 'Popular' },
  { id: 'python', title: 'Python Developer', icon: Terminal, desc: 'Django, FastAPI, Asyncio, Data Structures, OOP', badge: 'Popular' },
  { id: 'ai_engineer', title: 'AI Engineer', icon: Cpu, desc: 'LLMs, Prompt Eng, Vector DBs, PyTorch, RAG Architecture', badge: 'Hot' },
  { id: 'fullstack', title: 'Full Stack Engineer', icon: Layers, desc: 'React, Node.js, Express, REST/GraphQL, PostgreSQL', badge: 'Popular' },
  { id: 'frontend', title: 'Frontend Developer', icon: Layout, desc: 'React, TypeScript, CSS Architecture, State Management, Performance' },
  { id: 'backend', title: 'Backend Developer', icon: Server, desc: 'Microservices, APIs, Caching, Databases, Distributed Systems' },
  { id: 'data_scientist', title: 'Data Scientist / ML', icon: Database, desc: 'Pandas, Scikit-Learn, Feature Engineering, Model Metrics' },
  { id: 'system_design', title: 'System Design Specialist', icon: Network, desc: 'Scalability, Load Balancing, Sharding, Message Queues, Fault Tolerance' },
  { id: 'devops', title: 'DevOps & Cloud Engineer', icon: ShieldCheck, desc: 'Docker, Kubernetes, CI/CD, Terraform, AWS/GCP Architecture' }
];

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onStartInterview, isLoading }) => {
  const [candidateName, setCandidateName] = useState('John Doe');
  const [selectedRole, setSelectedRole] = useState('Java Developer');
  const [customRole, setCustomRole] = useState('');
  const [experience, setExperience] = useState('Mid-Level');
  const [timerSeconds, setTimerSeconds] = useState(180); // 3 minutes default per question

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = selectedRole === 'Custom' ? customRole.trim() || 'Software Engineer' : selectedRole;
    const finalName = candidateName.trim() || 'Candidate';
    onStartInterview(finalName, finalRole, experience, timerSeconds);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Intro Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Powered by Gemini 3.6 Flash Technical Evaluator
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          AI Technical Interview Screening
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Simulate a real technical interview with 5 role-tailored questions ranging from core fundamentals to complex scenario-based architectural designs.
        </p>
      </div>

      <form onSubmit={handleStart} className="space-y-8">
        {/* Step 1: Candidate & Experience Setup */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">1</div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Candidate Profile & Settings</h2>
              <p className="text-xs text-slate-500">Provide basic candidate details and timer limits for the session</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Candidate Name */}
            <div>
              <label htmlFor="candidate-name-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" /> Candidate Name
              </label>
              <input
                id="candidate-name-input"
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                required
              />
            </div>

            {/* Experience Level */}
            <div>
              <label htmlFor="experience-level-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Target Seniority
              </label>
              <select
                id="experience-level-select"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
              >
                <option value="Junior">Junior / Entry Level (0-2 yrs)</option>
                <option value="Mid-Level">Mid-Level (2-5 yrs)</option>
                <option value="Senior">Senior / Tech Lead (5+ yrs)</option>
              </select>
            </div>

            {/* Question Timer */}
            <div>
              <label htmlFor="timer-setting-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Timer per Question
              </label>
              <select
                id="timer-setting-select"
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
              >
                <option value={120}>2 Minutes (Fast-paced)</option>
                <option value={180}>3 Minutes (Standard)</option>
                <option value={300}>5 Minutes (Deep dive)</option>
                <option value={0}>Untimed (Relaxed practice)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Role Selection Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">2</div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Select Target Job Role</h2>
              <p className="text-xs text-slate-500">AI will generate 5 questions tailored specifically to this domain</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.title;
              return (
                <div
                  key={role.id}
                  id={`role-tile-${role.id}`}
                  onClick={() => setSelectedRole(role.title)}
                  className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {role.badge && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      {role.badge}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{role.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{role.desc}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-600 pt-2 border-t border-slate-100">
                    <span>Select Role</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Role Option */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="radio"
                id="role-custom-radio"
                name="role_choice"
                checked={selectedRole === 'Custom'}
                onChange={() => setSelectedRole('Custom')}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <label htmlFor="role-custom-radio" className="font-bold text-slate-800 text-sm cursor-pointer">
                Enter Custom Job Role (e.g. Golang Microservices Developer, iOS Swift Engineer)
              </label>
            </div>

            {selectedRole === 'Custom' && (
              <input
                id="custom-role-input"
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Flutter Mobile Developer / Cloud Security Architect"
                className="w-full px-4 py-2.5 rounded-xl border border-indigo-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mt-1"
                required
              />
            )}
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-end pt-2">
          <button
            id="start-interview-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-base shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating 5 Questions with Gemini AI...</span>
              </>
            ) : (
              <>
                <span>Begin 5-Question Interview</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
