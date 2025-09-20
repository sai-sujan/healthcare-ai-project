import React, { useState } from 'react';

export const AddEncounterModal = ({ isOpen, onClose, patientId, onEncounterAdded }) => {
  const [formData, setFormData] = useState({
    type: '',
    reason: '',
    location: '',
    cost: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const encounterData = {
      id: `encounter-${Date.now()}`,
      type: formData.type,
      reasonCode: formData.reason,
      location: formData.location,
      cost: formData.cost ? parseFloat(formData.cost) : 0,
      notes: formData.notes,
      status: 'finished',
      createdAt: new Date().toISOString()
    };
    onEncounterAdded(encounterData);
    setFormData({ type: '', reason: '', location: '', cost: '', notes: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Add New Encounter
            <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
          </h3>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Type *</label>
            <select required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <option value="">Select Type</option>
              <option value="Ambulatory">Ambulatory</option>
              <option value="Emergency">Emergency</option>
              <option value="Inpatient">Inpatient</option>
              <option value="Virtual">Virtual</option>
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Reason *</label>
            <input required type="text" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="Reason for visit" />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Location</label>
            <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="Location" />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cost ($)</label>
            <input type="number" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="0.00" step="0.01" />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} rows="3" placeholder="Additional notes"></textarea>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button type="button" onClick={onClose} style={{ marginRight: '10px', padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>Add Encounter</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddMedicationModal = ({ isOpen, onClose, patientId, onMedicationAdded }) => {
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    prescriber: '',
    instructions: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const medicationData = {
      id: `medication-${Date.now()}`,
      medicationCodeableConcept: { text: formData.medicationName },
      dosage: formData.dosage,
      frequency: formData.frequency,
      prescriber: formData.prescriber,
      instructions: formData.instructions,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    onMedicationAdded(medicationData);
    setFormData({ medicationName: '', dosage: '', frequency: '', prescriber: '', instructions: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Add New Medication
            <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
          </h3>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Medication Name *</label>
            <input required type="text" value={formData.medicationName} onChange={(e) => setFormData({...formData, medicationName: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="e.g., Lisinopril" />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Dosage *</label>
            <input required type="text" value={formData.dosage} onChange={(e) => setFormData({...formData, dosage: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="e.g., 10mg" />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Frequency *</label>
            <select required value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <option value="">Select Frequency</option>
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="As needed">As needed</option>
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Prescriber</label>
            <input type="text" value={formData.prescriber} onChange={(e) => setFormData({...formData, prescriber: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="Dr. Name" />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Instructions</label>
            <textarea value={formData.instructions} onChange={(e) => setFormData({...formData, instructions: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} rows="3" placeholder="Special instructions"></textarea>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button type="button" onClick={onClose} style={{ marginRight: '10px', padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>Add Medication</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddConditionModal = ({ isOpen, onClose, patientId, onConditionAdded }) => {
  const [formData, setFormData] = useState({
    conditionName: '',
    severity: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const conditionData = {
      id: `condition-${Date.now()}`,
      code: { text: formData.conditionName },
      severity: formData.severity,
      notes: formData.notes,
      clinicalStatus: 'active',
      createdAt: new Date().toISOString()
    };
    onConditionAdded(conditionData);
    setFormData({ conditionName: '', severity: '', notes: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Add New Condition
            <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
          </h3>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Condition/Diagnosis *</label>
            <input required type="text" value={formData.conditionName} onChange={(e) => setFormData({...formData, conditionName: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="e.g., Hypertension" />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Severity</label>
            <select value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <option value="">Select Severity</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} rows="3" placeholder="Additional notes"></textarea>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button type="button" onClick={onClose} style={{ marginRight: '10px', padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}>Add Condition</button>
          </div>
        </form>
      </div>
    </div>
  );
};