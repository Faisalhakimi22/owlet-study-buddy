import React, { useState } from 'react';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://40.81.23.127:8000/chat';
  const API_KEY = import.meta.env.VITE_API_KEY;

  // Function to clean the response
  const cleanResponse = (rawResponse) => {
    // Remove everything before the last "Assistant:"
    let cleaned = rawResponse;

    if (rawResponse.includes('Assistant:')) {
      const parts = rawResponse.split('Assistant:');
      cleaned = parts[parts.length - 1];
    }

    // Remove user messages
    if (cleaned.includes('User:')) {
      cleaned = cleaned.split('User:')[0];
    }

    // Remove timestamps (HH:MM format)
    cleaned = cleaned.replace(/\d{1,2}:\d{2}/g, '');

    // Remove processing time and model info (e.g., "31.66stinyllama:latest")
    cleaned = cleaned.replace(/\d+\.\d+s\w+:\w+/g, '');

    // Remove standalone numbers at the end
    cleaned = cleaned.replace(/\s+\d+\.\d+s.*$/g, '');

    // Clean up extra whitespace
    cleaned = cleaned.trim();

    return cleaned;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    const newUserMessage = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      // Build conversation history (exclude current message)
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: userMessage,
          max_tokens: 50,
          temperature: 0.7,
          system: "You are a helpful University Support Assistant. Your role is to help students with their academic questions, provide guidance on coursework, essays, and university-related matters. Always respond as a helpful support assistant. Be concise, friendly, and professional.",
          conversation_history: conversationHistory.length > 0 ? conversationHistory : null
        }),
        timeout: 120000
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Clean the response
      const cleanedResponse = cleanResponse(data.response);

      // Add bot response to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: cleanedResponse
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h2>🎓 Student Support Chatbot</h2>

      {/* Chat Messages */}
      <div style={{
        height: '400px',
        overflowY: 'auto',
        border: '1px solid #ddd',
        padding: '15px',
        marginBottom: '20px',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            <p>👋 Hello! I'm your University Support Assistant.</p>
            <p>How can I help you today?</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: '15px',
              padding: '10px 15px',
              borderRadius: '12px',
              backgroundColor: msg.role === 'user' ? '#007bff' : '#e9ecef',
              color: msg.role === 'user' ? 'white' : 'black',
              maxWidth: '80%',
              marginLeft: msg.role === 'user' ? 'auto' : '0',
              marginRight: msg.role === 'user' ? '0' : 'auto',
              wordWrap: 'break-word'
            }}
          >
            <strong>{msg.role === 'user' ? 'You' : '🤖 Assistant'}:</strong>
            <div style={{ marginTop: '5px' }}>{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ textAlign: 'center', color: '#666', padding: '10px' }}>
            <div>⏳ Thinking...</div>
            <small>This may take 20-40 seconds</small>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
          placeholder="Ask a question..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            outline: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: loading || !input.trim() ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;

