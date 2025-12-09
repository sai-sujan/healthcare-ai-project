import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

class PatientService {
  // Create new patient (ENHANCED with symptom support)
  async createPatient(patientData) {
    try {
      const patientToSave = {
        ...patientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        active: true,
        // Symptom assessment fields (if provided)
        hasSymptomAssessment: patientData.hasSymptomAssessment || false,
        initialSymptoms: patientData.initialSymptoms || patientData.symptoms || [],
        symptomAdditionalInfo: patientData.symptomAdditionalInfo || patientData.additionalInfo || '',
        aiSymptomAnalysis: patientData.aiSymptomAnalysis || patientData.aiAnalysis || null
      };

      const docRef = await addDoc(collection(db, 'patients'), patientToSave);

      return {
        id: docRef.id,
        ...patientData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        active: true
      };
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new Error(`Failed to create patient: ${error.message}`);
    }
  }

  // Update existing patient
  async updatePatient(patientId, updateData) {
    try {
      const patientRef = doc(db, 'patients', patientId);
      const dataToUpdate = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(patientRef, dataToUpdate);

      return {
        id: patientId,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error updating patient:', error);
      throw new Error(`Failed to update patient: ${error.message}`);
    }
  }

  // Soft delete (mark inactive)
  async deletePatient(patientId) {
    try {
      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, {
        active: false,
        deletedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw new Error(`Failed to delete patient: ${error.message}`);
    }
  }

  // Get all patients (safe query)
  async getAllPatients() {
    try {
      const patientsRef = collection(db, 'patients');
      let q;

      // Try ordering, fall back if index error
      try {
        q = query(patientsRef, orderBy('createdAt', 'desc'));
      } catch (orderError) {
        console.log('Ordering not supported, using simple query');
        q = patientsRef;
      }

      const snapshot = await getDocs(q);
      const patients = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.active !== false);

      return patients;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  // Get single patient
  async getPatient(patientId) {
    try {
      const patientRef = doc(db, 'patients', patientId);
      const patientDoc = await getDoc(patientRef);

      if (patientDoc.exists()) {
        return { id: patientDoc.id, ...patientDoc.data() };
      } else {
        throw new Error('Patient not found');
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  // Get patient encounters
  async getPatientEncounters(patientId) {
    try {
      const encountersRef = collection(db, 'encounters');
      const q = query(encountersRef, where('patientId', '==', patientId));
  
      const snapshot = await getDocs(q);
      const encounters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort client-side by date if available
      encounters.sort((a, b) => {
        const dateA = a.period?.start ? new Date(a.period.start) : new Date(0);
        const dateB = b.period?.start ? new Date(b.period.start) : new Date(0);
        return dateB - dateA; // Newest first
      });
      
      return encounters;
    } catch (error) {
      console.error('Error fetching encounters:', error);
      return [];
    }
  }

  // Get patient conditions
  async getPatientConditions(patientId) {
    try {
      const conditionsRef = collection(db, 'conditions');
      let q = query(conditionsRef, where('patientId', '==', patientId));

      try {
        q = query(conditionsRef, where('patientId', '==', patientId), where('clinicalStatus', '==', 'active'));
      } catch {
        console.log('Active filter not supported, using simple query');
      }

      const snapshot = await getDocs(q);
      const conditions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return conditions.filter(c => c.clinicalStatus !== 'resolved');
    } catch (error) {
      console.error('Error fetching conditions:', error);
      return [];
    }
  }

  // Get patient medications
  async getPatientMedications(patientId) {
    try {
      const medicationsRef = collection(db, 'medications');
      const q = query(medicationsRef, where('patientId', '==', patientId));

      const snapshot = await getDocs(q);
      const medications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort client-side by authored date if available
      medications.sort((a, b) => {
        const dateA = a.authoredOn ? new Date(a.authoredOn) : new Date(0);
        const dateB = b.authoredOn ? new Date(b.authoredOn) : new Date(0);
        return dateB - dateA; // Newest first
      });
      
      return medications;
    } catch (error) {
      console.error('Error fetching medications:', error);
      return [];
    }
  }

  // Get patient procedures
  async getPatientProcedures(patientId) {
    try {
      const proceduresRef = collection(db, 'procedures');
      let q = query(proceduresRef, where('patientId', '==', patientId));

      try {
        q = query(proceduresRef, where('patientId', '==', patientId), orderBy('performedDateTime', 'desc'));
      } catch {
        console.log('Ordered procedures query failed, using simple query');
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching procedures:', error);
      return [];
    }
  }

  // Get patient observations
  async getPatientObservations(patientId) {
    try {
      const observationsRef = collection(db, 'observations');
      let q = query(observationsRef, where('patientId', '==', patientId));

      try {
        q = query(observationsRef, where('patientId', '==', patientId), orderBy('effectiveDateTime', 'desc'), limit(50));
      } catch {
        console.log('Ordered observations query failed, using simple query');
        q = query(observationsRef, where('patientId', '==', patientId), limit(50));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching observations:', error);
      return [];
    }
  }

  // Get patient allergies
  async getPatientAllergies(patientId) {
    try {
      const allergiesRef = collection(db, 'allergies');
      const q = query(
        allergiesRef,
        where('patientId', '==', patientId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching allergies:', error);
      return [];
    }
  }

  // Add medication
  async addMedication(medicationData) {
    try {
      const medicationToSave = {
        ...medicationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
  
      const docRef = await addDoc(collection(db, 'medications'), medicationToSave);
      
      return {
        id: docRef.id,
        ...medicationData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error adding medication:', error);
      throw new Error(`Failed to add medication: ${error.message}`);
    }
  }

  // Add condition
  async addCondition(conditionData) {
    try {
      const conditionToSave = {
        ...conditionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
  
      const docRef = await addDoc(collection(db, 'conditions'), conditionToSave);
      
      return {
        id: docRef.id,
        ...conditionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error adding condition:', error);
      throw new Error(`Failed to add condition: ${error.message}`);
    }
  }

  // ==================== NEW SYMPTOM ASSESSMENT METHODS ====================

  // Get patients with symptom assessments
  async getPatientsWithSymptomAssessments() {
    try {
      const patientsRef = collection(db, 'patients');
      let q;
      
      try {
        q = query(
          patientsRef, 
          where('hasSymptomAssessment', '==', true),
          orderBy('createdAt', 'desc')
        );
      } catch {
        // Fallback if index doesn't exist
        q = query(patientsRef, where('hasSymptomAssessment', '==', true));
      }
      
      const snapshot = await getDocs(q);
      const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      return patients;
    } catch (error) {
      console.error('Error fetching patients with symptom assessments:', error);
      // Fallback: get all patients and filter client-side
      const allPatients = await this.getAllPatients();
      return allPatients.filter(p => p.hasSymptomAssessment === true);
    }
  }

  // Get patient's initial symptom assessment
  async getPatientSymptomAssessment(patientId) {
    try {
      const patient = await this.getPatient(patientId);
      
      if (!patient.hasSymptomAssessment) {
        return null;
      }
      
      return {
        symptoms: patient.initialSymptoms || [],
        additionalInfo: patient.symptomAdditionalInfo || '',
        aiAnalysis: patient.aiSymptomAnalysis || null,
        registrationDate: patient.registrationDate || patient.createdAt
      };
    } catch (error) {
      console.error('Error fetching symptom assessment:', error);
      throw error;
    }
  }

  // Update patient's symptom information
  async updateSymptomAssessment(patientId, symptomData) {
    try {
      const patientRef = doc(db, 'patients', patientId);
      
      const updateData = {
        hasSymptomAssessment: true,
        initialSymptoms: symptomData.symptoms || [],
        symptomAdditionalInfo: symptomData.additionalInfo || '',
        aiSymptomAnalysis: symptomData.aiAnalysis || null,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(patientRef, updateData);
      
      console.log('Symptom assessment updated for patient:', patientId);
      
      return await this.getPatient(patientId);
    } catch (error) {
      console.error('Error updating symptom assessment:', error);
      throw new Error(`Failed to update symptom assessment: ${error.message}`);
    }
  }

  // ==================== END SYMPTOM ASSESSMENT METHODS ====================

  // Search (client-side filter only, avoids index issues)
  async searchPatients(searchTerm) {
    try {
      const patientsRef = collection(db, 'patients');
      let q;

      try {
        q = query(patientsRef, orderBy('createdAt', 'desc'), limit(50));
      } catch {
        console.log('Search query ordering not supported, using simple query');
        q = patientsRef;
      }

      const snapshot = await getDocs(q);
      const patients = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.active !== false);

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return patients.filter(patient => {
          const fullName = this.formatName(patient.name).toLowerCase();
          return fullName.includes(searchLower);
        });
      }

      return patients;
    } catch (error) {
      console.error('Error searching patients:', error);
      return [];
    }
  }

  // Age calculation
  calculateAge(birthDate) {
    if (!birthDate) return 'Unknown';

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  // Get clean name
  getCleanName(nameObj) {
    const fullName = this.formatName(nameObj);
    return fullName.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
  }

  // Name formatter
  formatName(nameObj) {
    if (!nameObj) return 'Unknown Patient';

    if (Array.isArray(nameObj)) {
      const officialName = nameObj.find(n => n.use === 'official') || nameObj[0];
      if (officialName) {
        const given = officialName.given ? officialName.given.join(' ') : '';
        const family = officialName.family || '';
        return `${given} ${family}`.trim() || 'Unknown Patient';
      }
    }

    const given = nameObj.given ? nameObj.given.join(' ') : '';
    const family = nameObj.family || '';

    return `${given} ${family}`.trim() || 'Unknown Patient';
  }

  // Dashboard stats
  async getPatientStats() {
    try {
      const patientsRef = collection(db, 'patients');
      const snapshot = await getDocs(patientsRef);

      const patients = snapshot.docs.map(doc => doc.data()).filter(p => p.active !== false);

      return {
        total: patients.length,
        byGender: {
          male: patients.filter(p => p.gender === 'male').length,
          female: patients.filter(p => p.gender === 'female').length,
          other: patients.filter(p => p.gender === 'other').length
        },
        byAgeGroup: this.calculateAgeGroups(patients),
        newThisMonth: patients.filter(p => {
          const createdAt = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          return createdAt > oneMonthAgo;
        }).length,
        // NEW: Count patients with symptom assessments
        withSymptomAssessment: patients.filter(p => p.hasSymptomAssessment === true).length
      };
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      return { 
        total: 0, 
        byGender: { male: 0, female: 0, other: 0 }, 
        byAgeGroup: {}, 
        newThisMonth: 0,
        withSymptomAssessment: 0
      };
    }
  }

  calculateAgeGroups(patients) {
    const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };

    patients.forEach(p => {
      const age = this.calculateAge(p.birthDate);
      if (typeof age === 'number') {
        if (age <= 18) ageGroups['0-18']++;
        else if (age <= 35) ageGroups['19-35']++;
        else if (age <= 50) ageGroups['36-50']++;
        else if (age <= 65) ageGroups['51-65']++;
        else ageGroups['65+']++;
      }
    });

    return ageGroups;
  }
}

export default new PatientService();