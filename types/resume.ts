export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  photoUrl?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[]; // Bullet points
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  major: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  details?: string;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  link: string;
  technologies: string[];
  description: string[]; // Bullet points
}

export interface SkillCategory {
  id: string;
  category: string; // e.g. "Languages", "Frameworks"
  skills: string[]; // e.g. ["TypeScript", "JavaScript", "Python"]
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string; // e.g., "Native", "Fluent", "Conversational"
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: SkillCategory[];
  certifications: Certification[];
  languages: Language[];
}

export type LayoutType = 'single-column' | 'two-column-left' | 'two-column-right';
export type FontFamily = 'sans' | 'serif' | 'mono';
export type SpacingType = 'compact' | 'cozy' | 'comfortable';
export type HeaderStyle = 'classic-centered' | 'modern-split' | 'left-aligned' | 'colored-banner';
export type SectionHeaderStyle = 'underline' | 'pill' | 'minimal-bold' | 'left-border';
export type BulletStyle = 'disc' | 'square' | 'dash' | 'none';
export type SkillStyle = 'pills' | 'comma-separated' | 'list';

export interface ColorPalette {
  id: string;
  name: string;
  primary: string;      // Primary accent color (hex)
  secondary: string;    // Secondary text color (hex)
  background: string;   // Page background (hex, usually #ffffff or #fafafa)
  text: string;         // Primary text body (hex)
  muted: string;        // Subdued text (hex)
  border: string;       // Border color (hex)
  accent: string;       // Subtle tint/hover background (hex)
}

export type LayoutStyle = 'modern' | 'academic' | 'creative' | 'executive' | 'timeline' | 'minimalist';

export interface ResumeStyle {
  layoutStyle: LayoutStyle;
  layoutType: LayoutType;
  fontFamily: FontFamily;
  spacing: SpacingType;
  headerStyle: HeaderStyle;
  sectionHeaderStyle: SectionHeaderStyle;
  bulletStyle: BulletStyle;
  skillStyle: SkillStyle;
  colorPalette: ColorPalette;
  marginSize: number; // in points (e.g. 36 for 0.5in, 54 for 0.75in)
  fontSizeBase: number; // in points (e.g. 10, 11, 12)
}
