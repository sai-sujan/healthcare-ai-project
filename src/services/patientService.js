import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    query, 
    where, 
    orderBy, 
    limit 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  class PatientService {
    // Get all patients with basic info
    async getAllPatients() {
      try {
        const patientsRef = collection(db, 'patients');
        const snapshot = await getDocs(patientsRef);
        
        const patients = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            birthDate: data.birthDate,
            gender: data.gender,
            telecom: data.telecom,
            address: data.address,
            race: data.race,
            ethnicity: data.ethnicity,
            maritalStatus: data.maritalStatus,
            createdAt: data.createdAt
          };
        });
        
        return patients;
      } catch (error) {
        console.error('Error fetching patients:', error);
        throw error;
      }
    }
  
    // Get single patient with full details
    async getPatient(patientId) {
      try {
        const patientRef = doc(db, 'patients', patientId);
        const patientDoc = await getDoc(patientRef);
        
        if (patientDoc.exists()) {
          return {
            id: patientDoc.id,
            ...patientDoc.data()
          };
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
        const q = query(
          encountersRef, 
          where('patientId', '==', patientId)
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching encounters:', error);
        return [];
      }
    }
  
    // Get patient conditions
    async getPatientConditions(patientId) {
      try {
        const conditionsRef = collection(db, 'conditions');
        const q = query(conditionsRef, where('patientId', '==', patientId));
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching conditions:', error);
        return [];
      }
    }
  
    // Calculate patient age
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
  
    // Format patient name
    formatName(nameObj) {
      if (!nameObj) return 'Unknown Patient';
      
      const given = nameObj.given ? nameObj.given.join(' ') : '';
      const family = nameObj.family || '';
      
      return `${given} ${family}`.trim() || 'Unknown Patient';
    }
  }
  
  export default new PatientService();