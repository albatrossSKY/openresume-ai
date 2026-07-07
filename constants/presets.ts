import { ResumeData, ResumeStyle, ColorPalette } from '../types/resume';

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'navy',
    name: 'Navy Professional',
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    background: '#ffffff',
    text: '#1f2937',
    muted: '#4b5563',
    border: '#e5e7eb',
    accent: '#eff6ff',
  },
  {
    id: 'emerald',
    name: 'Emerald Executive',
    primary: '#065f46',
    secondary: '#10b981',
    background: '#ffffff',
    text: '#1f2937',
    muted: '#4b5563',
    border: '#e5e7eb',
    accent: '#ecfdf5',
  },
  {
    id: 'slate',
    name: 'Slate Minimalist',
    primary: '#1e293b',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#0f172a',
    muted: '#475569',
    border: '#f1f5f9',
    accent: '#f8fafc',
  },
  {
    id: 'crimson',
    name: 'Crimson Bold',
    primary: '#991b1b',
    secondary: '#ef4444',
    background: '#ffffff',
    text: '#1f2937',
    muted: '#4b5563',
    border: '#e5e7eb',
    accent: '#fef2f2',
  },
  {
    id: 'amethyst',
    name: 'Royal Purple',
    primary: '#581c87',
    secondary: '#a855f7',
    background: '#ffffff',
    text: '#1f2937',
    muted: '#4b5563',
    border: '#e5e7eb',
    accent: '#faf5ff',
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    primary: '#78350f',
    secondary: '#f59e0b',
    background: '#ffffff',
    text: '#1f2937',
    muted: '#4b5563',
    border: '#e5e7eb',
    accent: '#fffbeb',
  },
  {
    id: 'teal',
    name: 'Creative Teal',
    primary: '#0f766e',
    secondary: '#14b8a6',
    background: '#ffffff',
    text: '#1f2937',
    muted: '#4b5563',
    border: '#e5e7eb',
    accent: '#f0fdfa',
  },
  {
    id: 'charcoal-dark',
    name: 'Obsidian Dark',
    primary: '#38bdf8',
    secondary: '#94a3b8',
    background: '#0f172a',
    text: '#f8fafc',
    muted: '#cbd5e1',
    border: '#1e293b',
    accent: '#1e293b',
  }
];

const STYLE_PRESETS_BASE: { name: string; style: ResumeStyle }[] = [
  {
    name: 'Modern Developer (Recommended)',
    style: {
      layoutStyle: 'modern',
      layoutType: 'two-column-right',
      fontFamily: 'sans',
      spacing: 'compact',
      headerStyle: 'left-aligned',
      sectionHeaderStyle: 'left-border',
      bulletStyle: 'disc',
      skillStyle: 'pills',
      colorPalette: COLOR_PALETTES[0], // Navy
      marginSize: 36,
      fontSizeBase: 10,
    }
  },
  {
    name: 'Classic Academic',
    style: {
      layoutStyle: 'academic',
      layoutType: 'single-column',
      fontFamily: 'serif',
      spacing: 'comfortable',
      headerStyle: 'classic-centered',
      sectionHeaderStyle: 'underline',
      bulletStyle: 'disc',
      skillStyle: 'comma-separated',
      colorPalette: COLOR_PALETTES[2], // Slate
      marginSize: 54,
      fontSizeBase: 11,
    }
  },
  {
    name: 'Creative Executive',
    style: {
      layoutStyle: 'creative',
      layoutType: 'two-column-left',
      fontFamily: 'sans',
      spacing: 'cozy',
      headerStyle: 'modern-split',
      sectionHeaderStyle: 'pill',
      bulletStyle: 'square',
      skillStyle: 'pills',
      colorPalette: COLOR_PALETTES[1], // Emerald
      marginSize: 45,
      fontSizeBase: 10.5,
    }
  },
  {
    name: 'Amber Minimalist',
    style: {
      layoutStyle: 'minimalist',
      layoutType: 'single-column',
      fontFamily: 'sans',
      spacing: 'cozy',
      headerStyle: 'left-aligned',
      sectionHeaderStyle: 'minimal-bold',
      bulletStyle: 'dash',
      skillStyle: 'list',
      colorPalette: COLOR_PALETTES[5], // Amber
      marginSize: 36,
      fontSizeBase: 10,
    }
  },
  {
    name: 'Dark Mode Tech',
    style: {
      layoutStyle: 'timeline',
      layoutType: 'two-column-right',
      fontFamily: 'mono',
      spacing: 'compact',
      headerStyle: 'left-aligned',
      sectionHeaderStyle: 'left-border',
      bulletStyle: 'dash',
      skillStyle: 'pills',
      colorPalette: COLOR_PALETTES[7], // Obsidian Dark
      marginSize: 36,
      fontSizeBase: 10,
    }
  }
];

const generatedPresets: { name: string; style: ResumeStyle }[] = [];
let count = 1;

const layoutStyles = ['modern', 'academic', 'creative', 'executive', 'timeline', 'minimalist'] as const;
const professions = [
  "Tech Lead", "Data Scientist", "Executive Director", "Creative Designer", "Research Scholar",
  "Product Lead", "Investment Analyst", "Growth Strategist", "UX Architect", "Consulting Lead",
  "HR Director", "Operations Head", "Systems Engineer", "Assistant Professor", "Lead Copywriter",
  "Sales Director", "Brand Director", "Solutions Architect", "DevOps Engineer", "Project Director"
];
const locations = [
  "Silicon Valley", "Cambridge", "Parisian", "London", "Tokyo", "Berlin", "Austin",
  "Wall Street", "Seattle", "Swiss Minimalist", "Singapore", "Sydney", "Chicago Classic", "Pacific Northwest"
];

for (const layout of ['single-column', 'two-column-left', 'two-column-right'] as const) {
  for (const font of ['sans', 'serif', 'mono'] as const) {
    for (const color of COLOR_PALETTES) {
      for (const header of ['classic-centered', 'modern-split', 'left-aligned', 'colored-banner'] as const) {
        for (const secHeader of ['underline', 'pill', 'left-border', 'minimal-bold'] as const) {
          if (generatedPresets.length >= 95) break;
          
          const spacing = count % 3 === 0 ? 'comfortable' : count % 2 === 0 ? 'cozy' : 'compact';
          const bullet = count % 4 === 0 ? 'square' : count % 3 === 0 ? 'dash' : count % 2 === 0 ? 'none' : 'disc';
          const layoutStyle = layoutStyles[count % layoutStyles.length];
          const prof = professions[count % professions.length];
          const loc = locations[count % locations.length];
          
          generatedPresets.push({
            name: `${prof} - ${loc} ${layoutStyle.charAt(0).toUpperCase() + layoutStyle.slice(1)} (${color.name})`,
            style: {
              layoutStyle,
              layoutType: layoutStyle === 'creative' ? 'two-column-left' : layoutStyle === 'timeline' ? 'two-column-right' : layout,
              fontFamily: font,
              spacing,
              headerStyle: header,
              sectionHeaderStyle: secHeader,
              bulletStyle: bullet,
              skillStyle: count % 2 === 0 ? 'pills' : 'comma-separated',
              colorPalette: color,
              marginSize: layout === 'single-column' ? 54 : 36,
              fontSizeBase: spacing === 'compact' ? 9.5 : spacing === 'cozy' ? 10.5 : 11,
            }
          });
          count++;
        }
      }
    }
  }
}

export const STYLE_PRESETS: { name: string; style: ResumeStyle }[] = [
  ...STYLE_PRESETS_BASE,
  ...generatedPresets
];

export const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: 'Alex Mercer',
    title: 'Senior Software Engineer',
    email: 'alex.mercer@gmail.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    website: 'https://alexmercer.dev',
    linkedin: 'https://linkedin.com/in/alex-mercer',
    github: 'https://github.com/alexmercer',
    summary: 'Innovative and results-driven Senior Software Engineer with over 6 years of experience building scalable web applications. Expert in React, Node.js, and cloud architecture. Passionate about optimization, clean code, and mentoring junior engineers. Proven track record of improving site performance by 40% and reducing server costs.',
  },
  workExperience: [
    {
      id: 'work-1',
      company: 'TechCorp Solutions',
      position: 'Senior Frontend Engineer',
      location: 'San Francisco, CA',
      startDate: '2023-03',
      endDate: '',
      current: true,
      description: [
        'Spearheaded the migration of a legacy dashboard to Next.js, achieving a 45% improvement in Largest Contentful Paint (LCP).',
        'Led a team of 4 engineers to design and implement a reusable React component library, accelerating UI development speed by 30%.',
        'Optimized state management and GraphQL query patterns to reduce client-side memory footprint by 150MB.'
      ]
    },
    {
      id: 'work-2',
      company: 'Innovate AI',
      position: 'Full Stack Developer',
      location: 'Austin, TX (Remote)',
      startDate: '2020-08',
      endDate: '2023-02',
      current: false,
      description: [
        'Designed and scaled a real-time collaborative document editor using WebSockets and Redis, supporting 10,000+ concurrent active sessions.',
        'Built automated CI/CD pipelines using GitHub Actions, reducing deployment errors by 80% and release cycles from weekly to daily.',
        'Integrated local and cloud LLM capabilities for on-the-fly content translation and summarization features.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      major: 'Computer Science',
      location: 'Berkeley, CA',
      startDate: '2016-09',
      endDate: '2020-05',
      gpa: '3.8/4.0',
      details: 'Specialization in Software Engineering and Distributed Systems. Graduated with Honors.'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'OmniMark Editor',
      role: 'Creator & Lead Developer',
      link: 'https://omnimark.app',
      technologies: ['React', 'TypeScript', 'WebAssembly', 'IndexedDB'],
      description: [
        'An offline-first, high-performance markdown editor compiling directly to PDF/HTML.',
        'Optimized text rendering using a custom AST parser, handling documents with 100k+ lines without lag.'
      ]
    },
    {
      id: 'proj-2',
      name: 'Local LLM Proxy',
      role: 'Creator',
      link: 'https://github.com/alexmercer/local-llm-proxy',
      technologies: ['Go', 'Docker', 'WebSockets'],
      description: [
        'A lightweight proxy tool designed to route browser LLM requests to local Ollama servers without CORS issues.',
        'Features automated token counting and context compression.'
      ]
    }
  ],
  skills: [
    {
      id: 'skill-1',
      category: 'Languages',
      skills: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'HTML/CSS']
    },
    {
      id: 'skill-2',
      category: 'Frameworks & Libraries',
      skills: ['React', 'Next.js', 'Node.js', 'Express', 'TailwindCSS', 'GraphQL']
    },
    {
      id: 'skill-3',
      category: 'Tools & DevOps',
      skills: ['Git', 'Docker', 'AWS (S3/EC2/RDS)', 'GitHub Actions', 'Redis', 'PostgreSQL']
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      issuer: 'Amazon Web Services',
      name: 'AWS Certified Solutions Architect – Associate',
      date: '2024-02',
    }
  ],
  languages: [
    {
      id: 'lang-1',
      name: 'English',
      proficiency: 'Native',
    },
    {
      id: 'lang-2',
      name: 'Spanish',
      proficiency: 'Conversational',
    }
  ]
};
export const FONTS_METADATA = {
  sans: {
    regular: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-EkA.ttf',
    bold: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZJhjp-EkA.ttf',
    italic: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-EkA.ttf' // Fallback
  },
  serif: {
    regular: 'https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOuGo23yKz72w.ttf',
    bold: 'https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOuGo23yKz72w.ttf', // Fallback or distinct if needed
    italic: 'https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOuGo23yKz72w.ttf' // Fallback
  },
  mono: {
    regular: 'https://fonts.gstatic.com/s/firacode/v22/u4q_6T-5sdc7k8wQ3t1KoMbX6898uMHbu0v8eeA.ttf',
    bold: 'https://fonts.gstatic.com/s/firacode/v22/u4q_6T-5sdc7k8wQ3t1KoMbX6898uMHbu0v8eeA.ttf', // Fallback or distinct
    italic: 'https://fonts.gstatic.com/s/firacode/v22/u4q_6T-5sdc7k8wQ3t1KoMbX6898uMHbu0v8eeA.ttf' // Fallback
  }
};
