import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, Activity, FileText, Pills, Clock, AlertCircle } from 'lucide-react';

const VisitList = ({ patientId }) => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVisit, setExpandedVisit] = useState(null);

  useEffect(() => {
    fetchVisits();
  }, [patientId]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patients/${patientId}/visits`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch visits');
      }
      
      const data = await response.json();
      setVisits(data.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate)));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching visits:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleVisitExpansion = (visitId) => {
    setExpandedVisit(expandedVisit === visitId ? null : visitId);
  };

  const getVitalsSummary = (vitals) => {
    const summary = [];
    if (vitals.bloodPressure) summary.push(`BP: ${vitals.bloodPressure}`);
    if (vitals.temperature) summary.push(`Temp: ${vitals.temperature}°F`);
    if (vitals.pulse) summary.push(`Pulse: ${vitals.pulse} BPM`);
    return summary.join(' | ');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-300 rounded"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center text-red-600">
          <AlertCircle className="mr-2" size={20} />
          <span>Error loading visits: {error}</span>
        </div>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Visits Yet</h3>
        <p className="text-gray-600">This patient has no recorded visits.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Calendar className="mr-2" size={24} />
          Medical History ({visits.length} visits)
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {visits.map((visit) => (
          <div key={visit.id} className="p-6">
            {/* Visit Header */}
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-md"
              onClick={() => toggleVisitExpansion(visit.id)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {formatDate(visit.visitDate)}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Clock className="mr-1" size={12} />
                    {formatTime(visit.visitDate)}
                  </p>
                </div>
                <div className="hidden md:block">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {visit.chiefComplaint}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {visit.diagnosis && (
                  <span className="text-sm text-gray-600 hidden lg:block">
                    Dx: {visit.diagnosis}
                  </span>
                )}
                {expandedVisit === visit.id ? (
                  <ChevronUp className="text-gray-400" size={20} />
                ) : (
                  <ChevronDown className="text-gray-400" size={20} />
                )}
              </div>
            </div>

            {/* Mobile Chief Complaint */}
            <div className="md:hidden mt-2 ml-14">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {visit.chiefComplaint}
              </span>
            </div>

            {/* Expanded Content */}
            {expandedVisit === visit.id && (
              <div className="mt-4 ml-14 space-y-4">
                {/* Vital Signs */}
                {getVitalsSummary(visit.vitals) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 flex items-center mb-2">
                      <Activity className="mr-1" size={16} />
                      Vital Signs
                    </h4>
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm text-gray-700">{getVitalsSummary(visit.vitals)}</p>
                      {(visit.vitals.weight || visit.vitals.height) && (
                        <p className="text-sm text-gray-700 mt-1">
                          {visit.vitals.weight && `Weight: ${visit.vitals.weight} lbs`}
                          {visit.vitals.weight && visit.vitals.height && ' | '}
                          {visit.vitals.height && `Height: ${visit.vitals.height} in`}
                        </p>
                      )}
                      {(visit.vitals.respiratoryRate || visit.vitals.oxygenSaturation) && (
                        <p className="text-sm text-gray-700 mt-1">
                          {visit.vitals.respiratoryRate && `RR: ${visit.vitals.respiratoryRate}`}
                          {visit.vitals.respiratoryRate && visit.vitals.oxygenSaturation && ' | '}
                          {visit.vitals.oxygenSaturation && `SpO2: ${visit.vitals.oxygenSaturation}%`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Clinical Notes */}
                {visit.clinicalNotes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 flex items-center mb-2">
                      <FileText className="mr-1" size={16} />
                      Clinical Notes
                    </h4>
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{visit.clinicalNotes}</p>
                    </div>
                  </div>
                )}

                {/* Medications */}
                {visit.medications && visit.medications.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 flex items-center mb-2">
                      <Pills className="mr-1" size={16} />
                      Medications Prescribed
                    </h4>
                    <div className="bg-gray-50 rounded-md p-3">
                      <div className="space-y-2">
                        {visit.medications.map((medication, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 font-medium">
                              {medication.name}
                            </span>
                            <span className="text-sm text-gray-600">
                              {medication.dosage} {medication.frequency && `- ${medication.frequency}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Diagnosis and Follow-up */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visit.diagnosis && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Diagnosis</h4>
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-800">{visit.diagnosis}</p>
                      </div>
                    </div>
                  )}
                  
                  {visit.followUp && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Follow-up</h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <p className="text-sm text-yellow-800">{visit.followUp}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Visit Metadata */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Visit recorded on {formatDate(visit.createdAt || visit.visitDate)}
                    {visit.updatedAt && visit.updatedAt !== visit.createdAt && 
                      ` • Last updated ${formatDate(visit.updatedAt)}`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitList;