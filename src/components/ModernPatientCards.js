import React from 'react';
import patientService from '../services/patientService';

const ModernPatientCard = ({ patient, navigate }) => {
  const fullName = patientService.formatName(patient.name);
  const cleanName = fullName.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
  const age = patientService.calculateAge(patient.birthDate);
  const phone = patient.telecom?.find(t => t.system === 'phone')?.value || 'No phone listed';
  const email = patient.telecom?.find(t => t.system === 'email')?.value || 'No email';

  const getInitials = (name) => {
    return name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase();
  };

  const formatAddress = (address) => {
    if (!address || !Array.isArray(address) || address.length === 0) return 'Location not specified';
    const addr = address[0];
    return `${addr.city || ''}, ${addr.state || ''}`.replace(/^,\s*|,\s*$/, '') || 'Location not specified';
  };

  const getGenderIcon = (gender) => {
    switch(gender?.toLowerCase()) {
      case 'male': case 'm': return '👨';
      case 'female': case 'f': return '👩';
      default: return '👤';
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
    ];
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
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
      border: '1px solid #f1f5f9',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-4px)';
      e.target.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.06)';
    }}>
      
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header with Avatar and Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: getAvatarColor(cleanName),
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: '700',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            position: 'relative'
          }}>
            {getInitials(cleanName)}
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              backgroundColor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}>
              {getGenderIcon(patient.gender)}
            </div>
          </div>
          
          <div>
            <h3 style={{
              margin: '0 0 4px 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#1e293b',
              lineHeight: '1.2'
            }}>
              {cleanName}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#64748b'
            }}>
              <span>{age} years old</span>
              <div style={{
                width: '4px',
                height: '4px',
                backgroundColor: '#cbd5e1',
                borderRadius: '50%'
              }} />
              <span style={{ textTransform: 'capitalize' }}>
                {patient.gender || 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        <div style={{
          padding: '6px 12px',
          backgroundColor: '#dcfce7',
          color: '#166534',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          Active
        </div>
      </div>

      {/* Patient Details Grid */}
      <div style={{
        display: 'grid',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}>
            📞
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Phone</div>
            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>
              {phone.length > 20 ? phone.substring(0, 20) + '...' : phone}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#10b981',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}>
            📍
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Location</div>
            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>
              {formatAddress(patient.address)}
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            border: '1px solid #fde68a',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '500' }}>Race</div>
            <div style={{ fontSize: '14px', color: '#78350f', fontWeight: '600' }}>
              {patient.race || 'Not specified'}
            </div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#fce7f3',
            borderRadius: '12px',
            border: '1px solid #f9a8d4',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', color: '#be185d', fontWeight: '500' }}>Status</div>
            <div style={{ fontSize: '14px', color: '#9d174d', fontWeight: '600' }}>
              {patient.maritalStatus || 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer with ID and Action Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid #f1f5f9'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#94a3b8',
          fontFamily: 'monospace',
          backgroundColor: '#f8fafc',
          padding: '4px 8px',
          borderRadius: '6px'
        }}>
          ID: {patient.id.slice(0, 8)}...
        </div>
        
        <button
          onClick={handleViewDetails}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
          }}
        >
          <span>View Details</span>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Updated Container Component
const ModernPatientGrid = ({ patients, navigate, searchTerm }) => {
  if (patients.length === 0 && searchTerm) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '80px 20px',
        background: 'white',
        borderRadius: '20px',
        margin: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🔍
        </div>
        <h3 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '1.5rem' }}>
          No patients found
        </h3>
        <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>
          Try adjusting your search terms or check the spelling
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '24px',
      padding: '20px'
    }}>
      {patients.map(patient => (
        <ModernPatientCard key={patient.id} patient={patient} navigate={navigate} />
      ))}
    </div>
  );
};

export { ModernPatientCard, ModernPatientGrid };