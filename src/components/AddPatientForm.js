import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patientService from '../services/patientService';


const AddPatientForm = ({ mode = "add", existingPatient = null }) => {
    useEffect(() => {
        if (mode === "edit" && existingPatient) {
          setFormData({
            name: existingPatient.name || [{ use: 'official', family: '', given: [''] }],
            gender: existingPatient.gender || '',
            birthDate: existingPatient.birthDate || '',
            telecom: existingPatient.telecom || [
              { system: 'phone', value: '' },
              { system: 'email', value: '' }
            ],
            address: existingPatient.address || [{
              use: 'home',
              line: [''],
              city: '',
              state: '',
              postalCode: '',
              country: 'US'
            }],
            race: existingPatient.race || '',
            ethnicity: existingPatient.ethnicity || '',
            maritalStatus: existingPatient.maritalStatus || '',
            emergencyContact: existingPatient.emergencyContact || { name: '', relationship: '', phone: '' },
            insurance: existingPatient.insurance || { provider: '', memberId: '' }
          });
        }
      }, [mode, existingPatient]);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: [{ use: 'official', family: '', given: [''] }],
    gender: '',
    birthDate: '',
    telecom: [
      { system: 'phone', value: '' },
      { system: 'email', value: '' }
    ],
    address: [{
      use: 'home',
      line: [''],
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }],
    race: '',
    ethnicity: '',
    maritalStatus: '',
    emergencyContact: { name: '', relationship: '', phone: '' },
    insurance: { provider: '', memberId: '' }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      name: [{ ...prev.name[0], [field]: field === 'given' ? [value] : value }]
    }));
  };

  const handleTelecomChange = (system, value) => {
    setFormData(prev => ({
      ...prev,
      telecom: prev.telecom.map(t => t.system === system ? { ...t, value } : t)
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: [{ ...prev.address[0], [field]: field === 'line' ? [value] : value }]
    }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [field]: value }
    }));
  };

  const handleInsuranceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      insurance: { ...prev.insurance, [field]: value }
    }));
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.name[0].given[0] || !formData.name[0].family) errors.push('First and last name required');
    if (!formData.gender) errors.push('Gender required');
    if (!formData.birthDate) errors.push('Birth date required');
    if (!formData.telecom.find(t => t.system === 'phone')?.value) errors.push('Phone number required');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const patientData = {
        resourceType: 'Patient',
        name: formData.name,
        gender: formData.gender,
        birthDate: formData.birthDate,
        telecom: formData.telecom.filter(t => t.value),
        address: formData.address,
        race: formData.race,
        ethnicity: formData.ethnicity,
        maritalStatus: formData.maritalStatus,
        emergencyContact: formData.emergencyContact,
        insurance: formData.insurance,
        active: true
      };
        let savedPatient;
        if (mode === "edit" && existingPatient?.id) {
        savedPatient = await patientService.updatePatient(existingPatient.id, patientData);
        } else {
        savedPatient = await patientService.createPatient(patientData);
        }
        navigate(`/patients/${savedPatient.id}`);

    } catch (err) {
      setError('Failed to create patient: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0'
  };

  const subtitleStyle = {
    color: '#6b7280',
    fontSize: '1rem',
    margin: 0
  };

  const buttonStyle = {
    background: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  };

  const formStyle = {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    border: '1px solid #e5e7eb'
  };

  const sectionStyle = {
    padding: '40px',
    borderBottom: '1px solid #f3f4f6'
  };

  const sectionTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 24px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '12px',
    borderBottom: '3px solid #0066cc'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px'
  };

  const fieldGroupStyle = {
    display: 'flex',
    flexDirection: 'column'
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const inputStyle = {
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    color: '#111827',
    background: 'white',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  };

  const inputFocusStyle = {
    outline: 'none',
    borderColor: '#0066cc',
    boxShadow: '0 0 0 3px rgba(0, 102, 204, 0.1)'
  };

  const selectStyle = {
    ...inputStyle,
    backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%23374151\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px',
    appearance: 'none'
  };

  const actionsStyle = {
    padding: '32px 40px',
    background: 'linear-gradient(135deg, #f9fafb 0%, white 100%)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '2px solid #f3f4f6'
  };

  const primaryButtonStyle = {
    background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
    color: 'white',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '160px',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s'
  };

  const secondaryButtonStyle = {
    background: 'white',
    color: '#374151',
    border: '2px solid #d1d5db',
    padding: '16px 32px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s'
  };

  const errorStyle = {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    color: '#dc2626'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
        <h2 style={titleStyle}>
  {mode === "edit" ? "Edit Patient" : "Patient Registration"}
</h2>
<p style={subtitleStyle}>
  {mode === "edit" ? "Update patient details" : "Complete patient intake and registration"}
</p>

        </div>
        <button 
          onClick={() => navigate('/patients')}
          style={buttonStyle}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Registry
        </button>
      </div>

      {error && (
        <div style={errorStyle}>
          <h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Registration Error</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

    <form onSubmit={handleSubmit} style={formStyle}>
        {/* Personal Information */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <svg width="24" height="24" fill="#0066cc" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Personal Information
          </h3>
          <div style={gridStyle}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                First Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name[0].given[0]}
                onChange={(e) => handleNameChange('given', e.target.value)}
                style={inputStyle}
                placeholder="Enter first name"
                required
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
            
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Last Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name[0].family}
                onChange={(e) => handleNameChange('family', e.target.value)}
                style={inputStyle}
                placeholder="Enter last name"
                required
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
            
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Date of Birth <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                style={inputStyle}
                required
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
            
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Gender <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                style={selectStyle}
                required
              >
                <option value="">Please select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="unknown">Prefer not to answer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div style={{ ...sectionStyle, background: '#f9fafb' }}>
          <h3 style={sectionTitleStyle}>
            <svg width="24" height="24" fill="#0066cc" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            Contact Information
          </h3>
          <div style={gridStyle}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Phone Number <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="tel"
                value={formData.telecom.find(t => t.system === 'phone')?.value || ''}
                onChange={(e) => handleTelecomChange('phone', e.target.value)}
                style={inputStyle}
                placeholder="(555) 123-4567"
                required
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
            
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={formData.telecom.find(t => t.system === 'email')?.value || ''}
                onChange={(e) => handleTelecomChange('email', e.target.value)}
                style={inputStyle}
                placeholder="patient@example.com"
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>
            <svg width="24" height="24" fill="#0066cc" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            Address Information
          </h3>
          <div style={gridStyle}>
            <div style={{ ...fieldGroupStyle, gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Street Address</label>
              <input
                type="text"
                value={formData.address[0].line[0]}
                onChange={(e) => handleAddressChange('line', e.target.value)}
                style={inputStyle}
                placeholder="123 Main Street, Apt 4B"
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
            
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>City</label>
              <input
                type="text"
                value={formData.address[0].city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                style={inputStyle}
                placeholder="Boston"
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
            
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>State</label>
              <select
                value={formData.address[0].state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                style={selectStyle}
              >
                <option value="">Select state</option>
                <option value="Massachusetts">Massachusetts</option>
                <option value="Connecticut">Connecticut</option>
                <option value="Rhode Island">Rhode Island</option>
                <option value="New Hampshire">New Hampshire</option>
                <option value="Vermont">Vermont</option>
                <option value="Maine">Maine</option>
                <option value="New York">New York</option>
                <option value="California">California</option>
                <option value="Texas">Texas</option>
                <option value="Florida">Florida</option>
              </select>
            </div>
            
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>ZIP Code</label>
              <input
                type="text"
                value={formData.address[0].postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                style={inputStyle}
                placeholder="02101"
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div style={{ ...sectionStyle, background: '#f9fafb' }}>
          <h3 style={sectionTitleStyle}>
            <svg width="24" height="24" fill="#0066cc" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Emergency Contact
          </h3>
          <div style={gridStyle}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Contact Name</label>
              <input
                type="text"
                value={formData.emergencyContact.name}
                onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                style={inputStyle}
                placeholder="Jane Smith"
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
            
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Relationship</label>
              <select
                value={formData.emergencyContact.relationship}
                onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                style={selectStyle}
              >
                <option value="">Select relationship</option>
                <option value="spouse">Spouse</option>
                <option value="parent">Parent</option>
                <option value="child">Child</option>
                <option value="sibling">Sibling</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Contact Phone</label>
              <input
                type="tel"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                style={inputStyle}
                placeholder="(555) 987-6543"
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={actionsStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '0.875rem' }}>
            <svg width="16" height="16" fill="#6b7280" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            All information is encrypted and HIPAA compliant
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              type="button"
              onClick={() => navigate('/patients')}
              style={secondaryButtonStyle}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={primaryButtonStyle}
              disabled={loading}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                        {mode === "edit" ? "Updating..." : "Registering..."}  {/* ✅ CHANGE HERE */}
                </div>
              ) : (
                <>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                  {mode === "edit" ? "Update Patient" : "Register Patient"}  {/* ✅ CHANGE HERE */}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPatientForm;