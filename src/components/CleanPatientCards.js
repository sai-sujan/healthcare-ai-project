import React from 'react';
import patientService from '../services/patientService';

const CleanPatientCard = ({ patient, navigate }) => {
  const fullName = patientService.formatName(patient.name);
  const cleanName = fullName.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
  const age = patientService.calculateAge(patient.birthDate);
  const phone = patient.telecom?.find(t => t.system === 'phone')?.value || 'No phone listed';

  const getInitials = (name) => {
    return name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase();
  };

  const formatAddress = (address) => {
    if (!address || !Array.isArray(address) || address.length === 0) return 'Location not specified';
    const addr = address[0];
    return `${addr.city || ''}, ${addr.state || ''}`.replace(/^,\s*|,\s*$/, '') || 'Location not specified';
  };

  const getAvatarColor = (name) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleViewDetails = () => {
    navigate(`/patients/${patient.id}`);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.target.style.borderColor = '#cbd5e1';
      e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
    }}
    onMouseLeave={(e) => {
      e.target.style.borderColor = '#e2e8f0';
      e.target.style.boxShadow = 'none';
    }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: getAvatarColor(cleanName),
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          {getInitials(cleanName)}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 4px 0',
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {cleanName}
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#6b7280'
          }}>
            {age} years old • {patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1) || 'Not specified'}
          </p>
        </div>
        
        <div style={{
          padding: '4px 8px',
          backgroundColor: '#dcfce7',
          color: '#166534',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          Active
        </div>
      </div>

      {/* Details */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          fontSize: '14px',
          color: '#374151'
        }}>
          <span style={{ color: '#6b7280' }}>📞</span>
          <span>{phone}</span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          fontSize: '14px',
          color: '#374151'
        }}>
          <span style={{ color: '#6b7280' }}>📍</span>
          <span>{formatAddress(patient.address)}</span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#374151'
        }}>
          <span style={{ color: '#6b7280' }}>👤</span>
          <span>{patient.race || 'Not specified'} • {patient.maritalStatus || 'Unknown status'}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '12px',
        borderTop: '1px solid #f3f4f6'
      }}>
        <span style={{
          fontSize: '12px',
          color: '#9ca3af',
          fontFamily: 'monospace'
        }}>
          ID: {patient.id.slice(0, 8)}...
        </span>
        
        <button
          onClick={handleViewDetails}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#3b82f6';
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// Clean Grid Component
const CleanPatientGrid = ({ patients, navigate, searchTerm }) => {
  if (patients.length === 0 && searchTerm) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'white',
        borderRadius: '12px',
        margin: '20px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '1.25rem' }}>
          No patients found
        </h3>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Try adjusting your search terms
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '20px',
      padding: '20px'
    }}>
      {patients.map(patient => (
        <CleanPatientCard key={patient.id} patient={patient} navigate={navigate} />
      ))}
    </div>
  );
};

export { CleanPatientCard, CleanPatientGrid };