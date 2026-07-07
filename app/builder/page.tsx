'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trash2, 
  Plus, 
  Download, 
  Code, 
  Sparkles, 
  Settings, 
  HelpCircle, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  FileText, 
  Sliders, 
  Languages, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Terminal, 
  User, 
  Copy,
  ChevronLeft,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { ResumeData, ResumeStyle, WorkExperience, Education, Project, SkillCategory, Certification, Language } from '../../types/resume';
import { DEFAULT_RESUME_DATA, STYLE_PRESETS, COLOR_PALETTES } from '../../constants/presets';
import { generateResumePDF } from '../../utils/pdfGenerator';
import { generateResumeLatex } from '../../utils/latexGenerator';
import { 
  checkChromeAIAvailability, 
  fetchOllamaModels, 
  analyzeATSScore, 
  tailorBullets, 
  ATSResult,
  ModelInfo,
  getResumePlainText 
} from '../../utils/aiService';

export default function BuilderPage() {
  // State for Resume Data and Styling
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const [resumeStyle, setResumeStyle] = useState<ResumeStyle>(STYLE_PRESETS[0].style);
  
  // App UI State
  const [activeTab, setActiveTab] = useState<'preview' | 'latex'>('preview');
  const [activeFormSection, setActiveFormSection] = useState<'personal' | 'experience' | 'education' | 'projects' | 'skills' | 'certifications' | 'languages'>('personal');
  
  // Expanded item index tracking for lists
  const [expandedWork, setExpandedWork] = useState<Record<string, boolean>>({ 'work-1': true });
  const [expandedEdu, setExpandedEdu] = useState<Record<string, boolean>>({ 'edu-1': true });
  const [expandedProj, setExpandedProj] = useState<Record<string, boolean>>({ 'proj-1': true });

  // AI & Local LLM State
  const [jobDescription, setJobDescription] = useState('');
  const [aiProvider, setAiProvider] = useState<'chrome' | 'ollama'>('ollama');
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState('http://127.0.0.1:11434');
  const [ollamaModel, setOllamaModel] = useState('gemma2');
  const [availableOllamaModels, setAvailableOllamaModels] = useState<ModelInfo[]>([]);
  const [chromeAIAvailable, setChromeAIAvailable] = useState(false);
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);
  
  // AI Output States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorTargetId, setTailorTargetId] = useState<string | null>(null); // 'work-x' or 'proj-x'
  const [tailorOriginalBullets, setTailorOriginalBullets] = useState<string[]>([]);
  const [tailorSuggestedBullets, setTailorSuggestedBullets] = useState<string[]>([]);
  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);

  // Check Chrome AI & Ollama models on mount
  useEffect(() => {
    async function initAI() {
      const chromeAvailable = await checkChromeAIAvailability();
      setChromeAIAvailable(chromeAvailable);
      if (chromeAvailable) {
        setAiProvider('chrome');
      }
      
      // Attempt to load Ollama models
      try {
        const models = await fetchOllamaModels(ollamaBaseUrl);
        setAvailableOllamaModels(models);
        if (models.length > 0) {
          // Find gemma or llama if available, else pick first
          const defaultModel = models.find(m => m.name.includes('gemma') || m.name.includes('llama'))?.name || models[0].name;
          setOllamaModel(defaultModel);
        }
      } catch (e) {
        console.warn('Ollama not reachable initially:', e);
      }
    }
    initAI();
  }, []);

  // Update Ollama Models list
  const refreshOllama = async () => {
    const models = await fetchOllamaModels(ollamaBaseUrl);
    setAvailableOllamaModels(models);
    if (models.length > 0) {
      setOllamaModel(models[0].name);
    }
  };

  // PDF Export
  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const pdfBytes = await generateResumePDF(resumeData, resumeStyle);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      link.click();
      
      // Celebrate
      confetti({
        particleCount: 120,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {
      console.error('PDF Generation Failed:', e);
      alert('Could not download PDF. Check console for error log.');
    } finally {
      setIsDownloading(false);
    }
  };

  // LaTeX Export
  const handleCopyLatex = () => {
    const latex = generateResumeLatex(resumeData, resumeStyle);
    navigator.clipboard.writeText(latex);
    alert('LaTeX code copied to clipboard!');
  };

  const handleDownloadLatex = () => {
    const latex = generateResumeLatex(resumeData, resumeStyle);
    const blob = new Blob([latex], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.tex`;
    link.click();
  };

  // Preset Selection
  const applyPreset = (presetStyle: ResumeStyle) => {
    setResumeStyle(presetStyle);
  };

  // Dynamic style changes
  const updateStyle = (key: keyof ResumeStyle, value: any) => {
    setResumeStyle(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updatePalette = (palette: typeof COLOR_PALETTES[0]) => {
    setResumeStyle(prev => ({
      ...prev,
      colorPalette: palette
    }));
  };

  // --- RESUME DATA MUTATORS ---
  const handlePersonalInfoChange = (key: keyof typeof resumeData.personalInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [key]: value
      }
    }));
  };

  // Work Experience Handlers
  const addWork = () => {
    const newId = `work-${Date.now()}`;
    const newJob: WorkExperience = {
      id: newId,
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ['Accomplished X, measured by Y, by doing Z.']
    };
    setResumeData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newJob]
    }));
    setExpandedWork(prev => ({ ...prev, [newId]: true }));
  };

  const updateWork = (id: string, key: keyof WorkExperience, value: any) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(job => 
        job.id === id ? { ...job, [key]: value } : job
      )
    }));
  };

  const deleteWork = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(job => job.id !== id)
    }));
  };

  const updateWorkBullet = (jobId: string, bulletIdx: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(job => {
        if (job.id === jobId) {
          const updated = [...job.description];
          updated[bulletIdx] = value;
          return { ...job, description: updated };
        }
        return job;
      })
    }));
  };

  const addWorkBullet = (jobId: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(job => 
        job.id === jobId 
          ? { ...job, description: [...job.description, ''] }
          : job
      )
    }));
  };

  const deleteWorkBullet = (jobId: string, bulletIdx: number) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(job => 
        job.id === jobId 
          ? { ...job, description: job.description.filter((_, idx) => idx !== bulletIdx) }
          : job
      )
    }));
  };

  // Education Handlers
  const addEdu = () => {
    const newId = `edu-${Date.now()}`;
    const newSchool: Education = {
      id: newId,
      institution: '',
      degree: '',
      major: '',
      location: '',
      startDate: '',
      endDate: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newSchool]
    }));
    setExpandedEdu(prev => ({ ...prev, [newId]: true }));
  };

  const updateEdu = (id: string, key: keyof Education, value: any) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [key]: value } : edu
      )
    }));
  };

  const deleteEdu = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // Projects Handlers
  const addProj = () => {
    const newId = `proj-${Date.now()}`;
    const newProj: Project = {
      id: newId,
      name: '',
      role: '',
      link: '',
      technologies: [],
      description: ['Created features to solve X, using Y.']
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProj]
    }));
    setExpandedProj(prev => ({ ...prev, [newId]: true }));
  };

  const updateProj = (id: string, key: keyof Project, value: any) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [key]: value } : proj
      )
    }));
  };

  const deleteProj = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  const updateProjBullet = (projId: string, bulletIdx: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => {
        if (proj.id === projId) {
          const updated = [...proj.description];
          updated[bulletIdx] = value;
          return { ...proj, description: updated };
        }
        return proj;
      })
    }));
  };

  const addProjBullet = (projId: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === projId 
          ? { ...proj, description: [...proj.description, ''] }
          : proj
      )
    }));
  };

  const deleteProjBullet = (projId: string, bulletIdx: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === projId 
          ? { ...proj, description: proj.description.filter((_, idx) => idx !== bulletIdx) }
          : proj
      )
    }));
  };

  // Skills Handlers
  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      id: `skill-${Date.now()}`,
      category: '',
      skills: []
    };
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newCat]
    }));
  };

  const updateSkillCategory = (id: string, category: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, category } : s)
    }));
  };

  const updateSkillsList = (id: string, commaString: string) => {
    const list = commaString.split(',').map(s => s.trim()).filter(Boolean);
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, skills: list } : s)
    }));
  };

  const deleteSkillCategory = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id)
    }));
  };

  // Certifications Handlers
  const addCert = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: ''
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
  };

  const updateCert = (id: string, key: keyof Certification, value: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => c.id === id ? { ...c, [key]: value } : c)
    }));
  };

  const deleteCert = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.id !== id)
    }));
  };

  // Languages Handlers
  const addLang = () => {
    const newLang: Language = {
      id: `lang-${Date.now()}`,
      name: '',
      proficiency: 'Fluent'
    };
    setResumeData(prev => ({
      ...prev,
      languages: [...prev.languages, newLang]
    }));
  };

  const updateLang = (id: string, key: keyof Language, value: string) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.map(l => l.id === id ? { ...l, [key]: value } : l)
    }));
  };

  const deleteLang = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l.id !== id)
    }));
  };

  // --- AI ACTIONS ---
  const handleATSScan = async () => {
    if (!jobDescription) {
      alert('Please paste a job description first.');
      return;
    }
    
    setIsAnalyzing(true);
    setAtsResult(null);
    
    try {
      const resumeText = getResumePlainText(resumeData);
      const res = await analyzeATSScore(
        resumeText, 
        jobDescription, 
        aiProvider, 
        { model: ollamaModel, baseUrl: ollamaBaseUrl }
      );
      setAtsResult(res);
    } catch (e: any) {
      console.error(e);
      alert(`ATS Scan failed: ${e.message || e}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger bullet tailoring flow
  const handleTriggerTailoring = async (id: string, type: 'work' | 'proj') => {
    if (!jobDescription) {
      alert('Please paste a job description first in the AI Panel.');
      return;
    }
    
    setIsTailoring(true);
    setTailorTargetId(id);
    
    const targetItem = type === 'work' 
      ? resumeData.workExperience.find(w => w.id === id)
      : resumeData.projects.find(p => p.id === id);
      
    if (!targetItem) return;
    
    const bullets = targetItem.description;
    setTailorOriginalBullets(bullets);
    
    try {
      const optimized = await tailorBullets(
        bullets, 
        jobDescription, 
        aiProvider, 
        { model: ollamaModel, baseUrl: ollamaBaseUrl }
      );
      setTailorSuggestedBullets(optimized);
      setIsTailorModalOpen(true);
    } catch (e: any) {
      console.error(e);
      alert(`Tailoring failed: ${e.message || e}`);
    } finally {
      setIsTailoring(false);
    }
  };

  // Apply tailored bullets
  const handleApplyTailoredBullets = (acceptedBullets: string[]) => {
    if (!tailorTargetId) return;
    
    setResumeData(prev => {
      // Check if target is experience or project
      const isWork = prev.workExperience.some(w => w.id === tailorTargetId);
      if (isWork) {
        return {
          ...prev,
          workExperience: prev.workExperience.map(w => 
            w.id === tailorTargetId ? { ...w, description: acceptedBullets } : w
          )
        };
      } else {
        return {
          ...prev,
          projects: prev.projects.map(p => 
            p.id === tailorTargetId ? { ...p, description: acceptedBullets } : p
          )
        };
      }
    });
    
    setIsTailorModalOpen(false);
    setTailorTargetId(null);
    alert('Tailored bullets applied to resume!');
  };

  // Toggle expanded states
  const toggleExpandWork = (id: string) => {
    setExpandedWork(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandEdu = (id: string) => {
    setExpandedEdu(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandProj = (id: string) => {
    setExpandedProj(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- PREVIEW RENDER HELPERS ---
  const EditableText = ({
    value,
    onSave,
    className = "",
    style = {},
    tagName = "span"
  }: {
    value: string;
    onSave: (val: string) => void;
    className?: string;
    style?: React.CSSProperties;
    tagName?: string;
  }) => {
    const Tag = tagName as any;
    return (
      <Tag
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={(e: any) => onSave(e.target.innerText)}
        className={`${className} outline-none focus:outline-dashed focus:outline-[1.5px] focus:outline-indigo-500/60 focus:bg-indigo-50/10 focus:px-1 rounded cursor-text transition-all`}
        style={style}
      >
        {value || " "}
      </Tag>
    );
  };

  const renderPhoto = (sizeClass = "w-12 h-12") => {
    if (!resumeData.personalInfo.photoUrl) return null;
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden border shrink-0`} style={{ borderColor: resumeStyle.colorPalette.border }}>
        <img src={resumeData.personalInfo.photoUrl} alt="Photo" className="w-full h-full object-cover" />
      </div>
    );
  };

  const renderSectionHeader = (title: string) => {
    if (resumeStyle.sectionHeaderStyle === 'underline') {
      return (
        <div className="mb-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: resumeStyle.colorPalette.primary }}>
            {title}
          </h3>
          <div className="h-[1.5px] w-full mt-0.5" style={{ backgroundColor: resumeStyle.colorPalette.primary }} />
        </div>
      );
    } else if (resumeStyle.sectionHeaderStyle === 'pill') {
      return (
        <div className="mb-2 w-fit px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${resumeStyle.colorPalette.primary}20`, color: resumeStyle.colorPalette.primary }}>
          {title}
        </div>
      );
    } else if (resumeStyle.sectionHeaderStyle === 'left-border') {
      return (
        <div className="mb-2 pl-2 border-l-[3px]" style={{ borderColor: resumeStyle.colorPalette.primary }}>
          <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: resumeStyle.colorPalette.primary }}>
            {title}
          </h3>
        </div>
      );
    } else {
      // minimal-bold
      return (
        <div className="mb-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: resumeStyle.colorPalette.text }}>
            {title}
          </h3>
        </div>
      );
    }
  };

  const renderBullets = (bullets: string[], onUpdate?: (newBullets: string[]) => void) => {
    let listStyleClass = 'list-disc pl-4';
    let customBulletIndicator = null;
    
    if (resumeStyle.bulletStyle === 'square') {
      listStyleClass = 'list-square pl-4';
    } else if (resumeStyle.bulletStyle === 'dash') {
      listStyleClass = 'list-none pl-0';
      customBulletIndicator = '—';
    } else if (resumeStyle.bulletStyle === 'none') {
      listStyleClass = 'list-none pl-0';
    }
    
    return (
      <ul className={`${listStyleClass} mt-1 flex flex-col gap-0.5`} style={{ color: resumeStyle.colorPalette.text }}>
        {bullets.map((b, i) => (
          <li key={i} className="text-[8.5px] leading-relaxed">
            {customBulletIndicator && <span className="font-bold mr-1.5" style={{ color: resumeStyle.colorPalette.primary }}>{customBulletIndicator}</span>}
            {onUpdate ? (
              <EditableText
                value={b}
                onSave={(newVal) => {
                  const copy = [...bullets];
                  copy[i] = newVal;
                  onUpdate(copy);
                }}
              />
            ) : (
              b
            )}
          </li>
        ))}
      </ul>
    );
  };

  const renderHeaderBlock = () => {
    const info = resumeData.personalInfo;
    const hasPhoto = !!info.photoUrl;
    
    if (resumeStyle.headerStyle === 'colored-banner') {
      return (
        <div 
          className="w-full flex flex-col gap-0.5 border-b pb-3 mb-4" 
          style={{ 
            backgroundColor: resumeStyle.colorPalette.primary,
            color: resumeStyle.colorPalette.background,
            marginLeft: `-${resumeStyle.marginSize}pt`,
            marginRight: `-${resumeStyle.marginSize}pt`,
            marginTop: `-${resumeStyle.marginSize}pt`,
            paddingLeft: `${resumeStyle.marginSize}pt`,
            paddingRight: `${resumeStyle.marginSize}pt`,
            paddingTop: '20px',
            paddingBottom: '20px',
          }}
        >
          <div className="flex gap-4 items-center">
            {hasPhoto && renderPhoto("w-14 h-14 border-2 border-white/20")}
            <div>
              <EditableText tagName="h2" value={info.fullName} onSave={(val) => handlePersonalInfoChange('fullName', val)} className="text-xl font-bold tracking-tight" />
              <EditableText tagName="div" value={info.title} onSave={(val) => handlePersonalInfoChange('title', val)} className="italic text-[10px] opacity-90" />
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[8.5px] opacity-80 mt-1">
                {info.email && <EditableText value={info.email} onSave={(val) => handlePersonalInfoChange('email', val)} />}
                {info.phone && <span>• <EditableText value={info.phone} onSave={(val) => handlePersonalInfoChange('phone', val)} /></span>}
                {info.location && <span>• <EditableText value={info.location} onSave={(val) => handlePersonalInfoChange('location', val)} /></span>}
                {info.website && <span>• <EditableText value={info.website} onSave={(val) => handlePersonalInfoChange('website', val)} /></span>}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (resumeStyle.headerStyle === 'modern-split') {
      return (
        <div className="w-full flex justify-between items-start pb-2 mb-4 border-b" style={{ borderColor: resumeStyle.colorPalette.border }}>
          <div className="flex gap-3 items-center">
            {hasPhoto && renderPhoto("w-12 h-12")}
            <div className="flex flex-col">
              <EditableText tagName="h2" value={info.fullName} onSave={(val) => handlePersonalInfoChange('fullName', val)} className="text-xl font-bold tracking-tight" style={{ color: resumeStyle.colorPalette.primary }} />
              <EditableText tagName="div" value={info.title} onSave={(val) => handlePersonalInfoChange('title', val)} className="italic text-[10px] font-semibold" style={{ color: resumeStyle.colorPalette.secondary }} />
            </div>
          </div>
          <div className="flex flex-col items-end text-right text-[8.5px]" style={{ color: resumeStyle.colorPalette.muted }}>
            {info.email && <EditableText value={info.email} onSave={(val) => handlePersonalInfoChange('email', val)} />}
            {info.phone && <EditableText value={info.phone} onSave={(val) => handlePersonalInfoChange('phone', val)} />}
            {info.location && <EditableText value={info.location} onSave={(val) => handlePersonalInfoChange('location', val)} />}
            {info.website && <EditableText value={info.website} onSave={(val) => handlePersonalInfoChange('website', val)} />}
          </div>
        </div>
      );
    } else if (resumeStyle.headerStyle === 'classic-centered') {
      return (
        <div className="w-full flex flex-col items-center text-center pb-2 mb-4">
          {hasPhoto && <div className="mb-2">{renderPhoto("w-14 h-14")}</div>}
          <EditableText tagName="h2" value={info.fullName} onSave={(val) => handlePersonalInfoChange('fullName', val)} className="text-xl font-bold tracking-tight mb-0.5" style={{ color: resumeStyle.colorPalette.primary }} />
          <EditableText tagName="div" value={info.title} onSave={(val) => handlePersonalInfoChange('title', val)} className="italic text-[10px] font-medium" style={{ color: resumeStyle.colorPalette.secondary }} />
          <div className="flex flex-wrap gap-2 text-[8.5px] mt-1 justify-center" style={{ color: resumeStyle.colorPalette.muted }}>
            {info.email && <EditableText value={info.email} onSave={(val) => handlePersonalInfoChange('email', val)} />}
            {info.phone && <span>• <EditableText value={info.phone} onSave={(val) => handlePersonalInfoChange('phone', val)} /></span>}
            {info.location && <span>• <EditableText value={info.location} onSave={(val) => handlePersonalInfoChange('location', val)} /></span>}
            {info.website && <span>• <EditableText value={info.website} onSave={(val) => handlePersonalInfoChange('website', val)} /></span>}
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full flex flex-col pb-2 mb-4">
          <div className="flex gap-3 items-center">
            {hasPhoto && renderPhoto("w-12 h-12")}
            <div>
              <EditableText tagName="h2" value={info.fullName} onSave={(val) => handlePersonalInfoChange('fullName', val)} className="text-xl font-bold tracking-tight mb-0.5" style={{ color: resumeStyle.colorPalette.primary }} />
              <EditableText tagName="div" value={info.title} onSave={(val) => handlePersonalInfoChange('title', val)} className="italic text-[10px] font-medium" style={{ color: resumeStyle.colorPalette.secondary }} />
              <div className="flex flex-wrap gap-2.5 text-[8.5px] mt-1" style={{ color: resumeStyle.colorPalette.muted }}>
                {info.email && <EditableText value={info.email} onSave={(val) => handlePersonalInfoChange('email', val)} />}
                {info.phone && <span>| <EditableText value={info.phone} onSave={(val) => handlePersonalInfoChange('phone', val)} /></span>}
                {info.location && <span>| <EditableText value={info.location} onSave={(val) => handlePersonalInfoChange('location', val)} /></span>}
                {info.website && <span>| <EditableText value={info.website} onSave={(val) => handlePersonalInfoChange('website', val)} /></span>}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderSidebarBlock = (side: 'left' | 'right') => {
    const borderClass = side === 'left' ? 'border-r pr-3.5' : 'border-l pl-3.5';
    return (
      <div className={`col-span-1 flex flex-col gap-4 text-[8.5px] ${borderClass}`} style={{ borderColor: resumeStyle.colorPalette.border }}>
        {/* Sidebar Skills */}
        {resumeData.skills.length > 0 && (
          <div>
            {renderSectionHeader('Skills')}
            <div className="flex flex-col gap-2 mt-1">
              {resumeData.skills.map(s => (
                <div key={s.id} className="space-y-0.5">
                  <div className="font-semibold text-slate-800" style={{ color: resumeStyle.colorPalette.text }}>{s.category}</div>
                  {resumeStyle.skillStyle === 'pills' ? (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {s.skills.map((sk, i) => (
                        <span 
                          key={i} 
                          className="text-[7.5px] px-1 py-0.5 rounded border"
                          style={{ 
                            backgroundColor: resumeStyle.colorPalette.accent, 
                            borderColor: resumeStyle.colorPalette.border,
                            color: resumeStyle.colorPalette.primary 
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: resumeStyle.colorPalette.muted }} className="text-[8px] leading-relaxed">{s.skills.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Sidebar Languages */}
        {resumeData.languages.length > 0 && (
          <div>
            {renderSectionHeader('Languages')}
            <div className="space-y-1">
              {resumeData.languages.map(l => (
                <div key={l.id} className="flex justify-between">
                  <span className="font-semibold" style={{ color: resumeStyle.colorPalette.text }}>{l.name}</span>
                  <span className="italic" style={{ color: resumeStyle.colorPalette.muted }}>{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sidebar Certifications */}
        {resumeData.certifications.length > 0 && (
          <div>
            {renderSectionHeader('Certifications')}
            <div className="space-y-2">
              {resumeData.certifications.map(c => (
                <div key={c.id} className="space-y-0.5">
                  <div className="font-semibold" style={{ color: resumeStyle.colorPalette.text }}>{c.name}</div>
                  <div style={{ color: resumeStyle.colorPalette.muted }} className="text-[8px]">{c.issuer} ({c.date})</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExperienceSection = (layoutTheme?: string) => {
    if (resumeData.workExperience.length === 0) return null;
    return (
      <div>
        {renderSectionHeader(layoutTheme === 'Executive' ? 'Professional History' : 'Experience')}
        <div className={resumeStyle.spacing === 'compact' ? 'space-y-2.5' : resumeStyle.spacing === 'comfortable' ? 'space-y-4.5' : 'space-y-3.5'}>
          {resumeData.workExperience.map(job => (
            <div key={job.id} className="text-[8.5px]">
              <div className="flex justify-between font-bold text-[9px]">
                <EditableText value={job.company} onSave={(val) => updateWork(job.id, 'company', val)} style={{ color: resumeStyle.colorPalette.primary }} />
                <span style={{ color: resumeStyle.colorPalette.muted }} className="font-normal flex gap-1">
                  <EditableText value={job.startDate} onSave={(val) => updateWork(job.id, 'startDate', val)} />
                  —
                  <EditableText value={job.endDate} onSave={(val) => updateWork(job.id, 'endDate', val)} />
                </span>
              </div>
              <div className="flex justify-between italic mb-0.5">
                <EditableText value={job.position} onSave={(val) => updateWork(job.id, 'position', val)} style={{ color: resumeStyle.colorPalette.text }} />
                <EditableText value={job.location} onSave={(val) => updateWork(job.id, 'location', val)} className="font-normal not-italic" style={{ color: resumeStyle.colorPalette.muted }} />
              </div>
              {renderBullets(job.description, (newBullets) => {
                setResumeData(prev => ({
                  ...prev,
                  workExperience: prev.workExperience.map(w => w.id === job.id ? { ...w, description: newBullets } : w)
                }));
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjectsSection = (layoutTheme?: string) => {
    if (resumeData.projects.length === 0) return null;
    return (
      <div>
        {renderSectionHeader('Projects')}
        <div className={resumeStyle.spacing === 'compact' ? 'space-y-2.5' : resumeStyle.spacing === 'comfortable' ? 'space-y-4.5' : 'space-y-3.5'}>
          {resumeData.projects.map(proj => (
            <div key={proj.id} className="text-[8.5px]">
              <div className="flex justify-between font-bold text-[9px]">
                <EditableText value={proj.name} onSave={(val) => updateProj(proj.id, 'name', val)} style={{ color: resumeStyle.colorPalette.text }} />
                {proj.link && (
                  <EditableText value={proj.link} onSave={(val) => updateProj(proj.id, 'link', val)} className="font-normal text-[8px]" style={{ color: resumeStyle.colorPalette.secondary }} />
                )}
              </div>
              <div className="flex justify-between italic mb-0.5">
                <EditableText value={proj.role} onSave={(val) => updateProj(proj.id, 'role', val)} style={{ color: resumeStyle.colorPalette.muted }} />
                <span style={{ color: resumeStyle.colorPalette.primary }} className="font-normal text-[7.5px] not-italic flex gap-0.5">
                  [
                  <EditableText value={proj.technologies.join(', ')} onSave={(val) => updateProj(proj.id, 'technologies', val.split(',').map(t => t.trim()).filter(Boolean))} />
                  ]
                </span>
              </div>
              {renderBullets(proj.description, (newBullets) => {
                setResumeData(prev => ({
                  ...prev,
                  projects: prev.projects.map(p => p.id === proj.id ? { ...p, description: newBullets } : p)
                }));
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducationSection = (layoutTheme?: string) => {
    if (resumeData.education.length === 0) return null;
    return (
      <div>
        {renderSectionHeader('Education')}
        <div className="space-y-2">
          {resumeData.education.map(edu => (
            <div key={edu.id} className="text-[8.5px]">
              <div className="flex justify-between font-bold text-[9px]">
                <EditableText value={edu.institution} onSave={(val) => updateEdu(edu.id, 'institution', val)} style={{ color: resumeStyle.colorPalette.text }} />
                <span style={{ color: resumeStyle.colorPalette.muted }} className="font-normal flex gap-1">
                  <EditableText value={edu.startDate} onSave={(val) => updateEdu(edu.id, 'startDate', val)} />
                  —
                  <EditableText value={edu.endDate} onSave={(val) => updateEdu(edu.id, 'endDate', val)} />
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: resumeStyle.colorPalette.text }} className="flex gap-1">
                  <EditableText value={edu.degree} onSave={(val) => updateEdu(edu.id, 'degree', val)} />
                  <span>in</span>
                  <EditableText value={edu.major} onSave={(val) => updateEdu(edu.id, 'major', val)} />
                  {edu.gpa && (
                    <span className="flex gap-0.5">
                      (GPA: <EditableText value={edu.gpa} onSave={(val) => updateEdu(edu.id, 'gpa', val)} />)
                    </span>
                  )}
                </span>
                <EditableText value={edu.location} onSave={(val) => updateEdu(edu.id, 'location', val)} className="italic" style={{ color: resumeStyle.colorPalette.muted }} />
              </div>
              {edu.details && (
                <p style={{ color: resumeStyle.colorPalette.muted }} className="text-[7.5px] italic mt-0.5 pl-1.5">
                  <EditableText value={edu.details} onSave={(val) => updateEdu(edu.id, 'details', val)} />
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkillsSection = (layoutTheme?: string) => {
    if (resumeData.skills.length === 0) return null;
    return (
      <div>
        {renderSectionHeader('Skills')}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[8.5px]">
          {resumeData.skills.map(s => (
            <div key={s.id} className="flex gap-1.5">
              <EditableText value={s.category} onSave={(val) => updateSkillCategory(s.id, val)} className="font-bold shrink-0" style={{ color: resumeStyle.colorPalette.text }} />
              <span>:</span>
              <EditableText value={s.skills.join(', ')} onSave={(val) => updateSkillsList(s.id, val)} style={{ color: resumeStyle.colorPalette.muted }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertsAndLangsAcademic = () => {
    const hasCerts = resumeData.certifications.length > 0;
    const hasLangs = resumeData.languages.length > 0;
    if (!hasCerts && !hasLangs) return null;
    return (
      <div className="grid grid-cols-2 gap-4 text-[8.5px] mt-4">
        {hasCerts && (
          <div>
            {renderSectionHeader('Certifications')}
            <div className="space-y-1">
              {resumeData.certifications.map(c => (
                <div key={c.id}>
                  <span className="font-bold" style={{ color: resumeStyle.colorPalette.text }}>{c.name}</span> — <span style={{ color: resumeStyle.colorPalette.muted }}>{c.issuer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {hasLangs && (
          <div>
            {renderSectionHeader('Languages')}
            <div className="space-y-1">
              {resumeData.languages.map(l => (
                <div key={l.id} className="flex justify-between">
                  <span className="font-bold" style={{ color: resumeStyle.colorPalette.text }}>{l.name}</span>
                  <span style={{ color: resumeStyle.colorPalette.muted }} className="italic">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 1. MODERN LAYOUT RENDERER
  const renderModernLayout = () => {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        {renderHeaderBlock()}
        
        {/* Columns */}
        <div className={`grid gap-5 h-full ${
          resumeStyle.layoutType === 'two-column-right' ? 'grid-cols-3' : resumeStyle.layoutType === 'two-column-left' ? 'grid-cols-3' : 'grid-cols-1'
        }`}>
          {resumeStyle.layoutType === 'two-column-left' && renderSidebarBlock('left')}
          
          <div className={`${resumeStyle.layoutType === 'single-column' ? 'col-span-1' : 'col-span-2'} ${
            resumeStyle.spacing === 'compact' ? 'space-y-3' : resumeStyle.spacing === 'comfortable' ? 'space-y-6' : 'space-y-4.5'
          }`}>
            {resumeData.personalInfo.summary && (
              <div>
                {renderSectionHeader('Profile Summary')}
                <p style={{ color: resumeStyle.colorPalette.text }} className="text-[9px] leading-relaxed">
                  {resumeData.personalInfo.summary}
                </p>
              </div>
            )}
            {renderExperienceSection()}
            {renderProjectsSection()}
            {renderEducationSection()}
            {resumeStyle.layoutType === 'single-column' && renderSkillsSection()}
          </div>
          
          {resumeStyle.layoutType === 'two-column-right' && renderSidebarBlock('right')}
        </div>
      </div>
    );
  };

  // 2. ACADEMIC LAYOUT RENDERER
  const renderAcademicLayout = () => {
    return (
      <div className="space-y-4 text-[9px] font-serif">
        {/* Centered Academic Header */}
        <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: resumeStyle.colorPalette.border }}>
          <div className="text-left flex-grow">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: resumeStyle.colorPalette.primary }}>
              {resumeData.personalInfo.fullName}
            </h2>
            <div className="italic text-slate-500 text-xs mb-1 font-medium">{resumeData.personalInfo.title}</div>
            <div className="flex flex-wrap gap-2 text-[8.5px] mt-1" style={{ color: resumeStyle.colorPalette.muted }}>
              {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
              {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
              {resumeData.personalInfo.location && <span>• {resumeData.personalInfo.location}</span>}
              {resumeData.personalInfo.website && <span>• {resumeData.personalInfo.website.replace('https://', '')}</span>}
            </div>
          </div>
          {resumeData.personalInfo.photoUrl && renderPhoto("w-14 h-14 ml-4 border-2")}
        </div>

        {/* Education first in Academic CV */}
        {renderEducationSection('Academic')}

        {/* Experience */}
        {renderExperienceSection('Academic')}

        {/* Projects */}
        {renderProjectsSection('Academic')}

        {/* Skills */}
        {renderSkillsSection('Academic')}

        {/* Certifications and Languages */}
        {renderCertsAndLangsAcademic()}
      </div>
    );
  };

  // 3. CREATIVE SIDEBAR LAYOUT RENDERER
  const renderCreativeLayout = () => {
    return (
      <div className="grid grid-cols-3 h-full min-h-[1056px]">
        {/* Left Column Sidebar (1 col) */}
        <div 
          className="col-span-1 p-6 flex flex-col gap-5 text-white" 
          style={{ backgroundColor: resumeStyle.colorPalette.primary }}
        >
          {/* Photo if present */}
          {resumeData.personalInfo.photoUrl && (
            <div className="flex justify-center mb-1">
              {renderPhoto("w-16 h-16 border-2 border-white/20")}
            </div>
          )}
          
          {/* Name & Title */}
          <div>
            <EditableText tagName="h2" value={resumeData.personalInfo.fullName} onSave={(val) => handlePersonalInfoChange('fullName', val)} className="text-lg font-black tracking-tight leading-tight" />
            <EditableText tagName="div" value={resumeData.personalInfo.title} onSave={(val) => handlePersonalInfoChange('title', val)} className="text-[9.5px] opacity-90 mt-1 uppercase tracking-wider font-bold" />
          </div>
 
          {/* Contact Details */}
          <div className="space-y-2 text-[8px] opacity-90 border-t border-white/20 pt-3">
            <span className="font-bold text-[9px] block tracking-wide">CONTACT</span>
            {resumeData.personalInfo.email && <div className="truncate"><EditableText value={resumeData.personalInfo.email} onSave={(val) => handlePersonalInfoChange('email', val)} /></div>}
            {resumeData.personalInfo.phone && <div><EditableText value={resumeData.personalInfo.phone} onSave={(val) => handlePersonalInfoChange('phone', val)} /></div>}
            {resumeData.personalInfo.location && <div><EditableText value={resumeData.personalInfo.location} onSave={(val) => handlePersonalInfoChange('location', val)} /></div>}
            {resumeData.personalInfo.website && <div className="truncate"><EditableText value={resumeData.personalInfo.website} onSave={(val) => handlePersonalInfoChange('website', val)} /></div>}
          </div>
 
          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <div className="space-y-2 border-t border-white/20 pt-3">
              <span className="font-bold text-[9px] block tracking-wide">SKILLS</span>
              <div className="flex flex-col gap-2">
                {resumeData.skills.map(s => (
                  <div key={s.id} className="space-y-1">
                    <EditableText value={s.category} onSave={(val) => updateSkillCategory(s.id, val)} className="font-bold text-[8px] opacity-95" />
                    <div className="flex flex-wrap gap-1">
                      {s.skills.map((sk, i) => (
                        <EditableText 
                          key={i} 
                          value={sk} 
                          onSave={(val) => {
                            const copy = [...s.skills];
                            copy[i] = val;
                            updateSkillsList(s.id, copy.join(', '));
                          }}
                          className="bg-white/15 px-1 py-0.5 rounded text-[7.5px] font-semibold" 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* Languages */}
          {resumeData.languages.length > 0 && (
            <div className="space-y-2 border-t border-white/20 pt-3">
              <span className="font-bold text-[9px] block tracking-wide">LANGUAGES</span>
              <div className="space-y-1 text-[8px]">
                {resumeData.languages.map(l => (
                  <div key={l.id} className="flex justify-between items-center">
                    <EditableText value={l.name} onSave={(val) => updateLang(l.id, 'name', val)} />
                    <EditableText value={l.proficiency} onSave={(val) => updateLang(l.id, 'proficiency', val)} className="opacity-75 italic" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
 
        {/* Right Main Content (2 cols) */}
        <div className="col-span-2 p-8 space-y-5 bg-white text-slate-850" style={{ padding: `${resumeStyle.marginSize}pt` }}>
          {resumeData.personalInfo.summary && (
            <div>
              {renderSectionHeader('Profile')}
              <EditableText tagName="p" value={resumeData.personalInfo.summary} onSave={(val) => handlePersonalInfoChange('summary', val)} className="text-[9px] text-slate-700 leading-relaxed" />
            </div>
          )}
 
          {/* Experience with Creative Timeline Dot */}
          {resumeData.workExperience.length > 0 && (
            <div>
              {renderSectionHeader('Professional History')}
              <div className="space-y-4 relative border-l border-slate-200 ml-1.5 pl-4">
                {resumeData.workExperience.map(job => (
                  <div key={job.id} className="text-[8.5px] relative">
                    <div 
                      className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: resumeStyle.colorPalette.primary }}
                    />
                    <div className="flex justify-between font-bold text-[9px]">
                      <EditableText value={job.company} onSave={(val) => updateWork(job.id, 'company', val)} style={{ color: resumeStyle.colorPalette.primary }} />
                      <span className="text-slate-500 font-normal flex gap-1">
                        <EditableText value={job.startDate} onSave={(val) => updateWork(job.id, 'startDate', val)} />
                        —
                        <EditableText value={job.endDate} onSave={(val) => updateWork(job.id, 'endDate', val)} />
                      </span>
                    </div>
                    <div className="flex justify-between italic mb-1">
                      <EditableText value={job.position} onSave={(val) => updateWork(job.id, 'position', val)} />
                      <EditableText value={job.location} onSave={(val) => updateWork(job.id, 'location', val)} className="font-normal not-italic text-slate-400" />
                    </div>
                    {renderBullets(job.description, (newBullets) => {
                      setResumeData(prev => ({
                        ...prev,
                        workExperience: prev.workExperience.map(w => w.id === job.id ? { ...w, description: newBullets } : w)
                      }));
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* Projects */}
          {resumeData.projects.length > 0 && (
            <div>
              {renderSectionHeader('Key Projects')}
              <div className="space-y-3.5">
                {resumeData.projects.map(proj => (
                  <div key={proj.id} className="text-[8.5px]">
                    <div className="flex justify-between font-bold text-[9px]">
                      <EditableText value={proj.name} onSave={(val) => updateProj(proj.id, 'name', val)} />
                      {proj.link && (
                        <EditableText value={proj.link} onSave={(val) => updateProj(proj.id, 'link', val)} className="text-indigo-650 font-normal" />
                      )}
                    </div>
                    <div className="flex justify-between italic mb-1">
                      <EditableText value={proj.role} onSave={(val) => updateProj(proj.id, 'role', val)} className="text-slate-500" />
                      <span className="text-slate-400 font-normal text-[7.5px] not-italic flex gap-0.5">
                        [
                        <EditableText value={proj.technologies.join(', ')} onSave={(val) => updateProj(proj.id, 'technologies', val.split(',').map(t => t.trim()).filter(Boolean))} />
                        ]
                      </span>
                    </div>
                    {renderBullets(proj.description, (newBullets) => {
                      setResumeData(prev => ({
                        ...prev,
                        projects: prev.projects.map(p => p.id === proj.id ? { ...p, description: newBullets } : p)
                      }));
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* Education */}
          {resumeData.education.length > 0 && (
            <div>
              {renderSectionHeader('Education')}
              <div className="space-y-2">
                {resumeData.education.map(edu => (
                  <div key={edu.id} className="text-[8.5px]">
                    <div className="flex justify-between font-bold text-[9px]">
                      <EditableText value={edu.institution} onSave={(val) => updateEdu(edu.id, 'institution', val)} />
                      <span className="text-slate-500 font-normal flex gap-1">
                        <EditableText value={edu.startDate} onSave={(val) => updateEdu(edu.id, 'startDate', val)} />
                        —
                        <EditableText value={edu.endDate} onSave={(val) => updateEdu(edu.id, 'endDate', val)} />
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <EditableText value={edu.degree} onSave={(val) => updateEdu(edu.id, 'degree', val)} />
                      <span>in</span>
                      <EditableText value={edu.major} onSave={(val) => updateEdu(edu.id, 'major', val)} />
                      {edu.gpa && (
                        <span className="flex gap-0.5">
                          (GPA: <EditableText value={edu.gpa} onSave={(val) => updateEdu(edu.id, 'gpa', val)} />)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 4. EXECUTIVE BOXED LAYOUT RENDERER
  const renderExecutiveLayout = () => {
    return (
      <div className="space-y-4 font-serif text-[9.5px]">
        {/* Framed Header Box */}
        <div className="flex flex-col items-center border border-double p-4 text-center" style={{ borderColor: resumeStyle.colorPalette.primary, borderWidth: '3px' }}>
          {resumeData.personalInfo.photoUrl && <div className="mb-2">{renderPhoto("w-14 h-14 border")}</div>}
          <EditableText tagName="h2" value={resumeData.personalInfo.fullName} onSave={(val) => handlePersonalInfoChange('fullName', val)} className="text-xl font-bold uppercase tracking-widest" style={{ color: resumeStyle.colorPalette.primary }} />
          <EditableText tagName="div" value={resumeData.personalInfo.title} onSave={(val) => handlePersonalInfoChange('title', val)} className="text-[8.5px] uppercase tracking-wider font-semibold opacity-90 mt-1" style={{ color: resumeStyle.colorPalette.secondary }} />
          <div className="flex flex-wrap gap-2 text-[8px] mt-2 justify-center" style={{ color: resumeStyle.colorPalette.text }}>
            {resumeData.personalInfo.email && <EditableText value={resumeData.personalInfo.email} onSave={(val) => handlePersonalInfoChange('email', val)} />}
            {resumeData.personalInfo.phone && <span>| <EditableText value={resumeData.personalInfo.phone} onSave={(val) => handlePersonalInfoChange('phone', val)} /></span>}
            {resumeData.personalInfo.location && <span>| <EditableText value={resumeData.personalInfo.location} onSave={(val) => handlePersonalInfoChange('location', val)} /></span>}
            {resumeData.personalInfo.website && <span>| <EditableText value={resumeData.personalInfo.website} onSave={(val) => handlePersonalInfoChange('website', val)} /></span>}
          </div>
        </div>

        {/* Profile Summary */}
        {resumeData.personalInfo.summary && (
          <div>
            {renderSectionHeader('Executive Summary')}
            <EditableText tagName="p" value={resumeData.personalInfo.summary} onSave={(val) => handlePersonalInfoChange('summary', val)} className="text-[9px] leading-relaxed text-justify" style={{ color: resumeStyle.colorPalette.text }} />
          </div>
        )}

        {/* Experience */}
        {renderExperienceSection('Executive')}

        {/* Education */}
        {renderEducationSection('Executive')}

        {/* Projects */}
        {renderProjectsSection('Executive')}

        {/* Skills */}
        {renderSkillsSection('Executive')}
      </div>
    );
  };

  // 5. TECH TIMELINE LAYOUT RENDERER
  const renderTimelineLayout = () => {
    return (
      <div className="font-mono text-[8.5px] space-y-4">
        {/* Monospace monoline Header */}
        <div className="flex justify-between items-start pb-3 border-b" style={{ borderColor: resumeStyle.colorPalette.border }}>
          <div>
            <div className="text-indigo-400 font-bold mb-1">&lt;resume_data&gt;</div>
            <EditableText tagName="h2" value={resumeData.personalInfo.fullName} onSave={(val) => handlePersonalInfoChange('fullName', val)} className="text-xl font-bold" style={{ color: resumeStyle.colorPalette.primary }} />
            <EditableText tagName="div" value={resumeData.personalInfo.title} onSave={(val) => handlePersonalInfoChange('title', val)} className="text-xs italic" style={{ color: resumeStyle.colorPalette.secondary }} />
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[8.5px] mt-1.5" style={{ color: resumeStyle.colorPalette.muted }}>
              <span>email: <EditableText value={resumeData.personalInfo.email} onSave={(val) => handlePersonalInfoChange('email', val)} /></span>
              <span>phone: <EditableText value={resumeData.personalInfo.phone} onSave={(val) => handlePersonalInfoChange('phone', val)} /></span>
              <span>loc: <EditableText value={resumeData.personalInfo.location} onSave={(val) => handlePersonalInfoChange('location', val)} /></span>
            </div>
          </div>
          {resumeData.personalInfo.photoUrl && renderPhoto("w-12 h-12 border")}
        </div>

        {/* Experience timeline */}
        {resumeData.workExperience.length > 0 && (
          <div>
            {renderSectionHeader('experience_timeline')}
            <div className="space-y-4 relative border-l border-indigo-500/30 ml-2 pl-4">
              {resumeData.workExperience.map(job => (
                <div key={job.id} className="relative text-[8.5px]">
                  <div className="absolute -left-[20.5px] top-1 w-2 h-2 rounded-full bg-indigo-500" />
                  <div className="flex justify-between font-bold">
                    <EditableText value={job.company} onSave={(val) => updateWork(job.id, 'company', val)} style={{ color: resumeStyle.colorPalette.primary }} />
                    <span style={{ color: resumeStyle.colorPalette.muted }} className="font-normal flex gap-1">
                      <EditableText value={job.startDate} onSave={(val) => updateWork(job.id, 'startDate', val)} />
                      ~
                      <EditableText value={job.endDate} onSave={(val) => updateWork(job.id, 'endDate', val)} />
                    </span>
                  </div>
                  <div className="italic mb-1">
                    <EditableText value={job.position} onSave={(val) => updateWork(job.id, 'position', val)} />
                    <span> [</span>
                    <EditableText value={job.location} onSave={(val) => updateWork(job.id, 'location', val)} />
                    <span>]</span>
                  </div>
                  {renderBullets(job.description, (newBullets) => {
                    setResumeData(prev => ({
                      ...prev,
                      workExperience: prev.workExperience.map(w => w.id === job.id ? { ...w, description: newBullets } : w)
                    }));
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {renderEducationSection('Timeline')}

        {/* Skills */}
        {renderSkillsSection('Timeline')}
      </div>
    );
  };

  // 6. MINIMALIST LAYOUT RENDERER
  const renderMinimalistLayout = () => {
    return (
      <div className="space-y-5 text-[9px] tracking-wide font-sans">
        {/* Simple Minimalist Header */}
        <div className="flex gap-4 items-center pb-4">
          {resumeData.personalInfo.photoUrl && renderPhoto("w-14 h-14 border")}
          <div>
            <EditableText tagName="h2" value={resumeData.personalInfo.fullName} onSave={(val) => handlePersonalInfoChange('fullName', val)} className="text-2xl font-light tracking-widest uppercase" style={{ color: resumeStyle.colorPalette.primary }} />
            <EditableText tagName="div" value={resumeData.personalInfo.title} onSave={(val) => handlePersonalInfoChange('title', val)} className="text-[10px] tracking-widest uppercase opacity-75 mt-0.5" style={{ color: resumeStyle.colorPalette.secondary }} />
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[8.5px] mt-2" style={{ color: resumeStyle.colorPalette.muted }}>
              <EditableText value={resumeData.personalInfo.email} onSave={(val) => handlePersonalInfoChange('email', val)} />
              <span>•</span>
              <EditableText value={resumeData.personalInfo.phone} onSave={(val) => handlePersonalInfoChange('phone', val)} />
              <span>•</span>
              <EditableText value={resumeData.personalInfo.location} onSave={(val) => handlePersonalInfoChange('location', val)} />
            </div>
          </div>
        </div>

        {/* Experience */}
        {resumeData.workExperience.length > 0 && (
          <div>
            {renderSectionHeader('Work')}
            <div className="space-y-4 mt-2">
              {resumeData.workExperience.map(job => (
                <div key={job.id} className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 text-right font-medium text-[8px]" style={{ color: resumeStyle.colorPalette.secondary }}>
                    <EditableText value={job.company} onSave={(val) => updateWork(job.id, 'company', val)} />
                    <div className="text-[7.5px] text-slate-400 mt-0.5 flex justify-end gap-1">
                      <EditableText value={job.startDate} onSave={(val) => updateWork(job.id, 'startDate', val)} />
                      —
                      <EditableText value={job.endDate} onSave={(val) => updateWork(job.id, 'endDate', val)} />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <EditableText tagName="div" value={job.position} onSave={(val) => updateWork(job.id, 'position', val)} className="font-bold text-[8.5px]" style={{ color: resumeStyle.colorPalette.text }} />
                    {renderBullets(job.description, (newBullets) => {
                      setResumeData(prev => ({
                        ...prev,
                        workExperience: prev.workExperience.map(w => w.id === job.id ? { ...w, description: newBullets } : w)
                      }));
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div>
            {renderSectionHeader('Education')}
            <div className="space-y-3 mt-2">
              {resumeData.education.map(edu => (
                <div key={edu.id} className="grid grid-cols-4 gap-4">
                  <div className="col-span-1 text-right text-[8px] flex justify-end gap-1" style={{ color: resumeStyle.colorPalette.muted }}>
                    <EditableText value={edu.startDate} onSave={(val) => updateEdu(edu.id, 'startDate', val)} />
                    —
                    <EditableText value={edu.endDate} onSave={(val) => updateEdu(edu.id, 'endDate', val)} />
                  </div>
                  <div className="col-span-3">
                    <EditableText tagName="div" value={edu.institution} onSave={(val) => updateEdu(edu.id, 'institution', val)} className="font-bold text-[8.5px]" style={{ color: resumeStyle.colorPalette.text }} />
                    <div className="italic text-slate-500 flex gap-1">
                      <EditableText value={edu.degree} onSave={(val) => updateEdu(edu.id, 'degree', val)} />
                      <span>in</span>
                      <EditableText value={edu.major} onSave={(val) => updateEdu(edu.id, 'major', val)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {renderSkillsSection('Minimalist')}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-45">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <ChevronLeft className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
            <span className="font-bold tracking-tight text-slate-350 hover:text-white transition-colors">Home</span>
          </Link>
          <span className="text-slate-800">|</span>
          <h1 className="text-lg font-bold text-slate-200">Resume Builder Workspace</h1>
        </div>
        
        {/* Workspace Actions */}
        <div className="flex items-center gap-3">
          {/* Preset Select Dropdown */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Sliders className="h-4 w-4 text-indigo-400" />
            <select 
              id="style-preset-selector"
              className="bg-transparent text-sm text-slate-350 focus:outline-none cursor-pointer"
              onChange={(e) => applyPreset(STYLE_PRESETS[parseInt(e.target.value)].style)}
            >
              {STYLE_PRESETS.map((preset, idx) => (
                <option key={preset.name} value={idx} className="bg-slate-950 text-slate-300">
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setIsAiConfigOpen(!isAiConfigOpen)}
            id="ai-settings-toggle"
            className="flex items-center gap-1.5 text-xs text-slate-350 hover:text-white border border-slate-800 bg-slate-900/60 hover:bg-slate-900 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI Config</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            id="download-pdf-button"
            disabled={isDownloading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            {isDownloading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{isDownloading ? 'Compiling...' : 'Download PDF'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-grow grid grid-cols-1 xl:grid-cols-12 overflow-hidden h-[calc(100vh-65px)]">
        
        {/* Left Side: Input Form Editor (5 cols) */}
        <section id="form-editor-panel" className="xl:col-span-4 border-r border-slate-900 bg-slate-950 flex flex-col h-full overflow-hidden">
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-slate-900 overflow-x-auto whitespace-nowrap scrollbar-thin">
            {[
              { id: 'personal', label: 'Contact', icon: User },
              { id: 'experience', label: 'Work', icon: Briefcase },
              { id: 'education', label: 'Education', icon: GraduationCap },
              { id: 'projects', label: 'Projects', icon: Terminal },
              { id: 'skills', label: 'Skills', icon: Sliders },
              { id: 'certifications', label: 'Certs', icon: Award },
              { id: 'languages', label: 'Langs', icon: Languages },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFormSection(tab.id as any)}
                className={`px-4 py-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeFormSection === tab.id
                    ? 'border-indigo-500 text-indigo-400 bg-slate-900/10'
                    : 'border-transparent text-slate-500 hover:text-slate-350 hover:bg-slate-900/5'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Scroll Area */}
          <div className="flex-grow overflow-y-auto p-5 space-y-6">
            
            {/* 1. PERSONAL INFO SECTION */}
            {activeFormSection === 'personal' && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-sm font-bold text-slate-400 border-b border-slate-900 pb-2">Contact Details</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Full Name</label>
                    <input 
                      type="text" 
                      value={resumeData.personalInfo.fullName}
                      onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                      className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Professional Title</label>
                    <input 
                      type="text" 
                      value={resumeData.personalInfo.title}
                      onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
                      className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Email Address</label>
                    <input 
                      type="email" 
                      value={resumeData.personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Phone Number</label>
                    <input 
                      type="text" 
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Location (City, State)</label>
                    <input 
                      type="text" 
                      value={resumeData.personalInfo.location}
                      onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                      className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Portfolio Website</label>
                    <input 
                      type="url" 
                      value={resumeData.personalInfo.website}
                      onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                      className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">LinkedIn URL</label>
                    <input 
                      type="url" 
                      value={resumeData.personalInfo.linkedin}
                      onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                      className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">GitHub Profile URL</label>
                    <input 
                      type="url" 
                      value={resumeData.personalInfo.github}
                      onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                      className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Profile Photo</label>
                  <div className="flex items-center gap-4 mt-1 bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                    {resumeData.personalInfo.photoUrl ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-750 bg-slate-900 group shrink-0">
                        <img 
                          src={resumeData.personalInfo.photoUrl} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handlePersonalInfoChange('photoUrl', '')}
                          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-rose-400 font-bold transition-opacity cursor-pointer border-0"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full border border-dashed border-slate-850 bg-slate-950 flex items-center justify-center text-slate-600 text-[10px] font-bold shrink-0">
                        NO PHOTO
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              handlePersonalInfoChange('photoUrl', reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 file:cursor-pointer"
                      />
                      <span className="text-[9px] text-slate-500">Supports PNG, JPG. Max 500KB recommended.</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Professional Summary</label>
                  <textarea 
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                    rows={4}
                    className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* 2. WORK EXPERIENCE SECTION */}
            {activeFormSection === 'experience' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h2 className="text-sm font-bold text-slate-400">Work Experience</h2>
                  <button 
                    onClick={addWork}
                    className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Job</span>
                  </button>
                </div>

                {resumeData.workExperience.map((job) => (
                  <div key={job.id} className="border border-slate-850 bg-slate-900/20 rounded-xl overflow-hidden">
                    {/* Collapsible Header */}
                    <div 
                      onClick={() => toggleExpandWork(job.id)}
                      className="flex items-center justify-between px-4 py-3 bg-slate-900/50 cursor-pointer hover:bg-slate-900/80 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{job.company || 'New Company'}</span>
                        <span className="text-[10px] text-slate-500">{job.position || 'New Position'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWork(job.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {expandedWork[job.id] ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                      </div>
                    </div>

                    {/* Collapsible Body */}
                    {expandedWork[job.id] && (
                      <div className="p-4 border-t border-slate-850/80 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Company</label>
                            <input 
                              type="text" 
                              value={job.company}
                              onChange={(e) => updateWork(job.id, 'company', e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Job Title</label>
                            <input 
                              type="text" 
                              value={job.position}
                              onChange={(e) => updateWork(job.id, 'position', e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Location</label>
                            <input 
                              type="text" 
                              value={job.location}
                              onChange={(e) => updateWork(job.id, 'location', e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Dates (e.g. 2021-08)</label>
                            <div className="flex gap-2 items-center">
                              <input 
                                type="text" 
                                placeholder="Start"
                                value={job.startDate}
                                onChange={(e) => updateWork(job.id, 'startDate', e.target.value)}
                                className="bg-slate-900 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none w-1/2"
                              />
                              {!job.current && (
                                <input 
                                  type="text" 
                                  placeholder="End"
                                  value={job.endDate}
                                  onChange={(e) => updateWork(job.id, 'endDate', e.target.value)}
                                  className="bg-slate-900 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none w-1/2"
                                />
                              )}
                              <label className="flex items-center gap-1 text-[10px] text-slate-400 whitespace-nowrap cursor-pointer">
                                <input 
                                  type="checkbox"
                                  checked={job.current}
                                  onChange={(e) => updateWork(job.id, 'current', e.target.checked)}
                                  className="rounded border-slate-850"
                                />
                                Present
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Bullet points list */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Key Contributions</span>
                            
                            {/* Local Tailor Trigger */}
                            <button
                              onClick={() => handleTriggerTailoring(job.id, 'work')}
                              disabled={isTailoring}
                              className="text-[10px] bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer disabled:bg-indigo-800/10"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>{isTailoring && tailorTargetId === job.id ? 'Optimizing...' : 'Tailor with AI'}</span>
                            </button>
                          </div>
                          
                          {job.description.map((bullet, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input 
                                type="text"
                                value={bullet}
                                onChange={(e) => updateWorkBullet(job.id, idx, e.target.value)}
                                className="bg-slate-900 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none flex-grow"
                              />
                              <button 
                                onClick={() => deleteWorkBullet(job.id, idx)}
                                className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addWorkBullet(job.id)}
                            className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer mt-1"
                          >
                            <Plus className="h-3 w-3" /> Add Bullet Point
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 3. EDUCATION SECTION */}
            {activeFormSection === 'education' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h2 className="text-sm font-bold text-slate-400">Education</h2>
                  <button 
                    onClick={addEdu}
                    className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add School</span>
                  </button>
                </div>

                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="border border-slate-850 bg-slate-900/20 rounded-xl overflow-hidden">
                    <div 
                      onClick={() => toggleExpandEdu(edu.id)}
                      className="flex items-center justify-between px-4 py-3 bg-slate-900/50 cursor-pointer hover:bg-slate-900/80 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{edu.institution || 'New Institution'}</span>
                        <span className="text-[10px] text-slate-500">{edu.degree || 'New Degree'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEdu(edu.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {expandedEdu[edu.id] ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                      </div>
                    </div>

                    {expandedEdu[edu.id] && (
                      <div className="p-4 border-t border-slate-850/80 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Institution</label>
                            <input 
                              type="text" 
                              value={edu.institution}
                              onChange={(e) => updateEdu(edu.id, 'institution', e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Location</label>
                            <input 
                              type="text" 
                              value={edu.location}
                              onChange={(e) => updateEdu(edu.id, 'location', e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Degree & Major</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Degree (e.g. BS)"
                                value={edu.degree}
                                onChange={(e) => updateEdu(edu.id, 'degree', e.target.value)}
                                className="bg-slate-900 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none w-1/3"
                              />
                              <input 
                                type="text" 
                                placeholder="Major (e.g. Computer Science)"
                                value={edu.major}
                                onChange={(e) => updateEdu(edu.id, 'major', e.target.value)}
                                className="bg-slate-900 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none w-2/3"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">GPA (Optional)</label>
                            <input 
                              type="text" 
                              placeholder="3.8/4.0"
                              value={edu.gpa || ''}
                              onChange={(e) => updateEdu(edu.id, 'gpa', e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Start Date</label>
                            <input 
                              type="text" 
                              placeholder="2016-09"
                              value={edu.startDate}
                              onChange={(e) => updateEdu(edu.id, 'startDate', e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">End Date</label>
                            <input 
                              type="text" 
                              placeholder="2020-05"
                              value={edu.endDate}
                              onChange={(e) => updateEdu(edu.id, 'endDate', e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Honors or Details (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="Graduated with honors. Specialization in distributed systems."
                            value={edu.details || ''}
                            onChange={(e) => updateEdu(edu.id, 'details', e.target.value)}
                            className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 4. PROJECTS SECTION */}
            {activeFormSection === 'projects' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h2 className="text-sm font-bold text-slate-400">Key Projects</h2>
                  <button 
                    onClick={addProj}
                    className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {resumeData.projects.map((proj) => (
                  <div key={proj.id} className="border border-slate-850 bg-slate-900/20 rounded-xl overflow-hidden">
                    <div 
                      onClick={() => toggleExpandProj(proj.id)}
                      className="flex items-center justify-between px-4 py-3 bg-slate-900/50 cursor-pointer hover:bg-slate-900/80 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{proj.name || 'New Project'}</span>
                        <span className="text-[10px] text-slate-500">{proj.role || 'New Role'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProj(proj.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {expandedProj[proj.id] ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                      </div>
                    </div>

                    {expandedProj[proj.id] && (
                      <div className="p-4 border-t border-slate-850/80 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Project Name</label>
                            <input 
                              type="text" 
                              value={proj.name}
                              onChange={(e) => updateProj(proj.id, 'name', e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Link URL</label>
                            <input 
                              type="url" 
                              value={proj.link}
                              onChange={(e) => updateProj(proj.id, 'link', e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Your Role</label>
                            <input 
                              type="text" 
                              value={proj.role}
                              onChange={(e) => updateProj(proj.id, 'role', e.target.value)}
                              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] uppercase font-bold text-slate-500">Technologies (comma separated)</label>
                            <input 
                              type="text" 
                              value={proj.technologies.join(', ')}
                              onChange={(e) => updateProj(proj.id, 'technologies', e.target.value.split(',').map(s => s.trim()))}
                              className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Bullet points */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Project Highlights</span>
                            
                            {/* Local Tailor Trigger */}
                            <button
                              onClick={() => handleTriggerTailoring(proj.id, 'proj')}
                              disabled={isTailoring}
                              className="text-[10px] bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer disabled:bg-indigo-800/10"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>{isTailoring && tailorTargetId === proj.id ? 'Optimizing...' : 'Tailor with AI'}</span>
                            </button>
                          </div>
                          {proj.description.map((bullet, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input 
                                type="text"
                                value={bullet}
                                onChange={(e) => updateProjBullet(proj.id, idx, e.target.value)}
                                className="bg-slate-900 border border-slate-850 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none flex-grow"
                              />
                              <button 
                                onClick={() => deleteProjBullet(proj.id, idx)}
                                className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addProjBullet(proj.id)}
                            className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer mt-1"
                          >
                            <Plus className="h-3 w-3" /> Add Highlight Bullet
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 5. SKILLS SECTION */}
            {activeFormSection === 'skills' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h2 className="text-sm font-bold text-slate-400">Technical Skills</h2>
                  <button 
                    onClick={addSkillCategory}
                    className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Category</span>
                  </button>
                </div>

                {resumeData.skills.map((skillCat) => (
                  <div key={skillCat.id} className="border border-slate-850 p-4 rounded-xl space-y-3 bg-slate-900/10">
                    <div className="flex gap-2 items-center justify-between">
                      <input 
                        type="text" 
                        placeholder="Category Name (e.g. Languages)"
                        value={skillCat.category}
                        onChange={(e) => updateSkillCategory(skillCat.id, e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:border-indigo-500 focus:outline-none w-3/4"
                      />
                      <button 
                        onClick={() => deleteSkillCategory(skillCat.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Skills list (comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="TypeScript, JavaScript, Python, Rust"
                        value={skillCat.skills.join(', ')}
                        onChange={(e) => updateSkillsList(skillCat.id, e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 6. CERTIFICATIONS SECTION */}
            {activeFormSection === 'certifications' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h2 className="text-sm font-bold text-slate-400">Certifications</h2>
                  <button 
                    onClick={addCert}
                    className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Certificate</span>
                  </button>
                </div>

                {resumeData.certifications.map((cert) => (
                  <div key={cert.id} className="border border-slate-850 p-4 rounded-xl space-y-3 bg-slate-900/10 flex flex-col">
                    <div className="flex gap-2 justify-between items-start">
                      <div className="flex-grow space-y-2">
                        <input 
                          type="text" 
                          placeholder="Certification Name"
                          value={cert.name}
                          onChange={(e) => updateCert(cert.id, 'name', e.target.value)}
                          className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none w-full font-semibold"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            placeholder="Issuer (e.g. AWS)"
                            value={cert.issuer}
                            onChange={(e) => updateCert(cert.id, 'issuer', e.target.value)}
                            className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                          />
                          <input 
                            type="text" 
                            placeholder="Date (e.g. 2024-02)"
                            value={cert.date}
                            onChange={(e) => updateCert(cert.id, 'date', e.target.value)}
                            className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteCert(cert.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 cursor-pointer mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 7. LANGUAGES SECTION */}
            {activeFormSection === 'languages' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h2 className="text-sm font-bold text-slate-400">Languages</h2>
                  <button 
                    onClick={addLang}
                    className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Language</span>
                  </button>
                </div>

                {resumeData.languages.map((lang) => (
                  <div key={lang.id} className="border border-slate-850 p-4 rounded-xl flex justify-between items-center bg-slate-900/10">
                    <div className="flex gap-2 w-3/4">
                      <input 
                        type="text" 
                        placeholder="Language"
                        value={lang.name}
                        onChange={(e) => updateLang(lang.id, 'name', e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none w-1/2 font-semibold"
                      />
                      <input 
                        type="text" 
                        placeholder="Proficiency (e.g. Native)"
                        value={lang.proficiency}
                        onChange={(e) => updateLang(lang.id, 'proficiency', e.target.value)}
                        className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none w-1/2"
                      />
                    </div>
                    <button 
                      onClick={() => deleteLang(lang.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </section>

        {/* Center: Live Resume Preview (5 cols) */}
        <section id="preview-panel" className="xl:col-span-5 border-r border-slate-900 bg-slate-900/15 flex flex-col h-full overflow-hidden">
          {/* Top Tabs */}
          <div className="flex border-b border-slate-900 px-4 py-2 justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-slate-900 border border-slate-850 text-indigo-400'
                    : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Visual Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('latex')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'latex'
                    ? 'bg-slate-900 border border-slate-850 text-indigo-400'
                    : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                <Code className="h-3.5 w-3.5" />
                <span>LaTeX Code</span>
              </button>
            </div>
            
            <div className="text-[10px] text-slate-500 font-medium select-none">
              Auto-saved locally
            </div>
          </div>

          {/* Render Area */}
          <div className="flex-grow overflow-y-auto p-6 flex justify-center items-start scrollbar-thin">
            {activeTab === 'preview' ? (
              <div 
                className="letter-page resume-preview-container animate-fade-in shadow-2xl origin-top transition-all duration-300 overflow-hidden"
                style={{
                  fontFamily: resumeStyle.fontFamily === 'serif' ? 'Georgia, serif' : resumeStyle.fontFamily === 'mono' ? 'Courier, monospace' : 'sans-serif',
                  padding: resumeStyle.layoutStyle === 'creative' ? '0px' : `${resumeStyle.marginSize}pt`,
                  color: resumeStyle.colorPalette.text,
                  backgroundColor: resumeStyle.colorPalette.background,
                  fontSize: `${resumeStyle.fontSizeBase}pt`,
                  lineHeight: resumeStyle.spacing === 'compact' ? '1.2' : resumeStyle.spacing === 'comfortable' ? '1.5' : '1.35'
                }}
              >
                {resumeStyle.layoutStyle === 'academic' ? (
                  renderAcademicLayout()
                ) : resumeStyle.layoutStyle === 'creative' ? (
                  renderCreativeLayout()
                ) : resumeStyle.layoutStyle === 'executive' ? (
                  renderExecutiveLayout()
                ) : resumeStyle.layoutStyle === 'timeline' ? (
                  renderTimelineLayout()
                ) : resumeStyle.layoutStyle === 'minimalist' ? (
                  renderMinimalistLayout()
                ) : (
                  renderModernLayout()
                )}
              </div>
            ) : (
              <div className="w-full h-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col font-mono text-xs text-slate-350 relative animate-fade-in">
                {/* Code actions bar */}
                <div className="flex justify-between border-b border-slate-800 pb-2 mb-3 items-center">
                  <span className="text-[10px] text-slate-500">Overleaf Compatible LaTeX</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCopyLatex}
                      className="hover:text-white flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded border border-slate-850 hover:border-slate-750 transition-all cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </button>
                    <button 
                      onClick={handleDownloadLatex}
                      className="hover:text-white flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded border border-slate-850 hover:border-slate-750 transition-all cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      <span>.tex</span>
                    </button>
                  </div>
                </div>
                {/* Textarea representation of LaTeX Code */}
                <textarea
                  readOnly
                  value={generateResumeLatex(resumeData, resumeStyle)}
                  className="flex-grow bg-slate-950/60 p-3 rounded-lg border border-slate-850 focus:outline-none text-[11px] font-mono text-slate-300 resize-none h-full"
                />
              </div>
            )}
          </div>
        </section>

        {/* Right Side: ATS Scan & AI Customizer Drawer (3 cols) */}
        <section id="ai-assistant-panel" className="xl:col-span-3 bg-slate-950 flex flex-col h-full overflow-hidden border-l xl:border-l-0 border-t xl:border-t-0 border-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-900 px-5 py-4">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-200">Local AI Assistant</h2>
          </div>

          <div className="flex-grow overflow-y-auto p-5 space-y-6 scrollbar-thin">
            
            {/* Job Description Box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Target Job Description</label>
                {jobDescription && (
                  <button 
                    onClick={() => setJobDescription('')}
                    className="text-[9px] text-slate-500 hover:text-slate-350 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                placeholder="Paste the target job description here to enable ATS scoring and tailored bullet recommendations..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={5}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
              />
              <button
                onClick={handleATSScan}
                disabled={isAnalyzing || !jobDescription}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/60 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:text-slate-400"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span>{isAnalyzing ? 'Scanning Job Details...' : 'Scan ATS Keywords & Score'}</span>
              </button>
            </div>

            {/* ATS Score Display */}
            {atsResult && (
              <div className="border border-slate-850 bg-slate-900/15 p-4 rounded-xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">ATS Match Report</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    atsResult.matchLevel === 'High' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : atsResult.matchLevel === 'Medium' 
                        ? 'bg-amber-500/10 text-amber-400' 
                        : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {atsResult.matchLevel} Match
                  </span>
                </div>

                {/* Score Circle */}
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-slate-800">
                    <span className="text-lg font-black text-slate-200">{atsResult.score}%</span>
                    {/* Circle SVG */}
                    <svg className="absolute top-[-4px] left-[-4px] w-16 h-16 transform -rotate-90">
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        fill="transparent" 
                        stroke={atsResult.score > 75 ? '#10b981' : atsResult.score > 45 ? '#f59e0b' : '#ef4444'} 
                        strokeWidth="4" 
                        strokeDasharray="175" 
                        strokeDashoffset={175 - (175 * atsResult.score) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <div className="text-xs text-slate-400 flex-grow">
                    Scan identifies matching qualifications and key missing keywords. Review suggestions below to boost score.
                  </div>
                </div>

                {/* Matched Keywords */}
                {atsResult.matchedKeywords.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase font-bold text-slate-500">Matched Skills ({atsResult.matchedKeywords.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {atsResult.matchedKeywords.map((kw, i) => (
                        <span key={i} className="text-[9px] bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {atsResult.missingKeywords.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[9px] uppercase font-bold text-slate-500">Missing Keywords ({atsResult.missingKeywords.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {atsResult.missingKeywords.map((kw, i) => (
                        <span key={i} className="text-[9px] bg-rose-500/5 border border-rose-500/20 text-rose-450 px-1.5 py-0.5 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="space-y-1.5 border-t border-slate-900 pt-3">
                  <div className="text-[9px] uppercase font-bold text-slate-500">Key Recommendations</div>
                  <ul className="list-disc pl-3.5 space-y-1.5 text-xs text-slate-400">
                    {atsResult.recommendations.map((rec, i) => (
                      <li key={i} className="leading-relaxed">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Layout Customizer Quick Options (Inside AI bar or layout accordion) */}
            <div className="border border-slate-900 p-4 rounded-xl space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                <span>Layout Settings</span>
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase font-bold text-slate-650">Column Structure</span>
                  <select 
                    value={resumeStyle.layoutType}
                    onChange={(e) => updateStyle('layoutType', e.target.value)}
                    className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-slate-350 focus:outline-none"
                  >
                    <option value="single-column">Single Column</option>
                    <option value="two-column-left">Left Sidebar</option>
                    <option value="two-column-right">Right Sidebar</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase font-bold text-slate-650">Typography</span>
                  <select 
                    value={resumeStyle.fontFamily}
                    onChange={(e) => updateStyle('fontFamily', e.target.value)}
                    className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-slate-350 focus:outline-none"
                  >
                    <option value="sans">Geist Sans</option>
                    <option value="serif">Lora Serif</option>
                    <option value="mono">Fira Mono</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase font-bold text-slate-650">Page Margin Size</span>
                  <select 
                    value={resumeStyle.marginSize}
                    onChange={(e) => updateStyle('marginSize', parseInt(e.target.value))}
                    className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-slate-350 focus:outline-none"
                  >
                    <option value={36}>0.50 in (Narrow)</option>
                    <option value={45}>0.62 in (Cozy)</option>
                    <option value={54}>0.75 in (Normal)</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] uppercase font-bold text-slate-650">Spacing Density</span>
                  <select 
                    value={resumeStyle.spacing}
                    onChange={(e) => updateStyle('spacing', e.target.value)}
                    className="bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1.5 text-slate-350 focus:outline-none"
                  >
                    <option value="compact">Compact</option>
                    <option value="cozy">Cozy</option>
                    <option value="comfortable">Comfortable</option>
                  </select>
                </div>
              </div>

              {/* Color Swatch Picker */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-650">Brand Accent Color</span>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTES.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => updatePalette(palette)}
                      style={{ backgroundColor: palette.primary }}
                      title={palette.name}
                      className={`w-6 h-6 rounded-full border transition-transform cursor-pointer hover:scale-110 active:scale-95 ${
                        resumeStyle.colorPalette.id === palette.id
                          ? 'border-white scale-105 shadow-md shadow-indigo-600/20'
                          : 'border-slate-850'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* AI Settings Modal */}
      {isAiConfigOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setIsAiConfigOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Settings className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-200">Local LLM Configuration</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-slate-400">Select Provider</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAiProvider('chrome')}
                    disabled={!chromeAIAvailable}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      aiProvider === 'chrome'
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                        : 'bg-slate-950 border-slate-850 text-slate-450 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    Chrome AI (Nano)
                  </button>
                  <button
                    onClick={() => setAiProvider('ollama')}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      aiProvider === 'ollama'
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                        : 'bg-slate-950 border-slate-850 text-slate-450 hover:bg-slate-900'
                    }`}
                  >
                    Ollama Local
                  </button>
                </div>
                {!chromeAIAvailable && aiProvider === 'chrome' && (
                  <p className="text-[10px] text-slate-500">Chrome Built-in AI not detected on this browser. Use Ollama instead.</p>
                )}
              </div>

              {aiProvider === 'ollama' && (
                <div className="space-y-3 p-3 bg-slate-950 border border-slate-850 rounded-xl">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-400">Ollama API URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ollamaBaseUrl}
                        onChange={(e) => setOllamaBaseUrl(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none flex-grow"
                      />
                      <button
                        onClick={refreshOllama}
                        className="p-2 border border-slate-800 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-400 cursor-pointer"
                        title="Reload models list"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-400">Model Name</label>
                    {availableOllamaModels.length > 0 ? (
                      <select
                        value={ollamaModel}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-350 focus:outline-none cursor-pointer"
                      >
                        {availableOllamaModels.map(m => (
                          <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. gemma2"
                          value={ollamaModel}
                          onChange={(e) => setOllamaModel(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none flex-grow"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Check that Ollama is running at the API URL above.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Ollama Guide Details */}
              <div className="border-t border-slate-800 pt-3">
                <details className="text-slate-400 group">
                  <summary className="font-bold text-[11px] text-indigo-400 hover:underline cursor-pointer flex items-center justify-between select-none">
                    <span>How to set up Ollama (Simple & Fast)</span>
                    <HelpCircle className="h-3.5 w-3.5 inline group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="mt-2 space-y-2 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-850 text-[10px]">
                    <p>1. Download & Install <a href="https://ollama.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">Ollama</a>.</p>
                    <p>2. Open your terminal and download a model (e.g. gemma2):</p>
                    <pre className="bg-slate-900 p-1.5 rounded text-[9.5px] border border-slate-800 text-slate-300">ollama run gemma2</pre>
                    <p>3. Click the reload button above and select <code className="bg-slate-900 px-1 rounded text-slate-300">gemma2</code>.</p>
                    <p className="text-slate-500 font-semibold mt-1">No CORS setup needed: OpenResume AI routes your prompts securely via our built-in API proxy!</p>
                  </div>
                </details>
              </div>
            </div>

            <button
              onClick={() => setIsAiConfigOpen(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              Save & Close
            </button>
          </div>
        </div>
      )}

      {/* AI Tailoring Review Diff Modal */}
      {isTailorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setIsTailorModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-shrink-0">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-200">Review AI Optimization Suggestions</h3>
            </div>
            
            <p className="text-xs text-slate-400 flex-shrink-0">
              Compare the original bullet points with the keywords-tailored version. You can edit any optimized bullet before accepting.
            </p>

            <div className="flex-grow overflow-y-auto space-y-4 p-1">
              <TailorDiffList 
                original={tailorOriginalBullets} 
                suggested={tailorSuggestedBullets}
                onApply={handleApplyTailoredBullets}
                onCancel={() => setIsTailorModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent for bullet diff review list
interface TailorDiffListProps {
  original: string[];
  suggested: string[];
  onApply: (accepted: string[]) => void;
  onCancel: () => void;
}

function TailorDiffList({ original, suggested, onApply, onCancel }: TailorDiffListProps) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    // Fill suggested values, fallback to original if suggestions list is smaller
    const initialList = original.map((orig, i) => suggested[i] || orig);
    setItems(initialList);
  }, [original, suggested]);

  const handleItemChange = (idx: number, val: string) => {
    setItems(prev => {
      const updated = [...prev];
      updated[idx] = val;
      return updated;
    });
  };

  const handleApply = () => {
    onApply(items);
  };

  return (
    <div className="space-y-4">
      {original.map((orig, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-850/80 p-3 rounded-xl bg-slate-900/10">
          {/* Original Bullet */}
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-500">Original Bullet {idx + 1}</span>
            <div className="text-xs text-slate-450 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-900 min-h-[50px]">
              {orig}
            </div>
          </div>

          {/* AI Tailored Bullet (Editable) */}
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-emerald-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Optimized Suggestion (Editable)</span>
            </span>
            <textarea
              value={items[idx] || ''}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 text-xs text-slate-200 p-2.5 rounded focus:outline-none resize-none leading-relaxed min-h-[50px]"
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 flex-shrink-0">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
        >
          Accept & Apply Rewrites
        </button>
      </div>
    </div>
  );
}
