import React, { useState } from 'react';
import { Calendar, FileText, Activity, Pills, Save, X } from 'lucide-react';

const AddVisit = ({ patientId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    chiefComplaint: '',
    vitals: {
      bloodPressure: '',
      temperature: '',
      pulse: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weight: '',
      height: ''
    },
    clinicalNotes: '',
    medications: [],
    diagnosis: '',
    followUp: ''
  });

  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [name]: value
      }
    }));
  };

  const addMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, { ...newMedication, id: Date.now() }]
      }));
      setNewMedication({ name: '', dosage: '', frequency: '' });
    }
  };

  const removeMedication = (medicationId) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== medicationId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const visitData = {
        ...formData,
        patientId,
        visitDate: new Date(formData.visitDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Call API to save visit
      const response = await fetch(`/api/patients/${patientId}/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData)
      });

      if (response.ok) {
        const savedVisit = await response.json();
        onSave(savedVisit);
        onClose();
      } else {
        throw new Error('Failed to save visit');
      }
    } catch (error) {
      console.error('Error saving visit:', error);
      alert('Failed to save visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="mr-2" size={24} />
              Add New Visit
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Visit Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visit Date
              </label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chief Complaint
              </label>
              <input
                type="text"
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleInputChange}
                placeholder="e.g., Chest pain, Headache, Annual checkup"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Vital Signs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="mr-2" size={20} />
              Vital Signs
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={formData.vitals.bloodPressure}
                  onChange={handleVitalChange}
                  placeholder="120/80"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (°F)
                </label>
                <input
                  type="text"
                  name="temperature"
                  value={formData.vitals.temperature}
                  onChange={handleVitalChange}
                  placeholder="98.6"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pulse (BPM)
                </label>
                <input
                  type="text"
                  name="pulse"
                  value={formData.vitals.pulse}
                  onChange={handleVitalChange}
                  placeholder="72"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Respiratory Rate
                </label>
                <input
                  type="text"
                  name="respiratoryRate"
                  value={formData.vitals.respiratoryRate}
                  onChange={handleVitalChange}
                  placeholder="16"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  O2 Saturation (%)
                </label>
                <input
                  type="text"
                  name="oxygenSaturation"
                  value={formData.vitals.oxygenSaturation}
                  onChange={handleVitalChange}
                  placeholder="98"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (lbs)
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.vitals.weight}
                  onChange={handleVitalChange}
                  placeholder="150"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (in)
                </label>
                <input
                  type="text"
                  name="height"
                  value={formData.vitals.height}
                  onChange={handleVitalChange}
                  placeholder="68"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <FileText className="mr-1" size={16} />
              Clinical Notes
            </label>
            <textarea
              name="clinicalNotes"
              value={formData.clinicalNotes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter detailed clinical observations, examination findings, patient symptoms, etc..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Medications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Pills className="mr-2" size={20} />
              Medications
            </h3>
            
            {/* Add medication form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <input
                type="text"
                placeholder="Medication name"
                value={newMedication.name}
                onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Dosage (e.g., 400mg)"
                value={newMedication.dosage}
                onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Frequency (e.g., twice daily)"
                value={newMedication.frequency}
                onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addMedication}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>

            {/* Medications list */}
            {formData.medications.length > 0 && (
              <div className="space-y-2">
                {formData.medications.map((med) => (
                  <div key={med.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                    <span>
                      <strong>{med.name}</strong> - {med.dosage} {med.frequency && `(${med.frequency})`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMedication(med.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Diagnosis and Follow-up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis
              </label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                placeholder="Primary diagnosis"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Instructions
              </label>
              <input
                type="text"
                name="followUp"
                value={formData.followUp}
                onChange={handleInputChange}
                placeholder="e.g., Return in 2 weeks, Call if symptoms worsen"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={16} />
                  Save Visit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVisit;