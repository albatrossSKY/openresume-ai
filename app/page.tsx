'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  FileText, 
  Lock, 
  Code, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  Eye,
  Server
} from 'lucide-react';
import { STYLE_PRESETS } from './../constants/presets';

export default function LandingPage() {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const selectedPreset = STYLE_PRESETS[activePresetIndex];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/30">
              <FileText className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              OpenResume <span className="text-indigo-500 font-extrabold">AI</span>
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link 
              href="/builder" 
              id="header-launch-link"
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.08),transparent_40%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.08),transparent_40%)]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Hero Info */}
              <div className="lg:col-span-5 text-center lg:text-left flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-semibold self-center lg:self-start">
                  <Sparkles className="h-3.5 w-3.5" />
                  100% Free & Open Source
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  The Privacy-First <br/>
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    LaTeX + AI
                  </span> <br/>
                  Resume Builder.
                </h1>
                <p className="text-slate-400 text-base md:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Tailor your resume in one click using client-side local AI. Generate ATS-friendly, high-fidelity PDFs and LaTeX compile-ready source code 100% privately.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link 
                    href="/builder" 
                    id="hero-cta-button"
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all text-white px-8 py-4 rounded-xl text-base font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    Build My Resume
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <a 
                    href="#presets" 
                    className="w-full sm:w-auto text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900/60 px-6 py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2"
                  >
                    View Layouts
                  </a>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-900 mt-4 text-center lg:text-left">
                  <div>
                    <div className="font-extrabold text-2xl md:text-3xl text-slate-200">100+</div>
                    <div className="text-xs text-slate-500">Layout Combinations</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-2xl md:text-3xl text-slate-200">100%</div>
                    <div className="text-xs text-slate-500">Offline & Private</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-2xl md:text-3xl text-slate-200">Zero</div>
                    <div className="text-xs text-slate-500">Limits or Fees</div>
                  </div>
                </div>
              </div>
              
              {/* Interactive Demo Preview Column */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <div id="presets" className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
                  {/* Window Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                    </div>
                    <div className="text-xs text-slate-500 font-mono">resume_preview.pdf</div>
                    <div className="w-12" />
                  </div>
                  
                  {/* Preset Quick Switcher */}
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {STYLE_PRESETS.slice(0, 5).map((preset, idx) => (
                      <button
                        key={preset.name}
                        onClick={() => setActivePresetIndex(idx)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                          activePresetIndex === idx
                            ? 'bg-indigo-600/15 border-indigo-500/50 text-indigo-400'
                            : 'bg-slate-950 border-slate-850 text-slate-450 hover:bg-slate-900 hover:text-slate-350'
                        }`}
                      >
                        {preset.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Visual Resume Sheet Mockup */}
                  <div 
                    className="bg-white text-slate-900 p-6 rounded-lg min-h-[460px] flex flex-col font-sans transition-all duration-300 overflow-hidden text-[9px] leading-tight"
                    style={{
                      fontFamily: selectedPreset.style.fontFamily === 'serif' ? 'Georgia, serif' : selectedPreset.style.fontFamily === 'mono' ? 'Courier, monospace' : 'sans-serif',
                      padding: `${selectedPreset.style.marginSize / 4}px`,
                      color: selectedPreset.style.colorPalette.text,
                      backgroundColor: selectedPreset.style.colorPalette.background
                    }}
                  >
                    {/* Header */}
                    <div className={`border-b pb-2 mb-3 flex flex-col ${
                      selectedPreset.style.headerStyle === 'classic-centered' ? 'items-center text-center' : ''
                    }`}>
                      <div className="font-bold text-lg" style={{ color: selectedPreset.style.colorPalette.primary }}>
                        Alex Mercer
                      </div>
                      <div className="italic text-slate-500 text-[10px]">Senior Software Engineer</div>
                      <div className="flex gap-2 mt-1 text-[8px] text-slate-450 flex-wrap justify-center">
                        <span>alex.mercer@gmail.com</span>
                        <span>•</span>
                        <span>+1 (555) 019-2834</span>
                        <span>•</span>
                        <span>San Francisco, CA</span>
                      </div>
                    </div>

                    {/* Columns Wrapper */}
                    <div className={`grid gap-4 flex-grow ${
                      selectedPreset.style.layoutType === 'two-column-right' ? 'grid-cols-3' : selectedPreset.style.layoutType === 'two-column-left' ? 'grid-cols-3' : 'grid-cols-1'
                    }`}>
                      
                      {/* Sidebar if Left */}
                      {selectedPreset.style.layoutType === 'two-column-left' && (
                        <div className="col-span-1 border-r pr-3 flex flex-col gap-3">
                          <div>
                            <div className="font-bold text-[9px] border-b pb-0.5 mb-1" style={{ color: selectedPreset.style.colorPalette.primary }}>SKILLS</div>
                            <div className="flex flex-wrap gap-1">
                              {['TypeScript', 'React', 'Next.js', 'Node.js', 'Python'].map(s => (
                                <span key={s} className="bg-slate-100 px-1 rounded text-[7px]" style={{ color: selectedPreset.style.colorPalette.primary }}>{s}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-[9px] border-b pb-0.5 mb-1" style={{ color: selectedPreset.style.colorPalette.primary }}>LANGUAGES</div>
                            <div>English (Native)</div>
                            <div>Spanish (Conversational)</div>
                          </div>
                        </div>
                      )}

                      {/* Main Content Area */}
                      <div className={selectedPreset.style.layoutType === 'single-column' ? 'col-span-1' : 'col-span-2'}>
                        {/* Summary */}
                        <div className="mb-3">
                          <div className="font-bold text-[9px] tracking-wide mb-1 border-b pb-0.5" style={{ color: selectedPreset.style.colorPalette.primary }}>PROFILE</div>
                          <p className="text-slate-600">
                            Results-driven Senior Software Engineer with 6+ years of experience building scalable web applications. Expert in React, Node.js, and cloud architecture. Reduced server overhead costs by 40% and improved Web Vitals.
                          </p>
                        </div>

                        {/* Experience */}
                        <div>
                          <div className="font-bold text-[9px] tracking-wide mb-1 border-b pb-0.5" style={{ color: selectedPreset.style.colorPalette.primary }}>EXPERIENCE</div>
                          <div className="mb-2">
                            <div className="flex justify-between font-bold">
                              <span style={{ color: selectedPreset.style.colorPalette.primary }}>TechCorp Solutions</span>
                              <span className="text-slate-500">2023 — Present</span>
                            </div>
                            <div className="italic text-slate-500">Senior Frontend Engineer</div>
                            <ul className="list-disc pl-3 mt-1 text-slate-650 flex flex-col gap-0.5">
                              <li>Spearheaded Next.js migration yielding 45% Web Vitals performance increase.</li>
                              <li>Led a team of 4 to ship a shared library, saving 30% dev cycles.</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Sidebar if Right */}
                      {selectedPreset.style.layoutType === 'two-column-right' && (
                        <div className="col-span-1 border-l pl-3 flex flex-col gap-3">
                          <div>
                            <div className="font-bold text-[9px] border-b pb-0.5 mb-1" style={{ color: selectedPreset.style.colorPalette.primary }}>SKILLS</div>
                            <div className="flex flex-wrap gap-1">
                              {['TypeScript', 'React', 'Next.js', 'Node.js', 'Python'].map(s => (
                                <span key={s} className="bg-slate-100 px-1 rounded text-[7px]" style={{ color: selectedPreset.style.colorPalette.primary }}>{s}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-[9px] border-b pb-0.5 mb-1" style={{ color: selectedPreset.style.colorPalette.primary }}>LANGUAGES</div>
                            <div>English (Native)</div>
                            <div>Spanish (Fluent)</div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-slate-900/30 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
              <h2 className="text-3xl md:text-4xl font-extrabold">Professional Features. Built Privately.</h2>
              <p className="text-slate-400">Everything you need to bypass ATS checks, tailor bullet points, and download high-grade CV files without paying hidden subscription costs.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div id="feature-card-ai" className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl flex flex-col gap-4 hover:border-slate-700/80 transition-all group">
                <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">Local LLM Tailoring</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Analyze target jobs and optimize bullet points instantly. Integrates natively with Chrome's built-in AI (Gemini Nano) or your local Ollama setup.
                </p>
              </div>

              {/* Feature 2 */}
              <div id="feature-card-privacy" className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl flex flex-col gap-4 hover:border-slate-700/80 transition-all group">
                <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">100% Privacy-First</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your work data and PDF compilations never leave your browser. Zero logins, zero clouds, zero trackers. Fully secure.
                </p>
              </div>

              {/* Feature 3 */}
              <div id="feature-card-latex" className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl flex flex-col gap-4 hover:border-slate-700/80 transition-all group">
                <div className="bg-purple-500/10 text-purple-400 p-3 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Code className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">LaTeX Export Engine</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Love standard academic formats? Export compile-ready LaTeX templates compatible with Overleaf and texlive.
                </p>
              </div>
              
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 flex flex-col gap-5">
                <h2 className="text-3xl font-extrabold leading-tight">Fast. Private. ATS-Proof.</h2>
                <p className="text-slate-450 leading-relaxed text-sm">
                  Most online builders lock your resume download behind a monthly subscription. OpenResume AI is powered by web platform advancements to draw and compile PDF vectors in your browser directly.
                </p>
                <ul className="flex flex-col gap-3">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm"><strong className="text-white">Text-Selectable PDFs:</strong> Clean, vector-drawn fonts ensure full keyword scanning on major ATS crawlers.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm"><strong className="text-white">Built-in AI Proxy:</strong> Hook up Ollama directly through our built-in API proxy. No CORS setup headaches.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm"><strong className="text-white">100+ Styles:</strong> Mix typography, colors, padding, and sidebars to output the layout you need.</span>
                  </li>
                </ul>
              </div>
              <div className="lg:col-span-7 bg-slate-900/20 border border-slate-900 rounded-2xl p-8 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/10 p-2 text-indigo-400 rounded-lg">
                    <Server className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base">Simple 2-Step Ollama Connection</h3>
                </div>
                <div className="flex flex-col gap-4 text-xs font-mono bg-slate-950 p-5 border border-slate-900 rounded-xl">
                  <div>
                    <span className="text-slate-500"># 1. Run Ollama on your machine</span>
                    <div className="text-indigo-400 mt-1">ollama run gemma2</div>
                  </div>
                  <div className="border-t border-slate-900 my-2 pt-2">
                    <span className="text-slate-500"># 2. Input model in App Settings</span>
                    <div className="text-emerald-400 mt-1">OpenResume AI proxies requests automatically to localhost:11434</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg">
                  <Eye className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span>No need to configure OLLAMA_ORIGINS. The proxy handles connections securely behind the scenes.</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} OpenResume AI. Apache-2.0 Licensed.</p>
        </div>
      </footer>
    </div>
  );
}
