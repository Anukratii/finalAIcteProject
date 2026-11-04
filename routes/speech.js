const express = require('express');
const router = express.Router();
const multer = require('multer');

let SpeechToTextV1, IamAuthenticator;
try {
  SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
  IamAuthenticator = require('ibm-watson/auth').IamAuthenticator;
} catch (e) {
  // ibm-watson not installed or incompatible — STT will be unavailable
}

// Store audio in memory (no disk writes needed)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function getSttClient() {
  if (!SpeechToTextV1 || !IamAuthenticator) return null;
  if (!process.env.IBM_STT_API_KEY || process.env.IBM_STT_API_KEY === 'your_speech_to_text_api_key_here') {
    return null;
  }
  return new SpeechToTextV1({
    authenticator: new IamAuthenticator({ apikey: process.env.IBM_STT_API_KEY }),
    serviceUrl: process.env.IBM_STT_URL || 'https://api.us-south.speech-to-text.watson.cloud.ibm.com'
  });
}

/**
 * POST /api/speech/transcribe
 * Transcribe voice input to text using IBM Watson STT
 * Accepts multipart/form-data with field 'audio'
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const sttClient = getSttClient();

    if (!sttClient) {
      return res.status(503).json({
        error: 'Speech-to-text service not configured.',
        hint: 'Set IBM_STT_API_KEY and IBM_STT_URL in your .env file to enable voice input.'
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    const recognizeParams = {
      audio: req.file.buffer,
      contentType: req.file.mimetype || 'audio/webm',
      model: 'en-US_BroadbandModel',
      smartFormatting: true
    };

    const response = await sttClient.recognize(recognizeParams);
    const results = response.result?.results;

    if (!results || results.length === 0) {
      return res.json({ success: true, transcript: '', confidence: 0 });
    }

    const transcript = results
      .map(r => r.alternatives[0].transcript)
      .join(' ')
      .trim();

    const confidence = results[0]?.alternatives[0]?.confidence || 0;

    res.json({ success: true, transcript, confidence });
  } catch (err) {
    console.error('[Speech] Transcribe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/speech/status
 * Check if speech-to-text is configured
 */
router.get('/status', (req, res) => {
  const configured = !!(
    process.env.IBM_STT_API_KEY &&
    process.env.IBM_STT_API_KEY !== 'your_speech_to_text_api_key_here'
  );
  res.json({ configured, message: configured ? 'Speech-to-text ready.' : 'Speech-to-text not configured.' });
});

module.exports = router;
