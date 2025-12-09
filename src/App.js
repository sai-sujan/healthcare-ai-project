import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PatientDashboard from './components/PatientDashboard';
import PatientDetailPage from './components/PatientDetailPage';
import AddPatientForm from './components/AddPatientForm';
import EditPatientPage from "./components/EditPatientPage";
import EnhancedPatientRegistration from './components/EnhancedPatientRegistration';
import patientService from './services/patientService';
import './styles/healthcare.css';

function App() {
  const [patientCount, setPatientCount] = useState(0);
  const [showEnhancedRegistration, setShowEnhancedRegistration] = useState(false);

  useEffect(() => {
    loadPatientCount();
  }, []);

  const loadPatientCount = async () => {
    try {
      const patients = await patientService.getAllPatients();
      setPatientCount(patients.length);
    } catch (error) {
      console.error('Error loading patient count:', error);
      setPatientCount(0);
    }
  };

  const handleEnhancedRegistrationSubmit = async (patientData) => {
    try {
      // Format patient data for Firebase
      const formattedPatient = {
        // FHIR-compliant structure
        resourceType: 'Patient',
        active: true,
        
        // Name
        name: [{
          given: [patientData.firstName],
          family: patientData.lastName,
          text: `${patientData.firstName} ${patientData.lastName}`
        }],
        
        // Birth date and gender
        birthDate: patientData.dateOfBirth,
        gender: patientData.gender,
        
        // Contact information
        telecom: [
          { system: 'email', value: patientData.email, use: 'home' },
          { system: 'phone', value: patientData.phone, use: 'mobile' }
        ],
        
        // Address
        address: patientData.street || patientData.city ? [{
          line: patientData.street ? [patientData.street] : [],
          city: patientData.city || '',
          state: patientData.state || '',
          postalCode: patientData.zipCode || '',
          country: 'USA'
        }] : [],
        
        // Medical information
        bloodType: patientData.bloodType || null,
        
        // Extension fields for additional data
        extension: [
          {
            url: 'http://healthai.com/fhir/StructureDefinition/allergies',
            valueString: patientData.allergies || ''
          },
          {
            url: 'http://healthai.com/fhir/StructureDefinition/current-medications',
            valueString: patientData.medications || ''
          }
        ],
        
        // Symptom assessment data (custom fields)
        hasSymptomAssessment: patientData.hasSymptomAssessment || false,
        initialSymptoms: patientData.symptoms || [],
        symptomAdditionalInfo: patientData.additionalInfo || '',
        aiSymptomAnalysis: patientData.aiAnalysis || null,
        
        // Metadata
        registrationDate: patientData.registrationDate
      };
  
      // FIXED: Use createPatient instead of addPatient
      await patientService.createPatient(formattedPatient);
      
      console.log('Patient registered successfully with symptom assessment!');
      
      // Reload patient count
      await loadPatientCount();
      
      // Close the enhanced registration
      setShowEnhancedRegistration(false);
      
      // Show success message
      alert('Patient registered successfully! ' + 
            (patientData.hasSymptomAssessment ? 'Symptom assessment has been recorded.' : ''));
      
    } catch (error) {
      console.error('Error registering patient:', error);
      alert('Failed to register patient. Please try again.\n\nError: ' + error.message);
    }
  };

  const handleEnhancedRegistrationCancel = () => {
    setShowEnhancedRegistration(false);
  };

  return (
    <Router>
      <div className="App">
        {/* HealthAI Pro Header */}
        <header className="healthcare-header">
          <div className="container">
            <div>
              <h1>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 6h9v2H4V6zm0 5h9v2H4v-2zm0 5h9v2H4v-2z"/>
                </svg>
                HealthAI Pro
              </h1>
              <p className="subtitle">Advanced Healthcare Management System</p>
            </div>
            
            <div className="header-stats">
              <div className="header-stat">
                <span className="header-stat-number">{patientCount}</span>
                <span className="header-stat-label">Patient Records</span>
              </div>
              <div className="header-stat">
                <span className="header-stat-number">Active</span>
                <span className="header-stat-label">System Status</span>
              </div>
              
              {/* New Patient Registration Button */}
              {!showEnhancedRegistration && (
                <button
                  onClick={() => setShowEnhancedRegistration(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
                >
                  <span style={{ fontSize: '18px' }}>+</span>
                  Register with Symptom Check
                </button>
              )}
            </div>
          </div>
        </header>
        
        {/* Enhanced Registration Modal/Overlay */}
        {showEnhancedRegistration && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            overflowY: 'auto'
          }}>
            <div style={{
              position: 'relative',
              minHeight: '100vh',
              padding: '20px'
            }}>
              <button
                onClick={handleEnhancedRegistrationCancel}
                style={{
                  position: 'fixed',
                  top: '20px',
                  right: '20px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  border: '2px solid #e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: '#64748b',
                  zIndex: 10000,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              >
                ×
              </button>
              <EnhancedPatientRegistration
                onSubmit={handleEnhancedRegistrationSubmit}
                onCancel={handleEnhancedRegistrationCancel}
              />
            </div>
          </div>
        )}
        
        {/* Main Application Routes */}
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/patients" replace />} />
            <Route path="/patients" element={<PatientDashboard onPatientCountChange={setPatientCount} />} />
            <Route path="/patients/:id/edit" element={<EditPatientPage />} />
            <Route path="/patients/new" element={<AddPatientForm onPatientAdded={loadPatientCount} />} />
            <Route path="/patients/:patientId" element={<PatientDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


// Simple 404 component
const NotFound = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
        <a 
          href="/patients" 
          style={{
            backgroundColor: '#0066cc',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center'
          }}
        >
          Back to Patients
        </a>
      </div>
    </div>
  );
};

export default App;