import React, { useState, useRef, useEffect } from 'react';

const FloatingPatientChatbot = ({ patient, encounters, conditions, medications, observations, procedures }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recordLimit, setRecordLimit] = useState(5);
  const messagesEndRef = useRef(null);

  const GEMINI_API_KEY = 'AIzaSyBzk1KVqepBXe0lgQOsjLDM81j0FGAUvR4';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get top N records from each category based on user selection
  const getTopRecords = (data, dateField, limit) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data
      .sort((a, b) => {
        const dateA = new Date(a[dateField] || a.createdAt || 0);
        const dateB = new Date(b[dateField] || b.createdAt || 0);
        return dateB - dateA;
      })
      .slice(0, limit);
  };

  // Format patient data for AI context
  const formatPatientContext = () => {
    const fullName = patient.name?.[0] ? 
      `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim() : 
      'Unknown Patient';

    const age = patient.birthDate ? 
      new Date().getFullYear() - new Date(patient.birthDate).getFullYear() : 
      'Unknown';

    const topEncounters = getTopRecords(encounters, 'period.start', recordLimit);
    const topConditions = getTopRecords(conditions, 'onsetDateTime', recordLimit);
    const topMedications = getTopRecords(medications, 'authoredOn', recordLimit);
    const topObservations = getTopRecords(observations, 'effectiveDateTime', recordLimit);
    const topProcedures = getTopRecords(procedures, 'performedDateTime', recordLimit);

    return `
PATIENT INFORMATION:
Name: ${fullName}
Age: ${age}
Gender: ${patient.gender || 'Unknown'}
Race: ${patient.race || 'Not specified'}
Ethnicity: ${patient.ethnicity || 'Not specified'}

RECENT ENCOUNTERS (Last ${recordLimit}):
${topEncounters.map((e, i) => 
  `${i+1}. ${e.type || 'Medical Encounter'} on ${new Date(e.period?.start || e.createdAt).toLocaleDateString()} - ${e.reasonCode || 'General care'} (Status: ${e.status})`
).join('\n')}

MEDICAL CONDITIONS (Last ${recordLimit}):
${topConditions.map((c, i) => 
  `${i+1}. ${c.display || 'Medical Condition'} - Status: ${c.clinicalStatus} (Since: ${c.onsetDateTime ? new Date(c.onsetDateTime).toLocaleDateString() : 'Unknown'})`
).join('\n')}

MEDICATIONS (Last ${recordLimit}):
${topMedications.map((m, i) => 
  `${i+1}. ${m.display || 'Medication'} - ${m.dosage || 'As prescribed'} (Status: ${m.status}) - Reason: ${m.reasonCode || 'Not specified'}`
).join('\n')}

LAB RESULTS/OBSERVATIONS (Last ${recordLimit}):
${topObservations.map((o, i) => 
  `${i+1}. ${o.display || 'Observation'}: ${o.valueQuantity ? `${o.valueQuantity.value} ${o.valueQuantity.unit}` : o.valueString || 'Result pending'} on ${new Date(o.effectiveDateTime || o.createdAt).toLocaleDateString()}`
).join('\n')}

PROCEDURES (Last ${recordLimit}):
${topProcedures.map((p, i) => 
  `${i+1}. ${p.display || 'Procedure'} on ${new Date(p.performedDateTime || p.createdAt).toLocaleDateString()} - Status: ${p.status}`
).join('\n')}
    `;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { type: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const patientContext = formatPatientContext();
      
      const prompt = `
You are a medical AI assistant helping healthcare providers understand patient data. 
You have access to the following patient information (limited to the last ${recordLimit} records from each category):

${patientContext}

IMPORTANT GUIDELINES:
- Only answer questions related to this specific patient's medical data
- Provide accurate, clinical information based on the provided data
- If asked about information not in the provided data, clearly state that
- Do not provide medical diagnoses or treatment recommendations
- Focus on explaining patterns, timelines, and relationships in the data
- Be professional and concise in your responses

USER QUESTION: ${inputMessage}

Please provide a helpful response based on the patient's medical data above.
      `;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiResponse = {
          type: 'ai',
          content: data.candidates[0].content.parts[0].text
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Error:', error);
      const errorResponse = {
        type: 'ai',
        content: 'Sorry, I encountered an error processing your question. Please try again.'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          backgroundColor: 'var(--primary-blue)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)',
        }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.target.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)'}
      >
        <div style={{
          color: 'white',
          fontSize: '24px',
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          {isOpen ? '✕' : '💬'}
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '30px',
          width: '400px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e2e8f0',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: 'var(--primary-blue)',
            color: 'white',
            borderRadius: '16px 16px 0 0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                Patient AI Assistant
              </h3>
              <button
                onClick={clearChat}
                style={{
                  background: 'var(--primary-blue)',
                  border: 'none',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Clear
              </button>
            </div>
            
            {/* Record Limit Selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              opacity: 0.9
            }}>
              <span>Consider last:</span>
              <select
                value={recordLimit}
                onChange={(e) => setRecordLimit(parseInt(e.target.value))}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                <option value={5} style={{color: 'black'}}>5 records</option>
                <option value={10} style={{color: 'black'}}>10 records</option>
                <option value={15} style={{color: 'black'}}>15 records</option>
                <option value={20} style={{color: 'black'}}>20 records</option>
                <option value={50} style={{color: 'black'}}>50 records</option>
              </select>
              <span>from each category</span>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            backgroundColor: '#f8fafc'
          }}>
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: '#64748b',
                fontSize: '14px',
                marginTop: '40px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤖</div>
                <p>Ask me anything about this patient's medical data!</p>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>
                  Currently analyzing the last {recordLimit} records from each category.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} style={{
                marginBottom: '12px',
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  backgroundColor: message.type === 'user' ? '#8b5cf6' : 'white',
                  color: message.type === 'user' ? 'white' : '#374151',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  border: message.type === 'ai' ? '1px solid #e2e8f0' : 'none',
                  whiteSpace: 'pre-wrap'
                }}>
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      border: '2px solid #e2e8f0',
                      borderTop: '2px solid #8b5cf6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Analyzing patient data...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: 'white'
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-end'
            }}>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about patient's conditions, medications, recent visits..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'none',
                  maxHeight: '80px',
                  minHeight: '36px'
                }}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                style={{
                  padding: '8px 12px',
                  backgroundColor: loading || !inputMessage.trim() ? '#9ca3af' : '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  minWidth: '60px'
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default FloatingPatientChatbot;