import React, { useState } from 'react';

export default function RefundCancellation({ feeHistory = [] }) {
  const [receiptNo, setReceiptNo] = useState('');
  const [studentName, setStudentName] = useState('');
  const [originalPaid, setOriginalPaid] = useState('');
  const [approvedRefund, setApprovedRefund] = useState('');
  const [reason, setReason] = useState('');
  const [refundMode, setRefundMode] = useState('Bank');
  const [approvalRef, setApprovalRef] = useState('');

  const handleSearchReceipt = () => {
    if (!receiptNo.trim()) {
      alert('Enter a Receipt No to search');
      return;
    }
    const found = feeHistory.find(tx => String(tx.receipt || tx.receipt_no || '').toLowerCase() === receiptNo.trim().toLowerCase());
    if (found) {
      setStudentName(found.student || found.student_name || '');
      setOriginalPaid(found.total || found.amount || 0);
      alert(`Receipt found for: ${found.student || found.student_name}`);
    } else {
      alert(`Receipt "${receiptNo}" not found in current session.`);
    }
  };

  const handlePostRefund = () => {
    if (!approvedRefund || Number(approvedRefund) <= 0) {
      alert('Please enter a valid refund amount');
      return;
    }
    alert(`Refund Posted Successfully!\nAmount: ₹${Number(approvedRefund).toLocaleString()}\nMode: ${refundMode}`);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', margin: '15px', maxWidth: '750px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>
        Refund / Cancellation
      </h2>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
        Accounts &rarr; Refunds &rarr; Search original receipt & Post Refund
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '16px' }}>
        <thead>
          <tr style={{ backgroundColor: '#bfdbfe', color: '#1e3a8a', textAlign: 'left' }}>
            <th colSpan="2" style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              REFUND
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', width: '220px', fontWeight: '500' }}>Receipt No.</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <input 
                type="text" 
                placeholder="Enter Receipt No (e.g. REC/2026/...)"
                value={receiptNo} 
                onChange={e => setReceiptNo(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Student</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <input 
                type="text" 
                placeholder="Student Name"
                value={studentName} 
                onChange={e => setStudentName(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Original Paid</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <input 
                type="number" 
                placeholder="0"
                value={originalPaid} 
                onChange={e => setOriginalPaid(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Approved Refund</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <input 
                type="number" 
                placeholder="Enter Refund Amount"
                value={approvedRefund} 
                onChange={e => setApprovedRefund(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 'bold', color: '#dc2626' }}
              />
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Reason</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <input 
                type="text" 
                placeholder="Reason for refund"
                value={reason} 
                onChange={e => setReason(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Refund Mode</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <select 
                value={refundMode} 
                onChange={e => setRefundMode(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              >
                <option value="Bank">Bank</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Approval Ref.</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <input 
                type="text" 
                placeholder="REF/2026/..."
                value={approvalRef} 
                onChange={e => setApprovalRef(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', backgroundColor: '#dcfce7', padding: '10px 14px', borderRadius: '4px', border: '1px solid #86efac' }}>
        <button type="button" onClick={handleSearchReceipt} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #86efac', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>SEARCH</button>
        <button type="button" onClick={handlePostRefund} style={{ padding: '6px 14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>POST REFUND</button>
        <button type="button" onClick={() => window.print()} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #86efac', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>PRINT</button>
      </div>
    </div>
  );
}