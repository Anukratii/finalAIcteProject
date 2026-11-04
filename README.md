# AI Fitness Buddy 🏋️

**The Smartest AI Fitness Buddy** — A personalised fitness & wellness companion powered by **IBM Granite** (via IBM watsonx.ai) and **IBM Watson Speech-to-Text**.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 💬 **Conversational AI Chat** | Multi-turn fitness Q&A powered by IBM Granite LLM |
| 🏃 **Workout Plan Generator** | Personalised home workout plans based on your level, goals & equipment |
| 🥗 **Nutrition Guidance** | Balanced meal plans, food analysis, and healthy food swaps |
| ⚡ **Motivation Engine** | Daily inspiration, personalised motivation, and wellness tips |
| 🎤 **Voice Input** | Speak your questions via IBM Watson STT or browser Web Speech API |
| 🔄 **Adaptive Plans** | Workout plans that adapt based on your feedback and progress |
| 👤 **User Profiles** | Persistent profile stored locally, applied across all features |

---

## 🛠️ Technology Stack

- **LLM:** IBM Granite (`ibm/granite-3-8b-instruct`) via IBM watsonx.ai
- **Speech-to-Text:** IBM Watson STT (optional)
- **Backend:** Node.js + Express.js
- **Frontend:** Vanilla HTML/CSS/JS (no framework, fast & lightweight)
- **IBM SDK:** `@ibm-cloud/watsonx-ai` official SDK

---

## ⚡ Quick Start

### 1. Prerequisites

- Node.js v18+ ([download](https://nodejs.org))
- An IBM Cloud Lite account ([sign up free](https://cloud.ibm.com/registration))
- A watsonx.ai project ([create here](https://dataplatform.cloud.ibm.com))

### 2. Clone & Install

```bash
git clone <repo-url>
cd ai-fitness-buddy
npm install
```

### 3. Configure IBM Cloud

Edit the `.env` file and fill in your credentials:

```env
IBM_WATSON_X_API_KEY=your_ibm_cloud_api_key_here
IBM_WATSON_X_PROJECT_ID=your_watsonx_project_id_here
IBM_WATSON_X_URL=https://us-south.ml.cloud.ibm.com
IBM_GRANITE_MODEL_ID=ibm/granite-3-8b-instruct
```

#### Getting Your Credentials

| Credential | Where to Get It |
|---|---|
| `IBM_WATSON_X_API_KEY` | [IBM Cloud → Manage → IAM → API Keys](https://cloud.ibm.com/iam/apikeys) |
| `IBM_WATSON_X_PROJECT_ID` | watsonx.ai → Your Project → Manage → General tab |
| `IBM_WATSON_X_URL` | Use `https://us-south.ml.cloud.ibm.com` for US region |

#### Optional: Voice Input (IBM Watson STT)

```env
IBM_STT_API_KEY=your_stt_api_key
IBM_STT_URL=https://api.us-south.speech-to-text.watson.cloud.ibm.com
```

> If STT is not configured, voice input automatically falls back to the browser's Web Speech API.

### 4. Run

```bash
npm start
```

Open **http://localhost:3000** in your browser.

For development with auto-reload:
```bash
npm run dev
```

---

## 📡 API Endpoints

### Chat
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat/message` | Send a message to FitBuddy |
| GET | `/api/chat/session/:id` | Get conversation history |
| DELETE | `/api/chat/session/:id` | Clear a session |

### Fitness
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/fitness/workout` | Generate personalised workout plan |
| POST | `/api/fitness/explain` | Explain why an exercise suits a goal |
| POST | `/api/fitness/adapt` | Adapt workout based on feedback |

### Nutrition
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/nutrition/plan` | Generate personalised meal plan |
| POST | `/api/nutrition/analyze` | Analyze a food item |
| POST | `/api/nutrition/swap` | Find healthy food alternatives |

### Motivation
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/motivation/message` | Get personalised motivation |
| GET | `/api/motivation/daily` | Get today's fitness inspiration |
| GET | `/api/motivation/tip/:area` | Get wellness tip (hydration/sleep/etc.) |

### Speech
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/speech/transcribe` | Transcribe audio to text |
| GET | `/api/speech/status` | Check STT configuration |

### System
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Service health check |

---

## 🗂️ Project Structure

```
ai-fitness-buddy/
├── server.js                  # Express server entry point
├── package.json
├── .env                       # IBM Cloud credentials (do NOT commit)
├── routes/
│   ├── chat.js                # Multi-turn conversational AI
│   ├── fitness.js             # Workout plan generation & adaptation
│   ├── nutrition.js           # Meal planning & food analysis
│   ├── motivation.js          # Motivation & wellness tips
│   └── speech.js              # IBM Watson STT integration
├── services/
│   ├── graniteClient.js       # IBM Granite (watsonx.ai) SDK wrapper
│   └── promptBuilder.js       # Structured prompt templates
└── public/
    ├── index.html             # Single-page app
    ├── styles.css             # IBM Carbon-inspired design
    └── app.js                 # Frontend logic
```

---

## 🔒 Security Notes

- Never commit `.env` to version control — it is in `.gitignore`
- Rate limiting is enabled (100 requests / 15 min per IP)
- Helmet.js provides HTTP security headers
- No user data is stored on the server (conversations are in-memory only)

---

## 📜 License

MIT — see [LICENSE](LICENSE)

---

*Powered by IBM Granite on IBM watsonx.ai • IBM Cloud Lite*
