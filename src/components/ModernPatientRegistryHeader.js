import React, { useState } from 'react';

const ModernPatientRegistryHeader = ({ searchTerm, onSearchChange, patientCount }) => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '24px',
      padding: '48px 40px',
      marginBottom: '32px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(102, 126, 234, 0.15)'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Floating Icons */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        fontSize: '60px',
        opacity: 0.1,
        color: 'white',
        transform: 'rotate(-15deg)'
      }}>
        🏥
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        fontSize: '40px',
        opacity: 0.1,
        color: 'white',
        transform: 'rotate(15deg)'
      }}>
        📋
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: '2.5rem',
              fontWeight: '700',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Patient Registry
            </h1>
            <p style={{
              margin: 0,
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '400'
            }}>
              Comprehensive healthcare management and patient records
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '16px 20px',
              textAlign: 'center',
              minWidth: '120px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '4px'
              }}>
                {patientCount || 0}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '500'
              }}>
                Total Patients
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '16px 20px',
              textAlign: 'center',
              minWidth: '120px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '4px'
              }}>
                Active
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '500'
              }}>
                System Status
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Enhanced Search Bar */}
          <div style={{
            flex: 1,
            minWidth: '300px',
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
                zIndex: 3,
                color: searchFocused ? '#667eea' : '#94a3b8',
                transition: 'color 0.2s ease'
              }}>
                🔍
              </div>
              
              <input
                type="text"
                placeholder="Search patients by name, ID, or medical record..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 50px',
                  fontSize: '16px',
                  border: 'none',
                  borderRadius: '16px',
                  backgroundColor: 'white',
                  boxShadow: searchFocused 
                    ? '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 3px rgba(102, 126, 234, 0.2)' 
                    : '0 4px 16px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  color: '#374151',
                  fontWeight: '500'
                }}
              />
            </div>

            {/* Search Suggestions/Tips */}
            {searchFocused && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: '1px solid #e2e8f0',
                zIndex: 10
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Search Tips:
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  lineHeight: '1.4'
                }}>
                  • Type patient name (first or last)
                  <br />
                  • Enter medical record number
                  <br />
                  • Search by partial information
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }}>
              <span style={{ fontSize: '16px' }}>📊</span>
              Analytics
            </button>

            <button style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              color: '#667eea',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
            }}>
              <span style={{ fontSize: '16px' }}>👤</span>
              Add Patient
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div style={{
          marginTop: '24px',
          display: 'flex',
          gap: '16px',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.8)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '50%'
            }}></div>
            Active Records: {patientCount || 0}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#f59e0b',
              borderRadius: '50%'
            }}></div>
            Recent Updates: 12
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%'
            }}></div>
            Pending Reviews: 3
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernPatientRegistryHeader;