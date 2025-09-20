import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import patientService from '../services/patientService';
import '../styles/healthcare.css';
import { AddEncounterModal, AddMedicationModal, AddConditionModal } from './AddMedicalRecordsModals';
import AIMedicalSummary from './AIMedicalSummary';
import FloatingPatientChatbot from './FloatingPatientChatbot';


const PatientDetailPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [showAddEncounterModal, setShowAddEncounterModal] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [showAddConditionModal, setShowAddConditionModal] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [allergies, setAllergies] = useState([]);
const [observations, setObservations] = useState([]);
const [procedures, setProcedures] = useState([]);

  useEffect(() => {
    if (patientId) {
      loadPatientData(patientId);
    }
  }, [patientId]);

  const loadPatientData = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const [patientData, encountersData, conditionsData, medicationsData, allergiesData, observationsData, proceduresData] = await Promise.all([
        patientService.getPatient(id),
        patientService.getPatientEncounters(id).catch(() => []),
        patientService.getPatientConditions(id).catch(() => []),
        patientService.getPatientMedications(id).catch(() => []),
        patientService.getPatientAllergies ? patientService.getPatientAllergies(id).catch(() => []) : Promise.resolve([]),
        patientService.getPatientObservations ? patientService.getPatientObservations(id).catch(() => []) : Promise.resolve([]),
        patientService.getPatientProcedures ? patientService.getPatientProcedures(id).catch(() => []) : Promise.resolve([])
      ]);
  
      // Add these console logs to debug
      console.log('=== DATA LOADED ===');
      console.log('Patient:', patientData);
      console.log('Encounters:', encountersData);
      console.log('Conditions:', conditionsData);
      console.log('Medications:', medicationsData);
      console.log('Allergies:', allergiesData);
      console.log('Observations:', observationsData);
      console.log('Procedures:', proceduresData);
  
      setPatient(patientData);
      setEncounters(encountersData);
      setConditions(conditionsData);
      setMedications(medicationsData);
      setAllergies(allergiesData);
      setObservations(observationsData);
      setProcedures(proceduresData);
    } catch (err) {
      setError('Failed to load patient details: ' + err.message);
      console.error('Error loading patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEncounterAdded = async (newEncounter) => {
    try {
      setEncounters(prev => [newEncounter, ...prev]);
      console.log('Encounter added:', newEncounter);
    } catch (error) {
      console.error('Failed to add encounter:', error);
    }
  };

  const handleMedicationAdded = async (newMedication) => {
    try {
      setMedications(prev => [newMedication, ...prev]);
      console.log('Medication added:', newMedication);
    } catch (error) {
      console.error('Failed to add medication:', error);
    }
  };

  const handleConditionAdded = async (newCondition) => {
    try {
      setConditions(prev => [newCondition, ...prev]);
      console.log('Condition added:', newCondition);
    } catch (error) {
      console.error('Failed to add condition:', error);
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
          <button onClick={() => loadPatientData(patientId)} className="retry-button">
            Try Again
          </button>
          <button 
            onClick={() => navigate('/patients')}
            className="retry-button" 
            style={{ backgroundColor: 'var(--gray-500)' }}
          >
            Back to Dashboard
          </button>
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
        <button 
          onClick={() => navigate('/patients')}
          className="view-button"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const fullName = patientService.formatName(patient.name);
const cleanName = fullName.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
const age = patientService.calculateAge(patient.birthDate);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px' }}>
      {/* Back Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/patients')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <span>←</span> Back to Dashboard
        </button>
      </div>

      {/* Patient Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        borderRadius: '16px',
        padding: '32px',
        color: 'white',
        marginBottom: '24px',
        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
{cleanName.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', fontWeight: '700' }}>
              {cleanName}
            </h1>
            <div style={{ display: 'flex', gap: '16px', fontSize: '16px', opacity: 0.9, marginBottom: '16px' }}>
              <span>{age} years old</span>
              <span>•</span>
              <span>{patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1)}</span>
              <span>•</span>
              <span>MRN: {patient.id.slice(0, 8).toUpperCase()}</span>
            </div>
            
            {/* Patient Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              fontSize: '14px',
              opacity: 0.9
            }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Date of Birth</div>
                <div>{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not provided'}</div>
              </div>
              
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Phone</div>
                <div>{patient.telecom?.find(t => t.system === 'phone')?.value || 'Not provided'}</div>
              </div>
              
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Email</div>
                <div style={{ wordBreak: 'break-all', fontSize: '13px' }}>{patient.telecom?.find(t => t.system === 'email')?.value || 'Not provided'}</div>
              </div>
              
              {patient.address && (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Address</div>
                  <div style={{ fontSize: '13px', lineHeight: '1.3' }}>
                    {(() => {
                      const addr = Array.isArray(patient.address) ? patient.address[0] : patient.address;
                      const parts = [];
                      if (addr?.line) parts.push(Array.isArray(addr.line) ? addr.line.join(', ') : addr.line);
                      if (addr?.city) parts.push(addr.city);
                      if (addr?.state) parts.push(addr.state);
                      if (addr?.postalCode) parts.push(addr.postalCode);
                      return parts.join(', ') || 'Not provided';
                    })()}
                  </div>
                </div>
              )}
              
              {patient.race && (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Race</div>
                  <div>{patient.race}</div>
                </div>
              )}
              
              {patient.ethnicity && (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Ethnicity</div>
                  <div>{patient.ethnicity}</div>
                </div>
              )}
              
              {patient.maritalStatus && (
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Marital Status</div>
                  <div style={{ textTransform: 'capitalize' }}>{patient.maritalStatus}</div>
                </div>
              )}
              
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Medical Records</div>
                <div>{encounters.length} Encounters, {conditions.length} Conditions, {medications.length} Medications</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowAddEncounterModal(true)}
            style={{
              padding: '12px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            + Add Encounter
          </button>
          
          <button 
            onClick={() => setShowAddMedicationModal(true)}
            style={{
              padding: '12px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            + Add Medication
          </button>
          
          <button 
            onClick={() => setShowAddConditionModal(true)}
            style={{
              padding: '12px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            + Add Condition
          </button>
        </div>
      </div>

      <div style={{padding:'10px'}}>
      <AIMedicalSummary 
        patient={patient}
        encounters={encounters}
        conditions={conditions}
        medications={medications}
        observations={observations}
        procedures={procedures}
      />

<FloatingPatientChatbot 
        patient={patient}
        encounters={encounters}
        conditions={conditions}
        medications={medications}
        observations={observations}
        procedures={procedures}
      />
        </div>

     

      {/* Medical Timeline */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px', 
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
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px'
            }}>
              🕐
            </div>
            Medical Timeline
          </h2>
          
          <select 
            value={timelineFilter}
            onChange={(e) => setTimelineFilter(e.target.value)}
            style={{
                padding: '8px 16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
            }}
            >
            <option value="all">All Records</option>
            <option value="encounter">Encounters Only</option>
            <option value="medication">Medications Only</option>
            <option value="condition">Conditions Only</option>
            {/* <option value="allergy">Allergies Only</option> */}
            <option value="observation">Observations Only</option>
            <option value="procedure">Procedures Only</option>
            </select>
        </div>
        

        <MedicalTimeline 
            encounters={encounters} 
            conditions={conditions} 
            medications={medications}
            allergies={allergies || []}
            observations={observations || []}
            procedures={procedures || []}
            filter={timelineFilter}
            />
      </div>

     

      {/* Modals */}
      <AddEncounterModal
        isOpen={showAddEncounterModal}
        onClose={() => setShowAddEncounterModal(false)}
        patientId={patient.id}
        onEncounterAdded={handleEncounterAdded}
      />

      <AddMedicationModal
        isOpen={showAddMedicationModal}
        onClose={() => setShowAddMedicationModal(false)}
        patientId={patient.id}
        onMedicationAdded={handleMedicationAdded}
      />

      <AddConditionModal
        isOpen={showAddConditionModal}
        onClose={() => setShowAddConditionModal(false)}
        patientId={patient.id}
        onConditionAdded={handleConditionAdded}
      />
    </div>
  );
};

const MedicalTimeline = ({ encounters, conditions, medications, allergies, observations, procedures, filter }) => {
    // Create individual event arrays
    const encounterEvents = encounters.map(e => ({
      ...e,
      type: 'encounter',
      date: e.period?.start || e.createdAt,
      title: e.type || 'Medical Encounter',
      description: e.reasonCode || 'Medical encounter',
      icon: '🏥',
      color: '#f59e0b'
    }));
  
    const conditionEvents = conditions.map(c => ({
      ...c,
      type: 'condition',
      date: c.onsetDateTime || c.createdAt,
      title: c.display || 'Medical Condition',
      description: `Status: ${c.clinicalStatus || 'Active'}`,
      icon: '🩺',
      color: '#ef4444'
    }));
  
    const medicationEvents = medications.map(m => ({
      ...m,
      type: 'medication',
      date: m.effectivePeriod?.start || m.authoredOn || m.createdAt,
      title: m.display || 'Medication',
      description: `${m.dosage || ''} - ${m.reasonCode || ''}`.trim().replace(/^- | -$/g, ''),
      icon: '💊',
      color: '#10b981'
    }));
  
    const allergyEvents = (allergies || []).map(a => ({
      ...a,
      type: 'allergy',
      date: a.onsetDateTime || a.recordedDate || a.createdAt,
      title: a.display || 'Allergy',
      description: `${a.type} - ${a.criticality} criticality`,
      icon: '🚨',
      color: '#f97316'
    }));
  
    const observationEvents = (observations || []).map(o => ({
      ...o,
      type: 'observation',
      date: o.effectiveDateTime || o.createdAt,
      title: o.display || 'Observation',
      description: o.valueQuantity ? `${o.valueQuantity.value} ${o.valueQuantity.unit}` : o.valueString || 'Test result',
      icon: '📊',
      color: '#06b6d4'
    }));
  
    const procedureEvents = (procedures || []).map(p => ({
      ...p,
      type: 'procedure',
      date: p.performedDateTime || p.createdAt,
      title: p.display || 'Procedure',
      description: p.reasonCode || 'Medical procedure',
      icon: '⚕️',
      color: '#8b5cf6'
    }));
  
    // Filter events based on selected filter
    let allEvents = [];
    if (filter === 'all') {
      allEvents = [...encounterEvents, ...conditionEvents, ...medicationEvents, ...allergyEvents, ...observationEvents, ...procedureEvents];
    } else if (filter === 'encounter') {
      allEvents = encounterEvents;
    } else if (filter === 'medication') {
      allEvents = medicationEvents;
    } else if (filter === 'condition') {
      allEvents = conditionEvents;
    } else if (filter === 'allergy') {
      allEvents = allergyEvents;
    } else if (filter === 'observation') {
      allEvents = observationEvents;
    } else if (filter === 'procedure') {
      allEvents = procedureEvents;
    }
  
    // Sort by date
    allEvents = allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
  
    const formatDate = (dateString) => {
      if (!dateString) return 'Date not available';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      } catch {
        return 'Date not available';
      }
    };
  
    if (allEvents.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>No Medical History</h3>
          <p style={{ margin: 0 }}>No medical records have been added yet</p>
        </div>
      );
    }
  
    return (
      <div style={{ position: 'relative' }}>
        {/* Timeline line */}
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '20px',
          bottom: '20px',
          width: '2px',
          backgroundColor: '#e2e8f0'
        }} />
  
        {allEvents.map((event, index) => (
          <div key={`${event.type}-${index}`} style={{
            position: 'relative',
            paddingLeft: '60px',
            paddingBottom: '32px'
          }}>
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '8px',
              top: '8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: event.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              border: '3px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {event.icon}
            </div>
  
            {/* Event content */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {event.title}
                </h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    backgroundColor: event.color,
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {event.type}
                  </span>
                  <span style={{
                    color: '#64748b',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {formatDate(event.date)}
                  </span>
                </div>
              </div>
  
              <p style={{
                margin: '0 0 16px 0',
                color: '#64748b',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                {event.description}
              </p>
  
              {/* Additional details based on type */}
              {event.type === 'encounter' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  {event.location && <div><strong>Location:</strong> {event.location}</div>}
                  {event.cost && <div><strong>Cost:</strong> ${event.cost}</div>}
                  {event.status && <div><strong>Status:</strong> {event.status}</div>}
                  {event.class && <div><strong>Class:</strong> {event.class}</div>}
                </div>
              )}
  
              {event.type === 'medication' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  {event.dosage && <div><strong>Dosage:</strong> {event.dosage}</div>}
                  {event.reasonCode && <div><strong>Reason:</strong> {event.reasonCode}</div>}
                  {event.status && <div><strong>Status:</strong> {event.status}</div>}
                  {event.cost && <div><strong>Cost:</strong> ${event.cost}</div>}
                  {event.authoredOn && <div><strong>Prescribed:</strong> {new Date(event.authoredOn).toLocaleDateString()}</div>}
                </div>
              )}
  
              {event.type === 'condition' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  {event.clinicalStatus && <div><strong>Status:</strong> {event.clinicalStatus}</div>}
                  {event.onsetDateTime && <div><strong>Onset:</strong> {new Date(event.onsetDateTime).toLocaleDateString()}</div>}
                  {event.abatementDateTime && <div><strong>Resolved:</strong> {new Date(event.abatementDateTime).toLocaleDateString()}</div>}
                  {event.code && <div><strong>Code:</strong> {event.code}</div>}
                </div>
              )}
  
              {event.type === 'allergy' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  {event.criticality && <div><strong>Criticality:</strong> {event.criticality}</div>}
                  {event.category && <div><strong>Category:</strong> {event.category.join(', ')}</div>}
                  {event.clinicalStatus && <div><strong>Status:</strong> {event.clinicalStatus}</div>}
                </div>
              )}
  
              {event.type === 'observation' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  {event.category && <div><strong>Category:</strong> {event.category}</div>}
                  {event.status && <div><strong>Status:</strong> {event.status}</div>}
                  {event.code && <div><strong>Code:</strong> {event.code}</div>}
                </div>
              )}
  
              {event.type === 'procedure' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px',
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  {event.status && <div><strong>Status:</strong> {event.status}</div>}
                  {event.cost && <div><strong>Cost:</strong> ${event.cost}</div>}
                  {event.code && <div><strong>Code:</strong> {event.code}</div>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

export default PatientDetailPage;