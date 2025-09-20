import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PatientDashboard from './components/PatientDashboard';
import PatientDetailPage from './components/PatientDetailPage';
import AddPatientForm from './components/AddPatientForm';
import EditPatientPage from "./components/EditPatientPage";
import patientService from './services/patientService';
import './styles/healthcare.css';

function App() {
  const [patientCount, setPatientCount] = useState(0);

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
            </div>
          </div>
        </header>
        
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