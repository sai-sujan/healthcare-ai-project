import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import patientService from "../services/patientService";
import AddPatientForm from "./AddPatientForm"; // we’ll extend this form

const EditPatientPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await patientService.getPatient(id); // ✅ fixed
        setPatient(data);
      } catch (err) {
        setError("Failed to load patient: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <AddPatientForm
      mode="edit"
      existingPatient={patient} // 👈 prefill all fields
      onSuccess={(updatedPatient) => navigate(`/patients/${updatedPatient.id}`)}
    />
  );
};

export default EditPatientPage;
