/**
 * IBM Granite (watsonx.ai) client wrapper
 * Uses the official @ibm-cloud/watsonx-ai SDK
 * Model: ibm/granite-4-h-small (chat endpoint only)
 */
const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

let _client = null;

function getClient() {
  if (_client) return _client;

  if (!process.env.IBM_WATSON_X_API_KEY || process.env.IBM_WATSON_X_API_KEY === 'your_ibm_cloud_api_key_here') {
    throw new Error('IBM_WATSON_X_API_KEY is not configured. Please update your .env file.');
  }
  if (!process.env.IBM_WATSON_X_PROJECT_ID || process.env.IBM_WATSON_X_PROJECT_ID === 'your_watsonx_project_id_here') {
    throw new Error('IBM_WATSON_X_PROJECT_ID is not configured. Please update your .env file.');
  }

  _client = WatsonXAI.newInstance({
    version: '2024-05-31',
    serviceUrl: process.env.IBM_WATSON_X_URL || 'https://us-south.ml.cloud.ibm.com',
    authenticator: new IamAuthenticator({
      apikey: process.env.IBM_WATSON_X_API_KEY
    })
  });

  return _client;
}

/**
 * Generate text using IBM Granite via the chat endpoint.
 * granite-4-h-small supports only /text/chat, not /text/generation.
 * @param {string} prompt - The full prompt to send
 * @param {object} options - Optional overrides for model parameters
 * @returns {Promise<string>} - Generated text
 */
async function generateText(prompt, options = {}) {
  return chat(
    [{ role: 'user', content: prompt }],
    options
  );
}

/**
 * Chat-style generation using IBM Granite (messages array)
 * @param {Array} messages - Array of {role, content} objects
 * @param {object} options - Optional overrides
 * @returns {Promise<string>}
 */
async function chat(messages, options = {}) {
  const client = getClient();

  const params = {
    messages,
    modelId: options.modelId || process.env.IBM_GRANITE_MODEL_ID || 'ibm/granite-4-h-small',
    projectId: process.env.IBM_WATSON_X_PROJECT_ID,
    maxTokens: options.max_new_tokens || 800,
    temperature: options.temperature || 0.7,
    topP: options.top_p || 0.95
  };

  const response = await client.textChat(params);
  const choices = response?.result?.choices;
  if (choices && choices.length > 0) {
    return choices[0].message.content.trim();
  }
  throw new Error('No response from IBM Granite model.');
}

module.exports = { generateText, chat };
