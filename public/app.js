/**
 * AI Fitness Buddy — app.js
 * Frontend logic: navigation, API calls, voice input, profile management
 */

const API_BASE = '/api';
let sessionId = null;
let userProfile = {};
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

// ── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  checkSttStatus();
  setupNavigation();
  setupChat();
  setupWorkout();
  setupNutrition();
  setupMotivation();
  setupProfile();
  setupVoiceInput();
  autoResizeTextarea(document.getElementById('chatInput'));
});

// ── NAVIGATION ──────────────────────────────────────────────────────────────
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.section;
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${target}`).classList.add('active');
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ── CHAT ────────────────────────────────────────────────────────────────────
function setupChat() {
  const sendBtn = document.getElementById('sendBtn');
  const chatInput = document.getElementById('chatInput');

  sendBtn.addEventListener('click', () => sendChatMessage());
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
}

async function sendChatMessage(prefillText) {
  const input = document.getElementById('chatInput');
  // prefillText must be a plain string — ignore event objects passed accidentally
  const message = (typeof prefillText === 'string' ? prefillText : input.value).trim();
  if (!message) return;

  appendMessage('user', message);
  input.value = '';
  autoResizeTextarea(input);

  const typingEl = appendTypingIndicator();

  try {
    const res = await apiCall('/chat/message', 'POST', {
      message,
      sessionId,
      userProfile: Object.keys(userProfile).length ? userProfile : undefined
    });

    typingEl.remove();
    sessionId = res.sessionId;
    appendMessage('bot', res.reply);
  } catch (err) {
    typingEl.remove();
    appendMessage('bot', `⚠️ ${err.message || 'An error occurred. Please check your API configuration.'}`);
  }
}

function appendMessage(role, text) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `message ${role === 'bot' ? 'bot-message' : 'user-message'}`;

  div.innerHTML = `
    <div class="message-avatar">${role === 'bot' ? '🤖' : '👤'}</div>
    <div class="message-content">${formatMessage(text)}</div>
  `;

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function appendTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'message bot-message';
  div.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content" style="display:flex;align-items:center;gap:6px">
      <span style="display:inline-flex;gap:4px">
        <span style="width:8px;height:8px;background:#0f62fe;border-radius:50%;animation:pulse 0.8s infinite 0s"></span>
        <span style="width:8px;height:8px;background:#0f62fe;border-radius:50%;animation:pulse 0.8s infinite 0.2s"></span>
        <span style="width:8px;height:8px;background:#0f62fe;border-radius:50%;animation:pulse 0.8s infinite 0.4s"></span>
      </span>
      <span style="font-size:13px;color:#525252">FitBuddy is thinking...</span>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

// ── WORKOUT ─────────────────────────────────────────────────────────────────
function setupWorkout() {
  document.getElementById('generateWorkoutBtn').addEventListener('click', async () => {
    const profile = {
      fitnessLevel: document.getElementById('wFitnessLevel').value,
      goal: document.getElementById('wGoal').value,
      availableTime: parseInt(document.getElementById('wTime').value) || 30,
      preferredDays: parseInt(document.getElementById('wDays').value) || 4,
      equipment: document.getElementById('wEquipment').value,
      focusArea: document.getElementById('wFocusArea').value,
      age: document.getElementById('wAge').value || 'unknown',
      limitations: document.getElementById('wLimitations').value || 'none'
    };

    showLoading('Generating your personalised workout plan...');
    try {
      const res = await apiCall('/fitness/workout', 'POST', profile);
      hideLoading();
      showResult('workoutResult', '🏋️ Your Personalised Workout Plan', res.workoutPlan);
    } catch (err) {
      hideLoading();
      showResult('workoutResult', '⚠️ Error', err.message);
    }
  });
}

// ── NUTRITION ────────────────────────────────────────────────────────────────
function setupNutrition() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
      document.getElementById(`tab-${target}`).style.display = 'block';
    });
  });

  // Meal Plan
  document.getElementById('generateMealBtn').addEventListener('click', async () => {
    const profile = {
      goal: document.getElementById('nGoal').value,
      activityLevel: document.getElementById('nActivity').value,
      dietaryRestrictions: document.getElementById('nDiet').value,
      mealsPerDay: document.getElementById('nMeals').value,
      allergies: document.getElementById('nAllergies').value || 'none',
      budget: document.getElementById('nBudget').value
    };
    showLoading('Creating your personalised meal plan...');
    try {
      const res = await apiCall('/nutrition/plan', 'POST', profile);
      hideLoading();
      showResult('nutritionResult', '🥗 Your Personalised Meal Plan', res.mealPlan);
    } catch (err) {
      hideLoading();
      showResult('nutritionResult', '⚠️ Error', err.message);
    }
  });

  // Analyze Food
  document.getElementById('analyzeFoodBtn').addEventListener('click', async () => {
    const food = document.getElementById('analyzeFood').value.trim();
    const goal = document.getElementById('analyzeFoodGoal').value.trim();
    if (!food) return alert('Please enter a food or meal to analyze.');
    showLoading('Analyzing nutritional content...');
    try {
      const res = await apiCall('/nutrition/analyze', 'POST', { food, goal });
      hideLoading();
      showResult('nutritionResult', `🔍 Analysis: ${food}`, res.analysis);
    } catch (err) {
      hideLoading();
      showResult('nutritionResult', '⚠️ Error', err.message);
    }
  });

  // Food Swap
  document.getElementById('swapFoodBtn').addEventListener('click', async () => {
    const foodItem = document.getElementById('swapFood').value.trim();
    const goal = document.getElementById('swapGoal').value.trim();
    const restriction = document.getElementById('swapRestriction').value.trim();
    if (!foodItem) return alert('Please enter a food to replace.');
    showLoading('Finding healthy alternatives...');
    try {
      const res = await apiCall('/nutrition/swap', 'POST', { foodItem, goal, restriction });
      hideLoading();
      showResult('nutritionResult', `🔄 Healthy Swaps for: ${foodItem}`, res.swaps);
    } catch (err) {
      hideLoading();
      showResult('nutritionResult', '⚠️ Error', err.message);
    }
  });
}

// ── MOTIVATION ───────────────────────────────────────────────────────────────
function setupMotivation() {
  document.getElementById('dailyInspirationBtn').addEventListener('click', async () => {
    const btn = document.getElementById('dailyInspirationBtn');
    btn.disabled = true;
    try {
      const res = await apiCall('/motivation/daily', 'GET');
      showInlineResult('dailyInspirationResult', res.inspiration);
    } catch (err) {
      showInlineResult('dailyInspirationResult', '⚠️ ' + err.message);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('personalMotivationBtn').addEventListener('click', async () => {
    const context = {
      streak: parseInt(document.getElementById('mStreak').value) || 0,
      goal: document.getElementById('mGoal').value || 'fitness',
      mood: document.getElementById('mMood').value,
      lastWorkout: 'recently'
    };
    const btn = document.getElementById('personalMotivationBtn');
    btn.disabled = true;
    try {
      const res = await apiCall('/motivation/message', 'POST', context);
      showInlineResult('personalMotivationResult', res.message);
    } catch (err) {
      showInlineResult('personalMotivationResult', '⚠️ ' + err.message);
    } finally {
      btn.disabled = false;
    }
  });

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', async () => {
      const area = chip.dataset.area;
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('loading'));
      chip.classList.add('loading');
      try {
        const res = await apiCall(`/motivation/tip/${area}`, 'GET');
        showInlineResult('wellnessTipResult', res.tip);
      } catch (err) {
        showInlineResult('wellnessTipResult', '⚠️ ' + err.message);
      } finally {
        chip.classList.remove('loading');
      }
    });
  });
}

// ── PROFILE ──────────────────────────────────────────────────────────────────
function setupProfile() {
  document.getElementById('saveProfileBtn').addEventListener('click', () => {
    userProfile = {
      name: document.getElementById('pName').value,
      age: document.getElementById('pAge').value,
      weight: document.getElementById('pWeight').value ? `${document.getElementById('pWeight').value}kg` : 'unknown',
      height: document.getElementById('pHeight').value ? `${document.getElementById('pHeight').value}cm` : 'unknown',
      fitnessLevel: document.getElementById('pFitnessLevel').value,
      goal: document.getElementById('pGoal').value,
      availableTime: document.getElementById('pTime').value,
      equipment: document.getElementById('pEquipment').value,
      limitations: document.getElementById('pLimitations').value || 'none',
      dietaryRestrictions: document.getElementById('pDiet').value || 'none'
    };

    localStorage.setItem('fitbuddy_profile', JSON.stringify(userProfile));
    sessionId = null; // reset chat session so new profile is applied

    const msg = document.getElementById('profileSaveMsg');
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 4000);
  });

  document.getElementById('clearProfileBtn').addEventListener('click', () => {
    userProfile = {};
    localStorage.removeItem('fitbuddy_profile');
    document.querySelectorAll('#section-profile input, #section-profile select').forEach(el => {
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = '';
    });
    document.getElementById('pTime').value = 30;
    sessionId = null;
  });
}

function loadProfile() {
  const saved = localStorage.getItem('fitbuddy_profile');
  if (!saved) return;
  try {
    userProfile = JSON.parse(saved);
    if (userProfile.name) document.getElementById('pName').value = userProfile.name;
    if (userProfile.age) document.getElementById('pAge').value = userProfile.age;
    if (userProfile.fitnessLevel) document.getElementById('pFitnessLevel').value = userProfile.fitnessLevel;
    if (userProfile.goal) document.getElementById('pGoal').value = userProfile.goal;
  } catch (e) { /* ignore */ }
}

// ── VOICE INPUT ──────────────────────────────────────────────────────────────
async function checkSttStatus() {
  try {
    const res = await fetch(`${API_BASE}/speech/status`);
    const data = await res.json();
    if (!data.configured) {
      // Use browser Web Speech API as fallback
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        document.getElementById('voiceBtn').title = 'Voice input (browser)';
      } else {
        document.getElementById('voiceBtn').style.display = 'none';
      }
    }
  } catch (e) { /* ignore */ }
}

function setupVoiceInput() {
  const voiceBtn = document.getElementById('voiceBtn');
  voiceBtn.addEventListener('click', toggleVoice);
}

function toggleVoice() {
  if (isRecording) {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
}

function startVoiceRecording() {
  // Try browser Web Speech API first (simpler, no upload needed)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    isRecording = true;
    document.getElementById('voiceBtn').classList.add('recording');
    document.getElementById('voiceStatus').classList.remove('hidden');

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('chatInput').value = transcript;
      autoResizeTextarea(document.getElementById('chatInput'));
      stopVoiceRecording();
    };
    recognition.onerror = () => stopVoiceRecording();
    recognition.onend = () => stopVoiceRecording();
    window._recognition = recognition;
    return;
  }

  // Fallback: record audio and send to IBM Watson STT
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    isRecording = true;

    document.getElementById('voiceBtn').classList.add('recording');
    document.getElementById('voiceStatus').classList.remove('hidden');

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      try {
        const res = await fetch(`${API_BASE}/speech/transcribe`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.transcript) {
          document.getElementById('chatInput').value = data.transcript;
          autoResizeTextarea(document.getElementById('chatInput'));
        }
      } catch (e) { console.error('STT error', e); }
    };

    mediaRecorder.start();
  }).catch(err => {
    alert('Microphone access denied: ' + err.message);
    stopVoiceRecording();
  });
}

function stopVoiceRecording() {
  isRecording = false;
  document.getElementById('voiceBtn').classList.remove('recording');
  document.getElementById('voiceStatus').classList.add('hidden');

  if (window._recognition) { try { window._recognition.stop(); } catch(e){} }
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
  }
}

// ── UTILITIES ────────────────────────────────────────────────────────────────
async function apiCall(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body && method !== 'GET') opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, opts);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

function showResult(elementId, title, content) {
  const el = document.getElementById(elementId);
  el.innerHTML = `<h3>${title}</h3><div>${formatMessage(content)}</div>`;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showInlineResult(elementId, content) {
  const el = document.getElementById(elementId);
  el.innerHTML = formatMessage(content);
  el.classList.remove('hidden');
}

function showLoading(text = 'FitBuddy is thinking...') {
  document.getElementById('loadingText').textContent = text;
  document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

function formatMessage(text) {
  if (!text) return '';
  // Convert markdown-style to HTML
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4 style="margin:12px 0 6px;font-weight:700;font-size:14px;color:#0f62fe">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="margin:16px 0 8px;font-weight:700;font-size:16px">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="margin:16px 0 8px;font-weight:800;font-size:18px">$1</h2>')
    .replace(/^\d+\. (.+)$/gm, '<div style="margin:4px 0 4px 0;padding-left:4px">$&</div>')
    .replace(/^[-•] (.+)$/gm, '<div style="margin:3px 0;padding-left:4px">• $1</div>')
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}
