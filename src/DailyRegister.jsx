import React, { useState } from 'react';

export default function DailyRegister({ feeHistory = [] }) {
  const [cashCounted, setCashCounted] = useState(0);
  const [upiVerified, setUpiVerified] = useState(0);

  // Dynamic transactions from Fee Collection
  const transactions = feeHistory;

  // Real-time calculations
  const cashSystemTotal = transactions.reduce((acc, curr) => acc + Number(curr.cash || 0), 0);
  const upiSystemTotal = transactions.reduce((acc, curr) => acc + Number(curr.upi || 0), 0);
  const grandTotal = cashSystemTotal + upiSystemTotal;

  // Daily Closing difference (Physical counted vs System registered)
  const cashDifference = cashCounted - cashSystemTotal;
  const upiDifference = upiVerified - upiSystemTotal;
  const totalDifference = cashDifference + upiDifference;

  return (
    <div style={{ padding: '24px', backgroundColor: '#ffffff', minHeight: '80vh', borderRadius: '8px', margin: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* HEADER */}
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>
        Daily Cash / UPI Register
      </h2>
      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
        Accounts &rarr; Reports &rarr; Daily Collection / Register
      </p>

      {/* TRANSACTIONS TABLE */}
      <div style={{ overflowX: 'auto', marginBottom: '25px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#dbeafe', color: '#1e3a8a', borderBottom: '2px solid #bfdbfe' }}>
              <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>Date</th>
              <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>Receipt</th>
              <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>Student</th>
              <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>Cash</th>
              <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>UPI</th>
              <th style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontStyle: 'italic', border: '1px solid #cbd5e1' }}>
                  No fee transactions recorded yet. Submit a fee from Fee Collection to see records here.
                </td>
              </tr>
            ) : (
              transactions.map((tx, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>{tx.date}</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#0284c7' }}>{tx.receipt}</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>{tx.student}</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>₹{Number(tx.cash || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1' }}>₹{Number(tx.upi || 0).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>₹{Number(tx.total || 0).toLocaleString()}</td>
                </tr>
              ))
            )}
            {/* TOTAL ROW */}
            <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', borderTop: '2px solid #94a3b8' }}>
              <td colSpan="3" style={{ padding: '10px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>TOTAL</td>
              <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', color: '#0f766e' }}>₹{cashSystemTotal.toLocaleString()}</td>
              <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', color: '#0369a1' }}>₹{upiSystemTotal.toLocaleString()}</td>
              <td style={{ padding: '10px 12px', border: '1px solid #cbd5e1', color: '#15803d' }}>₹{grandTotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* DAILY CLOSING CARD */}
      <div style={{ maxWidth: '520px', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ backgroundColor: '#bfdbfe', padding: '10px 16px', fontWeight: 'bold', color: '#1e3a8a', fontSize: '15px' }}>
          DAILY CLOSING
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '14px', color: '#334155' }}>Cash Counted:</label>
            <input
              type="number"
              value={cashCounted || ''}
              onChange={(e) => setCashCounted(Number(e.target.value))}
              placeholder="0"
              style={{ width: '180px', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '14px', color: '#334155' }}>UPI Verified:</label>
            <input
              type="number"
              value={upiVerified || ''}
              onChange={(e) => setUpiVerified(Number(e.target.value))}
              placeholder="0"
              style={{ width: '180px', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'right' }}
            />
          </div>

          <div style={{ paddingTop: '8px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>Difference:</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: totalDifference === 0 ? '#16a34a' : '#dc2626' }}>
              ₹{totalDifference} {totalDifference === 0 ? '(Balanced)' : '(Discrepancy)'}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', backgroundColor: '#dcfce7', padding: '12px 16px', borderTop: '1px solid #bbf7d0' }}>
          <button
            type="button"
            onClick={() => {
              setCashCounted(cashSystemTotal);
              setUpiVerified(upiSystemTotal);
            }}
            style={{ padding: '6px 14px', backgroundColor: '#ffffff', border: '1px solid #86efac', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
          >
            GENERATE
          </button>
          <button
            type="button"
            onClick={() => {
              if (totalDifference === 0) alert('Closing balances verified and matched!');
              else alert(`Discrepancy detected: ₹${totalDifference}`);
            }}
            style={{ padding: '6px 14px', backgroundColor: '#ffffff', border: '1px solid #86efac', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
          >
            VERIFY
          </button>
          <button
            type="button"
            onClick={() => alert(`Daily Closing Saved! Total: ₹${grandTotal}`)}
            style={{ padding: '6px 14px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            SAVE CLOSING
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            style={{ padding: '6px 14px', backgroundColor: '#ffffff', border: '1px solid #86efac', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
          >
            PRINT
          </button>
          <button
            type="button"
            onClick={() => alert('Daily Register Approved successfully by Admin.')}
            style={{ padding: '6px 14px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            APPROVE
          </button>
        </div>
      </div>
    </div>
  );
}