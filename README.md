# ShieldHer: AI-Powered Personal Safety Assistant

ShieldHer is a web-based application prototype designed to transform a smartphone into a proactive personal safety device. It uses real-time sensor data, ambient sound analysis, and AI to detect potential threats and automatically alert emergency contacts.

## ✨ Key Features

- **Real-time Threat Assessment:** The system continuously analyzes audio from the microphone and simulates motion and location data to calculate a "Threat Confidence" score.
- **Shield Mode:** If the threat score crosses a predefined threshold, or if manually activated by the user, the app enters Shield Mode.
- **Evidence Capture:** Upon activation of Shield Mode, the app automatically records a short video and audio clip to serve as evidence.
- **AI-Powered Alerts:** The captured evidence and sensor data are sent to a generative AI model (Google's Gemini) to create a clear, detailed alert message.
- **Simulated Emergency Notifications:** The AI-generated alert is then (simulated) sent to a pre-configured list of emergency contacts.
- **User-Configurable Settings:**
  - **Standby Mode:** Temporarily disable automatic triggers to prevent false alarms.
  - **Emergency Contacts:** Manage a list of trusted contacts to notify.
  - **Safe Zones:** Define locations (like home or work) where system sensitivity is lowered.
  - **Trusted Devices:** Register devices (like a partner's phone) whose presence can lower the threat score.

## 🚀 Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **AI/Generative:** [Google AI (Gemini 2.5 Flash)](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Audio Processing:** [Tone.js](https://tonejs.github.io/) for siren and real-time analysis.

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of your project and add your Google AI API key:
    ```
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```
    You can obtain a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Development Server

1.  **Start the Genkit server:**
    The AI flows run on a separate development server. Open a terminal and run:
    ```bash
    npm run genkit:watch
    ```

2.  **Start the Next.js application:**
    In a second terminal, run the main application:
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. The Genkit development UI can be viewed at [http://localhost:4000](http://localhost:4000).

## 🤖 AI Integration

The core AI logic is managed by [Genkit](https://firebase.google.com/docs/genkit) and resides in the `src/ai/flows/` directory.

- `send-alert-to-contacts.ts`: This flow is the most critical. It takes sensor data and video evidence, then prompts the Gemini model to analyze the situation and generate a detailed alert message for emergency contacts.
- `summarize-incident-for-contacts.ts`: A secondary flow designed to create a quick, concise summary of an incident based on sensor data.

## 📁 Project Structure

```
.
├── src/
│   ├── app/                # Main Next.js pages and layout
│   ├── components/         # React components, including UI from ShadCN
│   ├── ai/                 # Genkit AI flows and configuration
│   ├── lib/                # Utility functions, types, and constants
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
├── package.json            # Project dependencies and scripts
└── ...
```
