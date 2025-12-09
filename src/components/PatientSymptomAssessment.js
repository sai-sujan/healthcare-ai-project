import React from 'react';
import { Activity, AlertCircle, Calendar, FileText } from 'lucide-react';

const PatientSymptomAssessment = ({ patient }) => {
  // Check if patient has symptom assessment
  if (!patient.hasSymptomAssessment || !patient.initialSymptoms || patient.initialSymptoms.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '20px',
        border: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <Activity size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#64748b' }}>
          No Initial Symptom Assessment
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
          This patient did not complete a symptom assessment during registration.
        </p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return { bg: '#fee2e2', color: '#dc2626' };
      case 'moderate':
        return { bg: '#fef3c7', color: '#d97706' };
      case 'mild':
        return { bg: '#dcfce7', color: '#16a34a' };
      default:
        return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          backgroundColor: '#8b5cf6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Activity size={24} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
            Initial Symptom Assessment
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '4px',
            fontSize: '13px',
            color: '#64748b'
          }}>
            <Calendar size={14} />
            <span>Recorded on {formatDate(patient.registrationDate || patient.createdAt)}</span>
          </div>
        </div>
        <div style={{
          padding: '6px 12px',
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          At Registration
        </div>
      </div>

      {/* Symptoms List */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          Reported Symptoms ({patient.initialSymptoms.length})
        </h4>
        <div style={{ display: 'grid', gap: '10px' }}>
          {patient.initialSymptoms.map((symptom, index) => {
            const severityStyle = getSeverityColor(symptom.severity);
            return (
              <div
                key={symptom.id || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      {symptom.symptom}
                    </span>
                    <span
                      style={{
                        padding: '3px 10px',
                        backgroundColor: severityStyle.bg,
                        color: severityStyle.color,
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}
                    >
                      {symptom.severity}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#64748b'
                  }}>
                    Duration: <span style={{ fontWeight: '500' }}>{symptom.duration}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Information */}
      {patient.symptomAdditionalInfo && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{
            margin: '0 0 10px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#64748b'
          }}>
            Additional Information
          </h4>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#475569',
            lineHeight: '1.6'
          }}>
            {patient.symptomAdditionalInfo}
          </p>
        </div>
      )}

      {/* AI Analysis */}
      {patient.aiSymptomAnalysis && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '2px solid #86efac',
          borderRadius: '10px',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={18} color="white" />
            </div>
            <h4 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#16a34a'
            }}>
              AI Assessment
            </h4>
            <span style={{
              marginLeft: 'auto',
              padding: '3px 8px',
              backgroundColor: 'white',
              color: '#16a34a',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              Gemini 2.0 Flash
            </span>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #bbf7d0',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            <div style={{
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              lineHeight: '1.7',
              color: '#374151'
            }}>
              {patient.aiSymptomAnalysis}
            </div>
          </div>
          <div style={{
            marginTop: '14px',
            padding: '12px',
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#92400e',
            display: 'flex',
            alignItems: 'start',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Disclaimer:</strong> This is a preliminary AI assessment made during patient registration. 
              It should not replace professional medical diagnosis or treatment recommendations.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSymptomAssessment;