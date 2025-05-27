import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PrescriptionDashboard = () => {
  const contentRef = useRef();
  const [medicines, setMedicines] = useState([{ id: 1, name: 'Amoxicillin 500mg' }]);
  const [newMedicine, setNewMedicine] = useState('');

  const handleDownload = async () => {
    const content = contentRef.current;
    const canvas = await html2canvas(content);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('prescription.pdf');
  };

  const handleEditMedicine = (id, newValue) => {
    setMedicines(medicines.map(med => (med.id === id ? { ...med, name: newValue } : med)));
  };

  const handleDeleteMedicine = id => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const handleAddMedicine = () => {
    if (newMedicine.trim()) {
      setMedicines([...medicines, { id: Date.now(), name: newMedicine.trim() }]);
      setNewMedicine('');
    }
  };

  return (
    <div className="p-4">
      <div
        ref={contentRef}
        className="max-w-3xl mx-auto p-6 border rounded-lg shadow-md bg-white"
      >
        <header className="flex justify-between border-b pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold">Gangaram Hospital</h1>
            <div className="flex gap-4 text-sm mt-1">
              <span>License # 12312844</span>
              <span>NPI # 123434357416</span>
            </div>
          </div>
          <div className="text-right text-sm">
            <h2 className="text-base font-semibold">RESIDENT PHYSICIAN M.D</h2>
            <p>Prime Example Hospital</p>
            <p>1 Main Street</p>
            <p>NY, NY 10000</p>
            <p>(888)888-8888</p>
          </div>
        </header>

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <div className="w-1/2 flex">
              <span className="font-semibold w-24">Name:</span>
              <span>Aarohi Sharma</span>
            </div>
            <div className="w-1/2 flex">
              <span className="font-semibold w-24">Date:</span>
              <span>4/15/10</span>
            </div>
          </div>
        </div>

        <div className="text-right my-8">
          <div className="border-t w-48 ml-auto mb-1"></div>
          <p>Resident Physician</p>
          <p className="italic">(Signature)</p>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Refills:</h3>
          <div className="flex gap-4">
            <div className="border px-4 py-1">Dispense as Written</div>
            <div className="border px-4 py-1">May Substitute</div>
          </div>
        </div>

        <div className="flex justify-around text-sm italic my-6">
          <span>Doctor Information</span>
          <span>Patient Information</span>
          <span>Drug Information</span>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Updated Medications:</h3>
          <div className="space-y-2">
            {medicines.map(med => (
              <div key={med.id} className="flex gap-2">
                <input
                  type="text"
                  value={med.name}
                  className="flex-1 border px-2 py-1 rounded"
                  onChange={(e) => handleEditMedicine(med.id, e.target.value)}
                />
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => handleDeleteMedicine(med.id)}
                >
                  Delete
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add new medicine"
                className="flex-1 border px-2 py-1 rounded"
                value={newMedicine}
                onChange={(e) => setNewMedicine(e.target.value)}
              />
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={handleAddMedicine}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <footer className="text-center text-sm mt-8">
          <a
            href="https://www.wikihow.com/Read-a-Doctor's-Prescription"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            wiki How to Read a Doctor's Prescription
          </a>
        </footer>
      </div>

      <button
        className="block mx-auto mt-6 bg-blue-600 text-white px-6 py-2 rounded shadow"
        onClick={handleDownload}
      >
        Download Prescription
      </button>
    </div>
  );
};

export default PrescriptionDashboard;
