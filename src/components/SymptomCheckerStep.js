import React, { useState } from 'react';
import { Activity, AlertCircle, Loader2, CheckCircle2, Plus, X } from 'lucide-react';

const SymptomCheckerStep = ({ onComplete, patientData }) => {
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  // Get API key from environment variable (more secure)
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';
  // Use Gemini 2.0 Flash - Latest and fastest free model!
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
  const severityLevels = [
    { value: 'mild', label: 'Mild', color: '#10b981' },
    { value: 'moderate', label: 'Moderate', color: '#f59e0b' },
    { value: 'severe', label: 'Severe', color: '#ef4444' }
  ];

  // Add symptom to the list
  const addSymptom = () => {
    if (!currentSymptom.trim()) return;

    const newSymptom = {
      id: Date.now(),
      symptom: currentSymptom.trim(),
      duration: duration || 'Unknown duration',
      severity: severity
    };

    setSymptoms([...symptoms, newSymptom]);
    setCurrentSymptom('');
    setDuration('');
    setSeverity('moderate');
  };

  // Remove symptom from list
  const removeSymptom = (id) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  // Analyze symptoms using Gemini AI
  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      setError('Please add at least one symptom before analyzing');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const symptomsText = symptoms.map(s => 
        `- ${s.symptom} (Severity: ${s.severity}, Duration: ${s.duration})`
      ).join('\n');

      const prompt = `
You are a medical AI assistant helping with preliminary symptom assessment during patient registration. 
Analyze the following symptoms and provide a professional medical assessment.

PATIENT INFORMATION:
- Name: ${patientData?.name || 'New Patient'}
- Age: ${patientData?.age || 'Not specified'}
- Gender: ${patientData?.gender || 'Not specified'}

REPORTED SYMPTOMS:
${symptomsText}

ADDITIONAL INFORMATION:
${additionalInfo || 'None provided'}

Please provide a structured assessment with the following sections:

1. **SYMPTOM SUMMARY**: Brief overview of the reported symptoms

2. **POSSIBLE CONDITIONS**: List 3-5 most likely conditions that could explain these symptoms (in order of likelihood)
   - For each condition, briefly explain why it matches the symptoms

3. **URGENCY LEVEL**: 
   - Rate as: Routine, Moderate, Urgent, or Emergency
   - Explain the reasoning

4. **RECOMMENDED ACTIONS**:
   - What the patient should do next
   - Whether they should see a doctor immediately, within a few days, or can monitor at home
   - Any self-care measures they can take

5. **WARNING SIGNS**: List specific symptoms that would require immediate medical attention

6. **SPECIALIST RECOMMENDATION**: Suggest which type of doctor/specialist would be most appropriate

IMPORTANT:
- This is a preliminary assessment only, not a diagnosis
- Be clear that professional medical evaluation is needed for proper diagnosis
- Be cautious and err on the side of recommending medical consultation
- Use clear, professional language that's easy to understand

Format your response in a clear, organized manner with proper sections and bullet points.
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
          }],
          generationConfig: {
            temperature: 0.5,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            candidateCount: 1
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const analysisText = data.candidates[0].content.parts[0].text;
        setAnalysis(analysisText);
      } else {
        throw new Error('Invalid response from AI');
      }

    } catch (err) {
      console.error('Error analyzing symptoms:', err);
      setError(`Failed to analyze symptoms: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Complete registration with symptom data
  const handleComplete = () => {
    onComplete({
      symptoms,
      additionalInfo,
      aiAnalysis: analysis
    });
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #e2e8f0'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={24} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
              Symptom Assessment
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
              Tell us about your symptoms for preliminary assessment
            </p>
          </div>
        </div>

        {/* Add Symptom Form */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
            Add Symptom
          </h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Symptom Description *
              </label>
              <input
                type="text"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                placeholder="e.g., Headache, Fever, Cough, Chest pain..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSymptom();
                  }
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 3 days, 1 week, 2 hours"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  {severityLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={addSymptom}
              disabled={!currentSymptom.trim()}
              style={{
                padding: '10px 16px',
                backgroundColor: !currentSymptom.trim() ? '#9ca3af' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: !currentSymptom.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Plus size={16} />
              Add Symptom
            </button>
          </div>
        </div>

        {/* Symptoms List */}
        {symptoms.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
              Reported Symptoms ({symptoms.length})
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {symptoms.map(symptom => {
                const severityColor = severityLevels.find(s => s.value === symptom.severity)?.color || '#64748b';
                return (
                  <div
                    key={symptom.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          {symptom.symptom}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            backgroundColor: severityColor + '20',
                            color: severityColor,
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {symptom.severity}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                        Duration: {symptom.duration}
                      </div>
                    </div>
                    <button
                      onClick={() => removeSymptom(symptom.id)}
                      style={{
                        padding: '6px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Additional Information (Optional)
          </label>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Any other relevant information: medical history, allergies, current medications, etc."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Analyze Button */}
        {symptoms.length > 0 && !analysis && (
          <button
            onClick={analyzeSymptoms}
            disabled={analyzing}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: analyzing ? '#9ca3af' : '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: analyzing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}
          >
            {analyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                Analyzing Symptoms...
              </>
            ) : (
              <>
                <Activity size={20} />
                Get AI Assessment
              </>
            )}
          </button>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'start',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* AI Analysis Results */}
        {analysis && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '2px solid #86efac',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={24} color="#16a34a" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#16a34a' }}>
                AI Assessment Complete
              </h3>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '16px',
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#374151',
              border: '1px solid #e2e8f0'
            }}>
              {analysis}
            </div>
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#92400e'
            }}>
              <strong>⚠️ Important:</strong> This is a preliminary AI assessment only. Please consult with a healthcare professional for proper diagnosis and treatment.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          {analysis && (
            <button
              onClick={handleComplete}
              style={{
                padding: '12px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={18} />
              Complete Registration
            </button>
          )}
          <button
            onClick={() => onComplete({ symptoms, additionalInfo, aiAnalysis: analysis })}
            style={{
              padding: '12px 24px',
              backgroundColor: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {analysis ? 'Skip for Now' : 'Skip Symptom Check'}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SymptomCheckerStep;