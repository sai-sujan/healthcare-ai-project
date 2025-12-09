import React, { useState } from 'react';
import { User, FileText, Activity, CheckCircle } from 'lucide-react';
import SymptomCheckerStep from './SymptomCheckerStep';

const EnhancedPatientRegistration = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    
    // Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Medical Info
    bloodType: '',
    allergies: '',
    medications: '',
    
    // Symptom Data (will be added in step 2)
    symptoms: [],
    additionalInfo: '',
    aiAnalysis: null
  });

  const steps = [
    { number: 1, title: 'Basic Information', icon: User },
    { number: 2, title: 'Symptom Assessment', icon: Activity },
    { number: 3, title: 'Review & Submit', icon: CheckCircle }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSymptomComplete = (symptomData) => {
    setFormData(prev => ({
      ...prev,
      ...symptomData
    }));
    setStep(3);
  };

  const handleSubmit = () => {
    // Format data for submission
    const submissionData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`,
      registrationDate: new Date().toISOString(),
      hasSymptomAssessment: formData.symptoms.length > 0
    };
    
    onSubmit(submissionData);
  };

  const renderStepIndicator = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '32px',
      gap: '16px'
    }}>
      {steps.map((s, index) => {
        const Icon = s.icon;
        const isActive = step === s.number;
        const isCompleted = step > s.number;
        
        return (
          <React.Fragment key={s.number}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: isCompleted ? '#10b981' : isActive ? '#8b5cf6' : '#e2e8f0',
                color: isCompleted || isActive ? 'white' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '18px',
                transition: 'all 0.3s'
              }}>
                {isCompleted ? <CheckCircle size={24} /> : <Icon size={24} />}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: '500',
                color: isActive ? '#8b5cf6' : isCompleted ? '#10b981' : '#64748b',
                textAlign: 'center'
              }}>
                {s.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div style={{
                width: '60px',
                height: '2px',
                backgroundColor: step > s.number ? '#10b981' : '#e2e8f0',
                marginBottom: '32px'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderBasicInfoStep = () => (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>
        Patient Information
      </h2>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Personal Information */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
            Personal Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
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
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
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
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
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
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
            Contact Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
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
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
            Address
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="Street Address"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="ZIP"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
            Medical Information (Optional)
          </h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Blood Type
              </label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Known Allergies
              </label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                placeholder="List any known allergies..."
                rows={2}
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
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Current Medications
              </label>
              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleInputChange}
                placeholder="List any current medications..."
                rows={2}
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
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '32px',
        gap: '12px'
      }}>
        <button
          onClick={onCancel}
          style={{
            padding: '12px 24px',
            backgroundColor: '#e2e8f0',
            color: '#475569',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => setStep(2)}
          disabled={!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender || !formData.email || !formData.phone}
          style={{
            padding: '12px 32px',
            backgroundColor: (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender || !formData.email || !formData.phone) ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender || !formData.email || !formData.phone) ? 'not-allowed' : 'pointer'
          }}
        >
          Next: Symptom Check →
        </button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>
        Review & Confirm
      </h2>

      {/* Personal Information Summary */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
          Personal Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
          <div>
            <span style={{ color: '#64748b' }}>Name:</span>
            <span style={{ marginLeft: '8px', fontWeight: '500' }}>{formData.firstName} {formData.lastName}</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Date of Birth:</span>
            <span style={{ marginLeft: '8px', fontWeight: '500' }}>{formData.dateOfBirth}</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Gender:</span>
            <span style={{ marginLeft: '8px', fontWeight: '500' }}>{formData.gender}</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Email:</span>
            <span style={{ marginLeft: '8px', fontWeight: '500' }}>{formData.email}</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Phone:</span>
            <span style={{ marginLeft: '8px', fontWeight: '500' }}>{formData.phone}</span>
          </div>
          {formData.bloodType && (
            <div>
              <span style={{ color: '#64748b' }}>Blood Type:</span>
              <span style={{ marginLeft: '8px', fontWeight: '500' }}>{formData.bloodType}</span>
            </div>
          )}
        </div>
      </div>

      {/* Symptom Assessment Summary */}
      {formData.symptoms.length > 0 && (
        <div style={{
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #86efac'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#16a34a' }}>
            Symptom Assessment Completed ✓
          </h3>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ fontSize: '14px', color: '#374151' }}>Reported Symptoms ({formData.symptoms.length}):</strong>
            <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '14px', color: '#475569' }}>
              {formData.symptoms.map(symptom => (
                <li key={symptom.id}>
                  {symptom.symptom} - <span style={{ 
                    padding: '2px 6px', 
                    backgroundColor: symptom.severity === 'severe' ? '#fee2e2' : symptom.severity === 'moderate' ? '#fef3c7' : '#dcfce7',
                    color: symptom.severity === 'severe' ? '#dc2626' : symptom.severity === 'moderate' ? '#d97706' : '#16a34a',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {symptom.severity}
                  </span> ({symptom.duration})
                </li>
              ))}
            </ul>
          </div>
          {formData.aiAnalysis && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              color: '#374151',
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #e2e8f0'
            }}>
              <strong>AI Assessment:</strong>
              <div style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                {formData.aiAnalysis.substring(0, 300)}...
              </div>
            </div>
          )}
        </div>
      )}

      {!formData.symptoms.length && (
        <div style={{
          backgroundColor: '#fef3c7',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid #fbbf24',
          fontSize: '14px',
          color: '#92400e'
        }}>
          ℹ️ No symptom assessment was performed. You can always add symptoms later.
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '32px',
        gap: '12px'
      }}>
        <button
          onClick={() => setStep(2)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#e2e8f0',
            color: '#475569',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          style={{
            padding: '12px 32px',
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
          <CheckCircle size={18} />
          Complete Registration
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {renderStepIndicator()}

        {step === 1 && renderBasicInfoStep()}
        {step === 2 && (
          <SymptomCheckerStep
            onComplete={handleSymptomComplete}
            patientData={{
              name: `${formData.firstName} ${formData.lastName}`,
              age: formData.dateOfBirth ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() : 'Unknown',
              gender: formData.gender
            }}
          />
        )}
        {step === 3 && renderReviewStep()}
      </div>
    </div>
  );
};

export default EnhancedPatientRegistration;