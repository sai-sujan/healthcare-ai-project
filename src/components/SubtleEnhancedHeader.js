import React from 'react';

const SubtleEnhancedHeader = ({ searchTerm, onSearchChange, patientCount }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      position: 'relative'
    }}>
      
      {/* Subtle accent line */}
      {/* <div style={{
        position: 'absolute',
        top: 0,
        left: '24px',
        right: '24px',
        height: '3px',
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
        borderRadius: '3px'
      }} /> */}

      {/* Header Content */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '2rem',
          fontWeight: '700',
          color: '#1f2937',
          letterSpacing: '-0.025em'
        }}>
          Patient Registry
        </h1>
        <p style={{
          margin: 0,
          fontSize: '1rem',
          color: '#6b7280'
        }}>
          Manage and view patient records from your healthcare database
        </p>
      </div>

      {/* Enhanced Search Section */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'absolute',
            left: '16px',
            zIndex: 2,
            color: '#9ca3af'
          }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input
            type="text"
            placeholder="Search patients by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              fontSize: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              backgroundColor: '#f8fafc',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.backgroundColor = 'white';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        
        {/* Results counter with subtle styling */}
        <div style={{
          marginTop: '12px',
          textAlign: 'center'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#6b7280',
            backgroundColor: '#f1f5f9',
            padding: '4px 12px',
            borderRadius: '20px',
            display: 'inline-block'
          }}>
            Showing {patientCount} of {patientCount} patients
          </span>
        </div>
      </div>

      {/* Subtle stats indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        marginTop: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#10b981',
            borderRadius: '50%'
          }} />
          <span>Active System</span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#3b82f6',
            borderRadius: '50%'
          }} />
          <span>500+ Records</span>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#f59e0b',
            borderRadius: '50%'
          }} />
          <span>Real-time Updates</span>
        </div>
      </div>
    </div>
  );
};

export default SubtleEnhancedHeader;