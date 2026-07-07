import { ResumeData } from '../types/resume';

// Helper to extract JSON block from LLM responses which may contain markdown wrappers
export function parseJSONResponse<T>(text: string, defaultValue: T): T {
  try {
    // Look for content between ```json and ```
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();
    
    // Find the first '{' and last '}'
    const startIndex = jsonString.indexOf('{');
    const endIndex = jsonString.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1) {
      const cleaned = jsonString.slice(startIndex, endIndex + 1);
      return JSON.parse(cleaned) as T;
    }
    
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Failed to parse JSON from AI response:', text, e);
    return defaultValue;
  }
}

export interface ATSResult {
  score: number;
  matchLevel: 'Low' | 'Medium' | 'High';
  missingKeywords: string[];
  matchedKeywords: string[];
  recommendations: string[];
}

export interface ModelInfo {
  name: string;
  details?: {
    parameter_size?: string;
    family?: string;
  };
}

export async function checkChromeAIAvailability(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    // @ts-ignore
    const ai = window.ai;
    if (!ai) return false;
    
    // Test the modern API (languageModel)
    if (ai.languageModel) {
      const caps = await ai.languageModel.capabilities();
      return caps.available !== 'no';
    }
    
    // Fallback for older spec (assistant)
    if (ai.assistant) {
      const caps = await ai.assistant.capabilities();
      return caps.available !== 'no';
    }
    
    return false;
  } catch (e) {
    console.warn('Chrome AI capability check failed:', e);
    return false;
  }
}

export async function fetchOllamaModels(baseUrl?: string): Promise<ModelInfo[]> {
  try {
    const response = await fetch('/api/llm/ollama', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: '/api/tags',
        baseUrl: baseUrl || 'http://127.0.0.1:11434',
        stream: false,
      }),
    });
    
    if (!response.ok) {
      console.warn(`Ollama is offline or unreachable via proxy (status ${response.status}).`);
      return [];
    }
    
    const data = await response.json();
    return (data.models || []) as ModelInfo[];
  } catch (e) {
    console.error('Failed to fetch Ollama models:', e);
    return [];
  }
}

// Function to run a prompt against Ollama (via proxy)
export async function promptOllama(
  prompt: string, 
  systemPrompt: string,
  model: string, 
  baseUrl?: string
): Promise<string> {
  const response = await fetch('/api/llm/ollama', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint: '/api/chat',
      model,
      baseUrl: baseUrl || 'http://127.0.0.1:11434',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || `Ollama request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.message?.content || '';
}

// Function to run a prompt against Chrome AI
export async function promptChromeAI(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  // @ts-ignore
  const ai = window.ai;
  if (!ai) throw new Error('Chrome AI is not available.');

  let session;
  if (ai.languageModel) {
    session = await ai.languageModel.create({
      systemPrompt: systemPrompt
    });
  } else if (ai.assistant) {
    session = await ai.assistant.create({
      systemPrompt: systemPrompt
    });
  } else {
    throw new Error('No recognized Chrome AI interface found.');
  }

  try {
    const response = await session.prompt(prompt);
    return response;
  } finally {
    session.destroy();
  }
}

// Service to analyze resume content against a job description for ATS score
export async function analyzeATSScore(
  resumeText: string,
  jobDescription: string,
  provider: 'chrome' | 'ollama',
  config: { model?: string; baseUrl?: string }
): Promise<ATSResult> {
  const systemPrompt = `You are an expert ATS (Applicant Tracking System) scanner and career consultant. 
Your task is to analyze the user's resume plain text against the job description and output a structured analysis in JSON format.
You must output exactly this JSON schema and nothing else:
{
  "score": 75,
  "matchLevel": "Medium",
  "missingKeywords": ["Kubernetes", "GraphQL", "Agile Leadership"],
  "matchedKeywords": ["React", "TypeScript", "CI/CD"],
  "recommendations": [
    "Add details about your experience scaling web apps using Kubernetes in the TechCorp Solutions section.",
    "Mention how you applied agile methodologies during project planning."
  ]
}
Ensure the score is an integer between 0 and 100. Match level should be "Low" (0-40), "Medium" (41-75), or "High" (76-100). Do not include any explanation outside the JSON.`;

  const prompt = `RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  let resultRaw = '';
  
  if (provider === 'chrome') {
    resultRaw = await promptChromeAI(prompt, systemPrompt);
  } else {
    const model = config.model || 'gemma2';
    resultRaw = await promptOllama(prompt, systemPrompt, model, config.baseUrl);
  }

  const fallback: ATSResult = {
    score: 50,
    matchLevel: 'Medium',
    missingKeywords: [],
    matchedKeywords: [],
    recommendations: ['Could not generate precise recommendations. Please check LLM model availability.']
  };

  return parseJSONResponse<ATSResult>(resultRaw, fallback);
}

// Service to tailor experiences / rewrite bullet points to match job description
export async function tailorBullets(
  bullets: string[],
  jobDescription: string,
  provider: 'chrome' | 'ollama',
  config: { model?: string; baseUrl?: string }
): Promise<string[]> {
  const systemPrompt = `You are a professional resume writer and career coach.
You will receive a list of resume bullet points and a target job description.
Your goal is to optimize these bullet points to align with the job description by highlighting relevant skills, adding keywords, and focusing on measurable impact where possible, without inventing false credentials.
Format the output as a JSON array of strings:
[
  "Optimized bullet point 1...",
  "Optimized bullet point 2..."
]
Do not include any intro, outro, or explanation. Output only the JSON array.`;

  const prompt = `ORIGINAL BULLET POINTS:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

TARGET JOB DESCRIPTION:
${jobDescription}`;

  let resultRaw = '';
  if (provider === 'chrome') {
    resultRaw = await promptChromeAI(prompt, systemPrompt);
  } else {
    const model = config.model || 'gemma2';
    resultRaw = await promptOllama(prompt, systemPrompt, model, config.baseUrl);
  }

  const fallback = bullets; // Return original on failure
  try {
    // Simple JSON array parse helper
    const jsonMatch = resultRaw.match(/```json\s*([\s\S]*?)\s*```/) || resultRaw.match(/```\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : resultRaw.trim();
    const startIndex = jsonString.indexOf('[');
    const endIndex = jsonString.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1) {
      const cleaned = jsonString.slice(startIndex, endIndex + 1);
      return JSON.parse(cleaned) as string[];
    }
    return JSON.parse(jsonString) as string[];
  } catch (e) {
    console.error('Failed to parse tailored bullets:', resultRaw, e);
    return fallback;
  }
}
export function getResumePlainText(data: ResumeData): string {
  const parts = [
    `Name: ${data.personalInfo.fullName}`,
    `Title: ${data.personalInfo.title}`,
    `Email: ${data.personalInfo.email} | Phone: ${data.personalInfo.phone} | Location: ${data.personalInfo.location}`,
    `Summary: ${data.personalInfo.summary}`,
    '\nWORK EXPERIENCE:',
    ...data.workExperience.map(w => 
      `${w.company} - ${w.position} (${w.startDate} to ${w.endDate || 'Present'})\n` +
      w.description.map(b => `- ${b}`).join('\n')
    ),
    '\nEDUCATION:',
    ...data.education.map(e => 
      `${e.institution} - ${e.degree} in ${e.major} (${e.startDate} to ${e.endDate || 'Present'})` + 
      (e.gpa ? ` (GPA: ${e.gpa})` : '')
    ),
    '\nPROJECTS:',
    ...data.projects.map(p => 
      `${p.name} - ${p.role}\n` +
      p.description.map(b => `- ${b}`).join('\n')
    ),
    '\nSKILLS:',
    ...data.skills.map(s => `${s.category}: ${s.skills.join(', ')}`),
  ];
  return parts.join('\n');
}
