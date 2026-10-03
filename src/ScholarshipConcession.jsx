import React, { useState } from 'react';

export default function ScholarshipConcession({ students = [] }) {
  const [studentId, setStudentId] = useState('');
  const [originalTuition, setOriginalTuition] = useState('');
  const [concessionAmount, setConcessionAmount] = useState('');
  const [reason, setReason] = useState('');
  const [approvalRef, setApprovalRef] = useState('');

  const netPayable = Math.max(0, Number(originalTuition || 0) - Number(concessionAmount || 0));

  const handleStudentChange = (e) => {
    const sId = e.target.value;
    setStudentId(sId);
    const selected = students.find(s => String(s.id) === String(sId));
    if (selected) {
      setOriginalTuition(Number(selected.tuition_fee || selected.agreedFee || selected.total_fee || 0));
    } else {
      setOriginalTuition('');
    }
  };

  const handleSave = () => {
    if (!studentId) {
      alert('Please select a student first');
      return;
    }
    alert(`Concession Applied Successfully!\nNet Payable: ₹${netPayable.toLocaleString()}`);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', margin: '15px', maxWidth: '750px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>
        Scholarships / Concessions
      </h2>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
        Accounts &rarr; Fee Adjustments &rarr; Scholarship / Concession Approval
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '16px' }}>
        <thead>
          <tr style={{ backgroundColor: '#bfdbfe', color: '#1e3a8a', textAlign: 'left' }}>
            <th colSpan="2" style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              FEE CONCESSION
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', width: '220px', fontWeight: '500' }}>Student</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <select 
                value={studentId} 
                onChange={handleStudentChange}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              >
                <option value="">-- Select Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.admission_no || s.roll_no || s.id} - {s.name || s.student_name}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Original Tuition</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <input 
                type="number"
                placeholder="0"
                value={originalTuition}
                onChange={e => setOriginalTuition(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Approved Concession</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <input 
                type="number"
                placeholder="Enter discount amount"
                value={concessionAmount}
                onChange={e => setConcessionAmount(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </td>
          </tr>
          <tr style={{ backgroundColor: '#f8fafc' }}>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>Net Payable</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: '#16a34a' }}>
              ₹{netPayable.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Reason</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <input 
                type="text"
                placeholder="Reason for concession"
                value={reason}
                onChange={e => setReason(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Approval Ref.</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <input 
                type="text"
                placeholder="Ref No / Document ID"
                value={approvalRef}
                onChange={e => setApprovalRef(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', backgroundColor: '#dcfce7', padding: '10px 14px', borderRadius: '4px', border: '1px solid #86efac' }}>
        <button type="button" onClick={() => alert('Search student details')} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #86efac', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>SEARCH</button>
        <button type="button" onClick={() => { setConcessionAmount(''); setReason(''); setApprovalRef(''); }} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #86efac', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>CLEAR</button>
        <button type="button" onClick={handleSave} style={{ padding: '6px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>SAVE</button>
        <button type="button" onClick={() => window.print()} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #86efac', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>PRINT</button>
      </div>
    </div>
  );
}