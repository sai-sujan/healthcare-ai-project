import React, { useState } from 'react';
import { AlertCircle, Loader2, Plus, X, Sparkles, TrendingUp } from 'lucide-react';

const NewIssueAnalyzer = ({ patient, encounters, conditions, medications, observations, procedures }) => {
  const [newIssues, setNewIssues] = useState([]);
  const [currentIssue, setCurrentIssue] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [additionalNotes, setAdditionalNotes] = useState('');
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

  // Add issue to list
  const addIssue = () => {
    if (!currentIssue.trim()) return;

    const newIssueObj = {
      id: Date.now(),
      issue: currentIssue.trim(),
      duration: duration || 'Just started',
      severity: severity
    };

    setNewIssues([...newIssues, newIssueObj]);
    setCurrentIssue('');
    setDuration('');
    setSeverity('moderate');
  };

  // Remove issue
  const removeIssue = (id) => {
    setNewIssues(newIssues.filter(i => i.id !== id));
  };

  // Get patient name
  const getPatientName = () => {
    if (patient.name?.[0]) {
      return `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim();
    }
    return 'Unknown Patient';
  };

  // Calculate age
  const getAge = () => {
    if (!patient.birthDate) return 'Unknown';
    const birth = new Date(patient.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Analyze new issues with AI
  const analyzeNewIssues = async () => {
    if (newIssues.length === 0) {
      setError('Please add at least one new issue before analyzing');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      // Format medical history
      const medicalHistory = `
PATIENT PROFILE:
Name: ${getPatientName()}
Age: ${getAge()}
Gender: ${patient.gender || 'Unknown'}
Blood Type: ${patient.bloodType || 'Unknown'}

PAST MEDICAL CONDITIONS (${conditions?.length || 0} total):
${conditions?.length > 0 ? conditions.slice(0, 10).map((c, i) => 
  `${i+1}. ${c.display || c.code} - Status: ${c.clinicalStatus} (Since: ${c.onsetDateTime ? new Date(c.onsetDateTime).toLocaleDateString() : 'Unknown'})`
).join('\n') : 'No previous conditions recorded'}

CURRENT MEDICATIONS (${medications?.length || 0} total):
${medications?.length > 0 ? medications.slice(0, 10).map((m, i) => 
  `${i+1}. ${m.display || m.code} - ${m.dosage || 'Dosage not specified'} (Status: ${m.status})`
).join('\n') : 'No current medications'}

RECENT MEDICAL ENCOUNTERS (Last 10):
${encounters?.length > 0 ? encounters.slice(0, 10).map((e, i) => 
  `${i+1}. ${e.type || 'Medical Visit'} on ${e.period?.start ? new Date(e.period.start).toLocaleDateString() : 'Unknown date'} - ${e.reasonCode || 'General care'}`
).join('\n') : 'No recent encounters'}

RECENT LAB RESULTS/OBSERVATIONS (Last 10):
${observations?.length > 0 ? observations.slice(0, 10).map((o, i) => 
  `${i+1}. ${o.display || o.code}: ${o.valueQuantity ? `${o.valueQuantity.value} ${o.valueQuantity.unit}` : o.valueString || 'Result pending'} (${o.effectiveDateTime ? new Date(o.effectiveDateTime).toLocaleDateString() : 'Unknown date'})`
).join('\n') : 'No recent observations'}

RECENT PROCEDURES (Last 5):
${procedures?.length > 0 ? procedures.slice(0, 5).map((p, i) => 
  `${i+1}. ${p.display || p.code} on ${p.performedDateTime ? new Date(p.performedDateTime).toLocaleDateString() : 'Unknown date'}`
).join('\n') : 'No recent procedures'}

INITIAL SYMPTOM ASSESSMENT (If available):
${patient.hasSymptomAssessment && patient.initialSymptoms?.length > 0 ? 
  patient.initialSymptoms.map(s => `- ${s.symptom} (${s.severity}, ${s.duration})`).join('\n') : 
  'No initial symptom assessment on file'}
      `;

      const newIssuesText = newIssues.map(i => 
        `- ${i.issue} (Severity: ${i.severity}, Duration: ${i.duration})`
      ).join('\n');

      const prompt = `
You are an experienced medical AI assistant analyzing NEW health issues for an existing patient. You have access to their COMPLETE medical history.

${medicalHistory}

NEW ISSUES REPORTED TODAY:
${newIssuesText}

ADDITIONAL NOTES FROM HEALTHCARE PROVIDER:
${additionalNotes || 'None provided'}

Based on this patient's complete medical history and the new issues reported, provide a comprehensive clinical analysis:

1. **CLINICAL ASSESSMENT**
   - Summary of the new issues in context of patient's medical history
   - How these new issues relate to existing conditions
   - Any patterns or connections with past medical events

2. **DIFFERENTIAL DIAGNOSIS**
   - List 4-6 most likely explanations for the new issues (in order of likelihood)
   - For each: Explain why it fits based on patient's history and current presentation
   - Consider patient's age, gender, existing conditions, and medications

3. **RISK FACTORS & CONCERNS**
   - Key risk factors present in this patient
   - Any medication interactions or contraindications to be aware of
   - Warning signs that would require immediate attention

4. **COMPARATIVE ANALYSIS**
   - Compare current issues with patient's medical history
   - Any significant changes or progressions noted
   - Relevant trends in lab results or observations

5. **RECOMMENDED ACTIONS**
   - Immediate steps to take
   - Diagnostic tests or screenings recommended
   - Follow-up timeline
   - Specialist referrals if needed

6. **TREATMENT CONSIDERATIONS**
   - Potential treatment approaches considering patient's current medications
   - Lifestyle modifications or self-care measures
   - Any contraindications based on medical history

7. **PROGNOSIS & MONITORING**
   - Expected course based on patient's profile
   - Key metrics to monitor
   - Red flags to watch for

IMPORTANT GUIDELINES:
- Base your analysis on the complete medical history provided
- Consider interactions with existing conditions and medications
- Be specific about connections to past medical events
- Highlight any concerning patterns or progressions
- Provide actionable, personalized recommendations
- Use clinical terminology but remain clear and understandable
- This is clinical decision support, not a definitive diagnosis

Format your response clearly with proper sections and bullet points.
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
            temperature: 0.6,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 3072,
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
        setAnalysis({
          text: analysisText,
          timestamp: new Date().toISOString(),
          issues: [...newIssues]
        });
      } else {
        throw new Error('Invalid response from AI');
      }

    } catch (err) {
      console.error('Error analyzing issues:', err);
      setError(`Failed to analyze issues: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Clear analysis
  const clearAnalysis = () => {
    setAnalysis(null);
    setNewIssues([]);
    setAdditionalNotes('');
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid #f1f5f9'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <TrendingUp size={24} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
            New Issue Analyzer
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Analyze new health issues based on complete medical history
          </p>
        </div>
      </div>

      {!analysis ? (
        <>
          {/* Add New Issue Form */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
              Report New Issues
            </h4>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  New Issue/Symptom *
                </label>
                <input
                  type="text"
                  value={currentIssue}
                  onChange={(e) => setCurrentIssue(e.target.value)}
                  placeholder="e.g., Chest pain, Dizziness, Shortness of breath..."
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
                      addIssue();
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
                    placeholder="e.g., 2 hours, 3 days, 1 week"
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
                onClick={addIssue}
                disabled={!currentIssue.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: !currentIssue.trim() ? '#9ca3af' : '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: !currentIssue.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Plus size={16} />
                Add Issue
              </button>
            </div>
          </div>

          {/* Issues List */}
          {newIssues.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                Reported Issues ({newIssues.length})
              </h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {newIssues.map(issue => {
                  const severityColor = severityLevels.find(s => s.value === issue.severity)?.color || '#64748b';
                  return (
                    <div
                      key={issue.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                            {issue.issue}
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              backgroundColor: severityColor + '20',
                              color: severityColor,
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              textTransform: 'capitalize'
                            }}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                          Duration: {issue.duration}
                        </div>
                      </div>
                      <button
                        onClick={() => removeIssue(issue.id)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
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

          {/* Additional Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Additional Clinical Notes (Optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional observations, patient complaints, or relevant information..."
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

          {/* Analyze Button */}
          <button
            onClick={analyzeNewIssues}
            disabled={analyzing || newIssues.length === 0}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: analyzing || newIssues.length === 0 ? '#9ca3af' : '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: analyzing || newIssues.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {analyzing ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Analyzing Medical History & New Issues...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Analyze with AI (Based on Full History)
              </>
            )}
          </button>
        </>
      ) : (
        // Analysis Results
        <div>
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '2px solid #7dd3fc',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <Sparkles size={24} color="#0284c7" />
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0284c7' }}>
                AI Clinical Analysis Complete
              </h4>
              <span style={{
                marginLeft: 'auto',
                padding: '4px 10px',
                backgroundColor: 'white',
                color: '#0284c7',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {new Date(analysis.timestamp).toLocaleString()}
              </span>
            </div>

            {/* Issues Analyzed */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              border: '1px solid #bae6fd'
            }}>
              <strong style={{ fontSize: '13px', color: '#0c4a6e' }}>Issues Analyzed:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px', color: '#475569' }}>
                {analysis.issues.map(issue => (
                  <li key={issue.id}>{issue.issue} - {issue.severity} ({issue.duration})</li>
                ))}
              </ul>
            </div>

            {/* Analysis Text */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid #bae6fd',
              maxHeight: '600px',
              overflowY: 'auto'
            }}>
              <div style={{
                whiteSpace: 'pre-wrap',
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#374151'
              }}>
                {analysis.text}
              </div>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#92400e',
              display: 'flex',
              alignItems: 'start',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Clinical Decision Support Tool:</strong> This AI analysis is based on the patient's complete medical history and should be used to support clinical decision-making. Always verify findings with appropriate diagnostic tests and clinical examination.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={clearAnalysis}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Analyze New Issues
            </button>
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
    </div>
  );
};

export default NewIssueAnalyzer;