import React, { useState } from 'react';

export default function ManagementDashboard({ students = [], feeHistory = [] }) {
  const [selectedMonth, setSelectedMonth] = useState('October 2026');

  // Calculates directly from actual students & actual collected history (0 if empty)
  const totalDemand = students.reduce((acc, curr) => acc + Number(curr.agreedFee || curr.tuition_fee || curr.total_fee || 0), 0);
  
  const cashCollected = feeHistory
    .filter(tx => (tx.mode || tx.payment_mode || '').toLowerCase() === 'cash')
    .reduce((acc, curr) => acc + Number(curr.total || curr.amount || 0), 0);

  const upiCollected = feeHistory
    .filter(tx => (tx.mode || tx.payment_mode || '').toLowerCase() !== 'cash')
    .reduce((acc, curr) => acc + Number(curr.total || curr.amount || 0), 0);

  const totalCollection = cashCollected + upiCollected;
  const outstanding = Math.max(0, totalDemand - totalCollection);

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', margin: '15px', maxWidth: '800px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>
        Management Dashboard & Monthly Review
      </h2>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
        Dashboard &rarr; Review Total Demand vs Collection & Outstanding
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '16px' }}>
        <thead>
          <tr style={{ backgroundColor: '#bfdbfe', color: '#1e3a8a', textAlign: 'left' }}>
            <th colSpan="2" style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              MONTHLY DASHBOARD
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', width: '220px', fontWeight: '500' }}>Month</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              <input 
                type="text" 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Total Demand</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
              ₹{totalDemand.toLocaleString()}
            </td>
          </tr>
          <tr style={{ backgroundColor: '#f0fdf4' }}>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Collection</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: '#16a34a' }}>
              ₹{totalCollection.toLocaleString()}
            </td>
          </tr>
          <tr style={{ backgroundColor: '#fef2f2' }}>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Outstanding</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: '#dc2626' }}>
              ₹{outstanding.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>Cash</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              ₹{cashCollected.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '500' }}>UPI/Bank</td>
            <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>
              ₹{upiCollected.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', backgroundColor: '#dcfce7', padding: '10px 14px', borderRadius: '4px', border: '1px solid #86efac' }}>
        <button type="button" onClick={() => window.location.reload()} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #86efac', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>REFRESH</button>
        <button type="button" onClick={() => alert(`Total Outstanding Amount: ₹${outstanding.toLocaleString()}`)} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #86efac', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>OUTSTANDING</button>
        <button type="button" onClick={() => window.print()} style={{ padding: '6px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>PRINT</button>
      </div>
    </div>
  );
}