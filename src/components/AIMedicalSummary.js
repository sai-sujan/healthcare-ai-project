import React, { useState } from 'react';

const AIMedicalSummary = ({ patient, encounters, conditions, medications, observations, procedures }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get API key from environment variable (more secure)
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyDSTRJE5cwbmv6Jfe231ktNIpb9AvW12LI';
  // Use Gemini 2.0 Flash - Latest and fastest free model!
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
  // Function to get top 5 records from each category
  const getTopRecords = (data, dateField, limit = 5) => {
    if (!data || !Array.isArray(data)) return [];
    
    return data
      .sort((a, b) => {
        const dateA = new Date(a[dateField] || a.createdAt || 0);
        const dateB = new Date(b[dateField] || b.createdAt || 0);
        return dateB - dateA; // Most recent first
      })
      .slice(0, limit);
  };

  // Format patient data for AI analysis
  const formatPatientData = () => {
    const fullName = patient.name?.[0] ? 
      `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim() : 
      'Unknown Patient';

    const age = patient.birthDate ? 
      new Date().getFullYear() - new Date(patient.birthDate).getFullYear() : 
      'Unknown';

    // Get top 5 from each category
    const topEncounters = getTopRecords(encounters, 'period.start', 5);
    const topConditions = getTopRecords(conditions, 'onsetDateTime', 5);
    const topMedications = getTopRecords(medications, 'authoredOn', 5);
    const topObservations = getTopRecords(observations, 'effectiveDateTime', 5);
    const topProcedures = getTopRecords(procedures, 'performedDateTime', 5);

    return {
      patient: {
        name: fullName,
        age: age,
        gender: patient.gender || 'Unknown',
        race: patient.race || 'Not specified',
        ethnicity: patient.ethnicity || 'Not specified',
        address: patient.address?.[0] ? 
          `${patient.address[0].city || ''}, ${patient.address[0].state || ''}`.trim() : 
          'Not provided'
      },
      recentEncounters: topEncounters.map(e => ({
        type: e.type || 'Medical Encounter',
        date: e.period?.start || e.createdAt,
        reason: e.reasonCode,
        status: e.status,
        class: e.class,
        cost: e.cost
      })),
      activeConditions: topConditions.map(c => ({
        condition: c.display || 'Medical Condition',
        status: c.clinicalStatus,
        onsetDate: c.onsetDateTime,
        code: c.code
      })),
      currentMedications: topMedications.map(m => ({
        medication: m.display || 'Medication',
        dosage: m.dosage,
        status: m.status,
        reason: m.reasonCode,
        prescribed: m.authoredOn
      })),
      recentObservations: topObservations.map(o => ({
        test: o.display || 'Observation',
        value: o.valueQuantity ? `${o.valueQuantity.value} ${o.valueQuantity.unit}` : o.valueString,
        date: o.effectiveDateTime,
        category: o.category
      })),
      recentProcedures: topProcedures.map(p => ({
        procedure: p.display || 'Procedure',
        date: p.performedDateTime,
        status: p.status,
        cost: p.cost
      }))
    };
  };

  // Generate AI summary using Gemini
  const generateAISummary = async () => {
    setLoading(true);
    setError(null);
    setSummary('');

    try {
      const patientData = formatPatientData();
      
      const prompt = `
        As a medical AI assistant, please provide a comprehensive yet concise medical summary for this patient. 
        Focus on identifying patterns, potential concerns, and key insights from their medical history.

        Patient Information:
        - Name: ${patientData.patient.name}
        - Age: ${patientData.patient.age}
        - Gender: ${patientData.patient.gender}
        - Demographics: ${patientData.patient.race}, ${patientData.patient.ethnicity}

        Recent Medical Encounters (Last 5):
        ${patientData.recentEncounters.map((e, i) => 
          `${i+1}. ${e.type} on ${new Date(e.date).toLocaleDateString()} - ${e.reason || 'General care'} (Status: ${e.status})`
        ).join('\n')}

        Active Medical Conditions (Last 5):
        ${patientData.activeConditions.map((c, i) => 
          `${i+1}. ${c.condition} - Status: ${c.status} (Since: ${c.onsetDate ? new Date(c.onsetDate).toLocaleDateString() : 'Unknown'})`
        ).join('\n')}

        Current Medications (Last 5):
        ${patientData.currentMedications.map((m, i) => 
          `${i+1}. ${m.medication} - ${m.dosage || 'As prescribed'} (Status: ${m.status}) - Reason: ${m.reason || 'Not specified'}`
        ).join('\n')}

        Recent Lab/Vital Signs (Last 5):
        ${patientData.recentObservations.map((o, i) => 
          `${i+1}. ${o.test}: ${o.value || 'Result pending'} on ${new Date(o.date).toLocaleDateString()}`
        ).join('\n')}

        Recent Procedures (Last 5):
        ${patientData.recentProcedures.map((p, i) => 
          `${i+1}. ${p.procedure} on ${new Date(p.date).toLocaleDateString()} - Status: ${p.status}`
        ).join('\n')}

        Please provide:
        1. A brief patient overview
        2. Key medical concerns or patterns identified
        3. Current treatment status
        4. Any recommendations for healthcare providers
        5. Notable trends in the patient's health data

        Keep the summary professional, concise (300-500 words), and focused on clinically relevant insights.
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
            temperature: 0.7,
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
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        setSummary(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Invalid response format from Gemini API');
      }

    } catch (err) {
      console.error('Error generating AI summary:', err);
      setError(`Failed to generate AI summary: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      marginTop: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '20px', 
          fontWeight: '700',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px'
          }}>
            🤖
          </div>
          AI Medical Summary
        </h2>
        
        <button 
          onClick={generateAISummary}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff30',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Generating...
            </>
          ) : (
            <>
              ✨ Generate Summary
            </>
          )}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#dc2626',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {summary && (
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          lineHeight: '1.6',
          fontSize: '14px',
          color: '#374151'
        }}>
          <div style={{
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '12px',
            fontSize: '16px'
          }}>
            Clinical Summary
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {summary}
          </div>
        </div>
      )}

      {!summary && !loading && !error && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Click "Generate Summary" to create an AI-powered medical summary based on this patient's top 5 records from each category.
          </p>
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

export default AIMedicalSummary;