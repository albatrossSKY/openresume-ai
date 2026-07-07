# OpenResume AI

OpenResume AI is a privacy-first, fully client-side resume builder web application. It integrates local LLMs (Google Chrome Built-in AI and local Ollama servers) to analyze CVs/resumes against target job descriptions, compute ATS compatibility scores, and tailor experience bullet points with one-click—all running 100% privately on your device.

## 🚀 Key Features

* **Bidirectional WYSIWYG Editor**: Click and edit text directly inside the visual resume preview mockup (names, dates, bullet points, details). All changes synchronize in real-time with the input forms on the left.
* **100+ Curated Presets**: Instantly switch between professional CV templates (e.g. *Silicon Valley Tech Lead*, *Wall Street Investment Analyst*, *Cambridge Research Fellow*).
* **6 Distinct Visual Layouts**:
  * **Academic**: Traditional CV style, placing Education at the top, using classic serif headers.
  * **Creative**: Bold left-hand brand sidebar with vertical history timeline dots.
  * **Executive**: elegant serif style, centered details, and boxed framed headers.
  * **Timeline**: Monospace tech-coder theme mapping jobs along visual connectable track lines.
  * **Minimalist**: Spacious margins and side-by-side column splits for dates and position details.
  * **Modern**: Sleek professional template with customizable single or dual sidebars.
* **Profile Photo Integration**: Upload your profile picture (JPEG/PNG) to render as standard circular avatars in all layouts (synced natively with HTML preview and PDF output).
* **Exporters**:
  * **Selectable Vector PDFs**: Powered by `pdf-lib` client-side, dynamically wrapping and page-breaking multi-page documents perfectly.
  * **Overleaf-Ready LaTeX**: Exporters translating JSON CV inputs into clean, escape-safe LaTeX code.
* **Local Privacy-First AI**:
  * **ATS Scanners & Scorecards**: Paste a target job description to compute circular score graphs, parse key skill metrics, and list missing keywords.
  * **One-Click Bullet Tailoring**: Review side-by-side comparison diffs comparing original experience lines against tailored local LLM recommendations.
  * Supported providers include **Chrome AI (Gemini Nano)** and local **Ollama** models.

---

## 🛠️ Stack & Technologies

* **Core**: Next.js 16 (App Router + Turbopack) + TypeScript
* **Styling**: Tailwind CSS v4
* **Graphics/PDF**: `pdf-lib` vector rendering engine
* **Effects**: `canvas-confetti`
* **Icons**: `lucide-react`

---

## 💻 Getting Started

### 1. Installation

Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Start the Local Server

Run the Next.js development server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application workspace.

### 3. Setting up Local LLMs (Optional)

#### Chrome AI (Gemini Nano)
1. Ensure you are using a compatible version of Google Chrome.
2. Enable built-in AI settings in Chrome Flags (`chrome://flags/#optimization-guide-on-device-model`).
3. Set the prompt API to enabled (`chrome://flags/#prompt-api-for-sharing`).
4. Re-launch Chrome and open the builder. The app will automatically detect and leverage Chrome AI!

#### Ollama
1. Download and run [Ollama](https://ollama.com).
2. Pull your model of choice from the terminal:
   ```bash
   ollama run gemma2
   ```
3. Open the **AI Config** panel in the app workspace top-bar.
4. Click the reload icon to automatically fetch your downloaded tags, select your model, and start generating!

---

## 🔒 Security & Offline Promise

No resume data, profile photos, prompts, or job listings are sent to third-party APIs. Your data remains locked on your device. The Ollama API proxy executes requests via local port `11434` on localhost, ensuring zero external bandwidth is used.
