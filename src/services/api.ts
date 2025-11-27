// API service for communicating with the local LLM API

const API_URL = '/api/chat'; // Use local serverless function to avoid Mixed Content error
// const API_KEY = import.meta.env.VITE_API_KEY; // Handled by backend
// const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY; // Removed for security
// const GROQ_API_KEY = ''; // Placeholder removed as it's no longer needed
const GROQ_API_URL = '/api/groq'; // Use local serverless function

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  system?: string; // System instruction for the model
  conversation_history?: ChatMessage[] | null; // Conversation history
  model?: string;
}

export interface ChatResponse {
  response: string;
  model?: string; // Model used for the response
  processing_time: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export const sendMessageToBot = async (
  message: string,
  maxTokens: number = 2048,
  temperature: number = 0.7,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>, // Optional: conversation history
  model: string = 'phi' // Default to local model
): Promise<{ response: string; model?: string; processingTime: number }> => {
  // Strong system instruction that should be maintained throughout
  const systemInstruction = `You are Owlet, a University Support Assistant. Your role is to help students with their academic questions, provide guidance on coursework, essays, and university-related matters.

IMPORTANT INSTRUCTIONS:
- Always respond as a helpful support assistant, NOT as a student asking for help
- Do NOT repeat or include the conversation history in your response
- Only respond to the CURRENT user message
- Be concise, friendly, and professional`;

  // Build the request with conversation history if available
  // The backend now supports conversation_history as a separate field
  let prompt = message;
  let systemMsg = systemInstruction;
  let historyToSend: ChatMessage[] | null = null;

  if (conversationHistory && conversationHistory.length > 0) {
    // Limit conversation history to last 6 messages (3 exchanges) to avoid context overflow
    const limitedHistory = conversationHistory.slice(-6);

    // Convert to ChatMessage format for the API
    historyToSend = limitedHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  // Log the full prompt for debugging (truncated if too long)
  const promptPreview = prompt.length > 500 ? prompt.substring(0, 500) + '...' : prompt;
  console.log('📝 Full prompt being sent:', promptPreview);
  if (prompt.length > 500) {
    console.log('📝 Prompt length:', prompt.length, 'characters');
  }

  // Handle Groq API call
  if (model === 'llama-3.3-70b-versatile') {
    console.log('🚀 Sending request to Groq API:', {
      url: GROQ_API_URL,
      model: model
    });

    const startTime = Date.now();

    try {
      const messages = [
        { role: 'system', content: systemMsg },
        ...(historyToSend || []),
        { role: 'user', content: prompt }
      ];

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${GROQ_API_KEY}` // Handled by backend
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: maxTokens,
          temperature: temperature
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Groq API Error:', errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const processingTime = (Date.now() - startTime) / 1000;

      return {
        response: data.choices[0].message.content,
        model: data.model,
        processingTime: processingTime
      };

    } catch (error) {
      console.error('❌ Error calling Groq API:', error);
      throw {
        message: error instanceof Error ? error.message : 'Failed to call Groq API',
      } as ApiError;
    }
  }

  // Default Local API call
  // Check for custom API URL in localStorage
  const customApiUrl = localStorage.getItem('custom-api-url');

  // Only use custom URL if the selected model is 'custom-model' and the URL exists
  const targetUrl = (model === 'custom-model' && customApiUrl) ? customApiUrl : API_URL;

  const requestBody: ChatRequest = {
    prompt: prompt,
    max_tokens: maxTokens,
    temperature: temperature,
    system: systemMsg,
    conversation_history: historyToSend,
  };

  console.log('🚀 Sending request to Local API:', {
    url: targetUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'X-API-Key': API_KEY, // Handled by backend
    },
    body: requestBody,
  });

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // If using custom URL, try text/plain to avoid CORS preflight (simple request)
    // Note: The server must be able to parse JSON body even with text/plain header
    if (targetUrl === customApiUrl) {
      headers['Content-Type'] = 'text/plain';
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    console.log('📡 API Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(
        `API error: ${response.status} - ${errorText || response.statusText}`
      );
    }

    const data: ChatResponse = await response.json();
    console.log('✅ API Response data:', data);
    console.log('🤖 Model used:', data.model || 'Not specified');

    if (!data.response) {
      console.error('❌ Invalid response format - missing "response" field:', data);
      throw new Error('Invalid response format from API - missing "response" field');
    }

    console.log('✅ Returning response:', data.response);
    return {
      response: data.response,
      model: data.model,
      processingTime: data.processing_time,
    };
  } catch (error) {
    console.error('❌ Error sending message:', error);

    // Check if it's a network/CORS error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('❌ Network error - possible CORS issue or server unreachable');
      throw {
        message: 'Failed to connect to the API server. Please check if the server is running and CORS is configured correctly.',
        status: undefined,
      } as ApiError;
    }

    if (error instanceof Error) {
      // Re-throw with more context
      throw {
        message: error.message,
        status: (error as ApiError).status,
      } as ApiError;
    }

    throw {
      message: 'Failed to connect to the server. Please check your connection and try again.',
    } as ApiError;
  }
};

const GROQ_TRANSCRIPTION_URL = '/api/transcribe';
const GROQ_TRANSLATION_URL = '/api/translate';
const GROQ_TTS_URL = '/api/tts';

export const transcribeAudio = async (audioFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-large-v3');

  try {
    const response = await fetch(GROQ_TRANSCRIPTION_URL, {
      method: 'POST',
      headers: {
        // 'Authorization': `Bearer ${GROQ_API_KEY}`, // Handled by backend
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq Transcription API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('❌ Error transcribing audio:', error);
    throw error;
  }
};

export const translateAudio = async (audioFile: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-large-v3');

  try {
    const response = await fetch(GROQ_TRANSLATION_URL, {
      method: 'POST',
      headers: {
        // 'Authorization': `Bearer ${GROQ_API_KEY}`, // Handled by backend
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq Translation API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('❌ Error translating audio:', error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<Blob> => {
  console.log('🔊 Generating speech for text:', text.substring(0, 50) + '...');
  try {
    const requestBody = {
      // Wait, the user specifically gave 'playai-tts'. I should stick to that but maybe try a standard one if that fails? 
      // actually, let's keep the user's model but log the request.
      model: 'playai-tts',
      input: text,
      voice: 'Fritz-PlayAI',
      response_format: 'wav',
    };

    console.log('🚀 Sending TTS request:', {
      url: GROQ_TTS_URL,
      body: requestBody
    });

    const response = await fetch(GROQ_TTS_URL, {
      method: 'POST',
      headers: {
        // 'Authorization': `Bearer ${GROQ_API_KEY}`, // Handled by backend
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 TTS Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq TTS API Error:', errorText);
      throw new Error(`Groq TTS API error: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    console.log('✅ TTS Blob received, size:', blob.size);
    return blob;
  } catch (error) {
    console.error('❌ Error generating speech:', error);
    throw error;
  }
};

