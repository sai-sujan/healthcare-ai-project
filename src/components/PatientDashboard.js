import React, { useState, useEffect } from 'react';
import patientService from '../services/patientService';
import '../styles/healthcare.css';

const PatientDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

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

  const filteredPatients = patients.filter(patient => {
    const fullName = patientService.formatName(patient.name);
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
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
      <div className="dashboard-header">
        <h2 className="dashboard-title">Patient Registry</h2>
        <p className="dashboard-subtitle">
          Manage and view patient records from your healthcare database
        </p>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search patients by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <p style={{ margin: '12px 0 0 0', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Showing {filteredPatients.length} of {patients.length} patients
        </p>
      </div>

      {filteredPatients.length === 0 && searchTerm ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No patients found</h3>
          <p>Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="patients-grid">
          {filteredPatients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
};

const PatientCard = ({ patient }) => {
  const fullName = patientService.formatName(patient.name);
  const age = patientService.calculateAge(patient.birthDate);
  const phone = patient.telecom?.find(t => t.system === 'phone')?.value || 'No phone listed';
  const email = patient.telecom?.find(t => t.system === 'email')?.value || 'No email';

  const getInitials = (name) => {
    return name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase();
  };

  const formatAddress = (address) => {
    if (!address) return 'Address not provided';
    return `${address.city || ''}, ${address.state || ''}`.replace(/^,\s*|,\s*$/, '') || 'Location not specified';
  };

  return (
    <div className="patient-card">
      <div className="patient-header">
        <div className="patient-info">
          <h3 className="patient-name">{fullName}</h3>
          <p className="patient-demographics">
            {age} years old • {patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1) || 'Gender not specified'}
          </p>
        </div>
        <div className="patient-avatar">
          {getInitials(fullName)}
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
        <button className="view-button">
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