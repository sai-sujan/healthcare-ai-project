import React, { useState } from 'react';
import { Camera, Upload, X, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

const MedicalImageAnalyzer = ({ patient }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageType, setImageType] = useState('skin');
  const [additionalContext, setAdditionalContext] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyDSTRJE5cwbmv6Jfe231ktNIpb9AvW12LI';
  // Use Gemini 2.0 Flash - Latest and fastest free model!
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
  const imageTypes = [
    { value: 'skin', label: 'Skin Condition/Rash' },
    { value: 'wound', label: 'Wound/Injury' },
    { value: 'eye', label: 'Eye Condition' },
    { value: 'oral', label: 'Oral/Dental' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'xray', label: 'X-ray/Scan' },
    { value: 'other', label: 'Other Medical Image' }
  ];

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      setSelectedImage(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
  };

  // Convert image to base64
  const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove the data:image/jpeg;base64, prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Get patient info
  const getPatientInfo = () => {
    const name = patient.name?.[0] ? 
      `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim() : 
      'Unknown';
    
    const age = patient.birthDate ? 
      new Date().getFullYear() - new Date(patient.birthDate).getFullYear() : 
      'Unknown';

    return `Patient: ${name}, Age: ${age}, Gender: ${patient.gender || 'Unknown'}`;
  };

  // Analyze image with Gemini Vision
  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64
      const base64Image = await imageToBase64(selectedImage);

      const prompt = `
You are an expert medical AI assistant analyzing a medical image. 

PATIENT INFORMATION:
${getPatientInfo()}

IMAGE TYPE: ${imageTypes.find(t => t.value === imageType)?.label}

ADDITIONAL CONTEXT FROM HEALTHCARE PROVIDER:
${additionalContext || 'None provided'}

Please analyze this medical image and provide a comprehensive assessment:

1. **IMAGE DESCRIPTION**
   - Describe what you observe in the image
   - Location and distribution of any findings
   - Size, color, texture, and other physical characteristics
   - Any visible patterns or unusual features

2. **PRELIMINARY ASSESSMENT**
   - List 3-5 possible conditions that match the observed features (in order of likelihood)
   - For each condition:
     * Why it matches the visual characteristics
     * Typical presentation and key features
     * Common causes or risk factors

3. **SEVERITY EVALUATION**
   - Assess the apparent severity (Mild/Moderate/Severe)
   - Identify any concerning features
   - Red flags that would require immediate attention

4. **DIFFERENTIAL DIAGNOSIS**
   - What conditions should be ruled out
   - Key distinguishing features to look for
   - Additional information needed for accurate diagnosis

5. **RECOMMENDED ACTIONS**
   - Should the patient seek immediate medical attention?
   - What type of specialist would be most appropriate?
   - What diagnostic tests or procedures might be needed?
   - Timeline for follow-up

6. **PATIENT CARE CONSIDERATIONS**
   - Self-care measures (if appropriate)
   - What to monitor
   - When to seek urgent care
   - Lifestyle or environmental factors to consider

7. **DOCUMENTATION NOTES**
   - Key features for medical documentation
   - Measurements or characteristics to track
   - Comparison points for future monitoring

CRITICAL GUIDELINES:
- This is a preliminary visual assessment only, NOT a definitive diagnosis
- Base observations on visible features in the image
- Be specific about what you can and cannot determine from the image
- Highlight any limitations of image-based assessment
- Always recommend professional medical evaluation
- If the image quality is poor or unclear, state that explicitly
- Do not provide treatment recommendations - only suggest evaluation

FORMAT:
Use clear sections with bullet points. Be professional, detailed, and clinically accurate.
      `;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: selectedImage.type,
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 3072,
            candidateCount: 1
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const analysisText = data.candidates[0].content.parts[0].text;
        setAnalysis({
          text: analysisText,
          timestamp: new Date().toISOString(),
          imageType: imageTypes.find(t => t.value === imageType)?.label,
          patientInfo: getPatientInfo()
        });
      } else {
        throw new Error('Invalid response from AI');
      }

    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(`Failed to analyze image: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid #f1f5f9'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Camera size={24} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
            Medical Image Analyzer
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Upload medical photos for AI-powered visual analysis
          </p>
        </div>
      </div>

      {!analysis ? (
        <>
          {/* Image Upload Section */}
          {!imagePreview ? (
            <div style={{
              border: '2px dashed #e2e8f0',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              marginBottom: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#ec4899'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            onClick={() => document.getElementById('imageUpload').click()}
            >
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <ImageIcon size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#475569' }}>
                Upload Medical Image
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748b' }}>
                Click to browse or drag and drop
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                Supports: JPG, PNG, WebP (Max 10MB)
              </p>
            </div>
          ) : (
            <>
              {/* Image Preview */}
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                    Selected Image
                  </h4>
                  <button
                    onClick={removeImage}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <X size={14} />
                    Remove
                  </button>
                </div>
                <img
                  src={imagePreview}
                  alt="Medical preview"
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    backgroundColor: '#000000',
                    border: '1px solid #e2e8f0'
                  }}
                />
                <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  File: {selectedImage?.name} ({(selectedImage?.size / 1024).toFixed(2)} KB)
                </p>
              </div>

              {/* Image Type Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Image Type *
                </label>
                <select
                  value={imageType}
                  onChange={(e) => setImageType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  {imageTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Context */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Additional Context (Optional)
                </label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Describe symptoms, onset time, relevant medical history, specific concerns..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'start',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Analyze Button */}
          {imagePreview && (
            <button
              onClick={analyzeImage}
              disabled={analyzing}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: analyzing ? '#9ca3af' : '#ec4899',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: analyzing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {analyzing ? (
                <>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing Image with AI...
                </>
              ) : (
                <>
                  <Camera size={20} />
                  Analyze Image with Gemini Vision
                </>
              )}
            </button>
          )}
        </>
      ) : (
        // Analysis Results
        <div>
          {/* Image Thumbnail */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            border: '1px solid #e2e8f0'
          }}>
            <img
              src={imagePreview}
              alt="Analyzed"
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                {analysis.imageType}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {analysis.patientInfo}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Analyzed: {new Date(analysis.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Analysis Result */}
          <div style={{
            backgroundColor: '#fef2f2',
            border: '2px solid #fca5a5',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={24} color="#dc2626" />
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#dc2626' }}>
                AI Visual Analysis
              </h4>
              <span style={{
                marginLeft: 'auto',
                padding: '4px 10px',
                backgroundColor: 'white',
                color: '#dc2626',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                Gemini Vision
              </span>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid #fca5a5',
              maxHeight: '600px',
              overflowY: 'auto'
            }}>
              <div style={{
                whiteSpace: 'pre-wrap',
                fontSize: '14px',
                lineHeight: '1.7',
                color: '#374151'
              }}>
                {analysis.text}
              </div>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#92400e',
              display: 'flex',
              alignItems: 'start',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Important Disclaimer:</strong> This is an AI-powered preliminary visual assessment based on image analysis only. It is NOT a medical diagnosis. Always consult with a qualified healthcare professional for proper medical evaluation, diagnosis, and treatment.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={removeImage}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#ec4899',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Analyze Another Image
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default MedicalImageAnalyzer;