import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import patientService from '../services/patientService';

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadPatientData(id);
    }
  }, [id]);

  const loadPatientData = async (patientId) => {
    try {
      setLoading(true);
      setError(null);
      
      const [patientData, encountersData, conditionsData, medicationsData] = await Promise.all([
        patientService.getPatient(patientId),
        patientService.getPatientEncounters(patientId),
        patientService.getPatientConditions(patientId),
        patientService.getPatientMedications ? patientService.getPatientMedications(patientId) : Promise.resolve([])
      ]);

      setPatient(patientData);
      setEncounters(encountersData);
      setConditions(conditionsData);
      setMedications(medicationsData);
    } catch (err) {
      setError('Failed to load patient details: ' + err.message);
      console.error('Error loading patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3>Loading Patient Details</h3>
        <p>Retrieving medical records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3 className="error-title">Unable to Load Patient Details</h3>
        <p className="error-message">{error}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => loadPatientData(id)} className="retry-button">
            Try Again
          </button>
          <Link to="/" className="retry-button" style={{ textDecoration: 'none', backgroundColor: '#6b7280' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👤</div>
        <h3>Patient Not Found</h3>
        <p>The requested patient record could not be found.</p>
        <Link to="/" style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const fullName = patientService.formatName(patient.name);
  const age = patientService.calculateAge(patient.birthDate);

  return (
    <div className="dashboard-container">
      {/* Patient Header */}
      <div className="patient-detail-header">
        <div style={{ marginBottom: '24px' }}>
          <Link to="/" style={{ color: 'var(--primary-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="patient-header-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="patient-avatar" style={{ width: '80px', height: '80px', fontSize: '1.5rem' }}>
              {fullName.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: '700', color: 'var(--gray-900)' }}>
                {fullName}
              </h1>
              <div style={{ display: 'flex', gap: '24px', color: 'var(--gray-600)', fontSize: '1rem' }}>
                <span>{age} years old</span>
                <span>{patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1)}</span>
                <span>ID: {patient.id.slice(0, 12)}...</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                <div>📞 {patient.telecom?.find(t => t.system === 'phone')?.value || 'No phone'}</div>
                <div>📧 {patient.telecom?.find(t => t.system === 'email')?.value || 'No email'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="patient-tabs">
          {['overview', 'encounters', 'conditions', 'medications'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: activeTab === tab ? 'var(--primary-blue)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--gray-600)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && <OverviewTab patient={patient} encounters={encounters} conditions={conditions} medications={medications} />}
        {activeTab === 'encounters' && <EncountersTab encounters={encounters} />}
        {activeTab === 'conditions' && <ConditionsTab conditions={conditions} />}
        {activeTab === 'medications' && <MedicationsTab medications={medications} />}
      </div>
    </div>
  );
};

const OverviewTab = ({ patient, encounters, conditions, medications }) => {
  const formatAddress = (address) => {
    if (!address) return 'Address not provided';
    return `${address.line?.join(', ') || ''}, ${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`.replace(/^,\s*|,\s*$/, '');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      {/* Patient Information */}
      <div className="overview-card">
        <h3>Patient Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Date of Birth</label>
            <span>{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Not provided'}</span>
          </div>
          <div className="info-item">
            <label>Gender</label>
            <span>{patient.gender || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Race</label>
            <span>{patient.race || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Ethnicity</label>
            <span>{patient.ethnicity || 'Not specified'}</span>
          </div>
          <div className="info-item">
            <label>Marital Status</label>
            <span>{patient.maritalStatus || 'Not specified'}</span>
          </div>
          <div className="info-item" style={{ gridColumn: '1 / -1' }}>
            <label>Address</label>
            <span>{formatAddress(patient.address)}</span>
          </div>
        </div>
      </div>

      {/* Medical Summary */}
      <div className="overview-card">
        <h3>Medical Summary</h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-number">{encounters.length}</span>
            <span className="stat-label">Total Encounters</span>
          </div>
          <div className="summary-stat">
            <span className="stat-number">{conditions.length}</span>
            <span className="stat-label">Active Conditions</span>
          </div>
          <div className="summary-stat">
            <span className="stat-number">{medications.length}</span>
            <span className="stat-label">Medications</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="overview-card" style={{ gridColumn: '1 / -1' }}>
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {encounters.slice(0, 5).map((encounter, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">🏥</div>
              <div className="activity-content">
                <div className="activity-title">{encounter.type || 'Medical Encounter'}</div>
                <div className="activity-date">
                  {encounter.createdAt ? new Date(encounter.createdAt).toLocaleDateString() : 'Date not available'}
                </div>
              </div>
            </div>
          ))}
          {encounters.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '20px' }}>
              No encounters recorded
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EncountersTab = ({ encounters }) => {
  if (encounters.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏥</div>
        <h3>No Encounters Found</h3>
        <p>No medical encounters have been recorded for this patient.</p>
      </div>
    );
  }

  return (
    <div className="encounters-list">
      {encounters.map((encounter, index) => (
        <div key={index} className="encounter-card">
          <div className="encounter-header">
            <h4>{encounter.type || 'Medical Encounter'}</h4>
            <span className="encounter-date">
              {encounter.createdAt ? new Date(encounter.createdAt).toLocaleDateString() : 'Date not available'}
            </span>
          </div>
          <div className="encounter-details">
            <div><strong>Status:</strong> {encounter.status || 'Unknown'}</div>
            <div><strong>Class:</strong> {encounter.class || 'Not specified'}</div>
            {encounter.reasonCode && <div><strong>Reason:</strong> {encounter.reasonCode}</div>}
            {encounter.location && <div><strong>Location:</strong> {encounter.location}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

const ConditionsTab = ({ conditions }) => {
  if (conditions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🩺</div>
        <h3>No Conditions Found</h3>
        <p>No medical conditions have been recorded for this patient.</p>
      </div>
    );
  }

  return (
    <div className="conditions-list">
      {conditions.map((condition, index) => (
        <div key={index} className="condition-card">
          <div className="condition-header">
            <h4>{condition.display || 'Medical Condition'}</h4>
            <span className={`status-badge ${condition.clinicalStatus || 'unknown'}`}>
              {condition.clinicalStatus || 'Unknown'}
            </span>
          </div>
          <div className="condition-details">
            {condition.onsetDateTime && (
              <div><strong>Onset:</strong> {new Date(condition.onsetDateTime).toLocaleDateString()}</div>
            )}
            {condition.code && <div><strong>Code:</strong> {condition.code}</div>}
            {condition.system && <div><strong>System:</strong> {condition.system}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

const MedicationsTab = ({ medications }) => {
  if (medications.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💊</div>
        <h3>No Medications Found</h3>
        <p>No medications have been recorded for this patient.</p>
      </div>
    );
  }

  return (
    <div className="medications-list">
      {medications.map((medication, index) => (
        <div key={index} className="medication-card">
          <div className="medication-header">
            <h4>{medication.display || 'Medication'}</h4>
            <span className={`status-badge ${medication.status || 'unknown'}`}>
              {medication.status || 'Unknown'}
            </span>
          </div>
          <div className="medication-details">
            {medication.dosage && <div><strong>Dosage:</strong> {medication.dosage}</div>}
            {medication.authoredOn && (
              <div><strong>Prescribed:</strong> {new Date(medication.authoredOn).toLocaleDateString()}</div>
            )}
            {medication.reasonCode && <div><strong>Reason:</strong> {medication.reasonCode}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientDetail;