import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patientService from '../services/patientService';
import PatientFormModal from './PatientFormModal';
import '../styles/healthcare.css';
import SubtleEnhancedHeader from './SubtleEnhancedHeader';


const PatientDashboard = ({ onPatientCountChange }) => {
    const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);

  
  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (onPatientCountChange) {
      onPatientCountChange(patients.length);
    }
  }, [patients.length, onPatientCountChange]);

  

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const patientsData = await patientService.getAllPatients();
      setPatients(patientsData);
    } catch (err) {
      setError('Failed to load patient data. Please check your connection and try again.');
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new patient from modal form
  const handlePatientAdded = async (newPatientData) => {
    try {
      // Save to Firebase through patientService
      const savedPatient = await patientService.createPatient(newPatientData);
      
      // Add to local state for immediate UI update
      setPatients(prev => [savedPatient, ...prev]);
      
      // Close the modal
      setShowAddPatientForm(false);
      
      console.log('Patient registered successfully:', savedPatient.id);
    } catch (err) {
      console.error('Error saving patient:', err);
      // The modal will handle showing the error
      throw err;
    }
  };

  const filteredPatients = patients.filter(patient => {
    const cleanName = patientService.getCleanName(patient.name);
    return cleanName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3>Loading Patient Records</h3>
        <p>Connecting to healthcare database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3 className="error-title">Unable to Load Patient Data</h3>
        <p className="error-message">{error}</p>
        <button onClick={loadPatients} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <SubtleEnhancedHeader 
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  patientCount={filteredPatients.length}
/>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px' }}>
        <div>
          {/* Optional: Add filter buttons here */}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* <button 
            onClick={() => setShowAddPatientForm(true)}
            className="view-button"
            style={{ backgroundColor: 'var(--success-green)' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Register Patient
          </button> */}
          <button 
            onClick={() => navigate('/patients/new')}
            className="view-button"
            style={{ backgroundColor: 'var(--primary-blue)' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Patient 
          </button>
        </div>
      </div>

      {filteredPatients.length === 0 && searchTerm ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No patients found</h3>
          <p>Try adjusting your search terms</p>
        </div>
      ) : (
        <div style={{padding:'0px 20px 0px 20px'}}>
          <div className="patients-grid">
            {filteredPatients.map(patient => (
              <PatientCard key={patient.id} patient={patient} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {/* Patient Registration Modal */}
      <PatientFormModal 
        isOpen={showAddPatientForm}
        onClose={() => setShowAddPatientForm(false)}
        onPatientAdded={handlePatientAdded}
      />
    </div>
  );
};

const PatientCard = ({ patient, navigate }) => {
    const fullName = patientService.formatName(patient.name);
    const cleanName = fullName.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();  // Clean the name by removing numbers
  const age = patientService.calculateAge(patient.birthDate);
  const phone = patient.telecom?.find(t => t.system === 'phone')?.value || 'No phone listed';

  const getInitials = (name) => {
    return name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase();
  };

  const formatAddress = (address) => {
    if (!address) return 'Address not provided';
    return `${address.city || ''}, ${address.state || ''}`.replace(/^,\s*|,\s*$/, '') || 'Location not specified';
  };

  const handleViewDetails = () => {
    navigate(`/patients/${patient.id}`);
  };

  return (
    <div className="patient-card">
      <div className="patient-header">
        <div className="patient-info">
          <h3 className="patient-name">{cleanName}
</h3>
          <p className="patient-demographics">
            {age} years old • {patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1) || 'Gender not specified'}
          </p>
        </div>
        <div className="patient-avatar">
          {getInitials(cleanName)}
        </div>
      </div>

      <div className="patient-details">
        <div className="patient-detail">
          <svg className="patient-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.961 11.39a11.001 11.001 0 005.644 5.644l2.003-3.263a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>{phone}</span>
        </div>

        <div className="patient-detail">
          <svg className="patient-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{formatAddress(patient.address)}</span>
        </div>

        <div className="patient-detail">
          <svg className="patient-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{patient.race || 'Not specified'}</span>
        </div>

        <div className="patient-detail">
          <svg className="patient-detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m6-10v10a1 1 0 01-1 1H7a1 1 0 01-1-1V7a1 1 0 011-1h10a1 1 0 011 1z" />
          </svg>
          <span>{patient.maritalStatus || 'Not specified'}</span>
        </div>
      </div>

      <div className="patient-footer">
        <span className="patient-id">ID: {patient.id.slice(0, 12)}...</span>
        <button className="view-button" onClick={handleViewDetails}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          View Details
        </button>
      </div>
    </div>
  );
};

export default PatientDashboard;