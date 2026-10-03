import React, { useState, useEffect } from "react";

export default function FeeCollection() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/students");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    if ((paymentMode === "UPI" || paymentMode === "Bank") && !referenceNo.trim()) {
      alert("Transaction Reference / UTR Number is required for UPI/Bank Transfer");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/fees/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent,
          amount: Number(amount),
          payment_mode: paymentMode,
          reference_no: referenceNo || null
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReceipt(data.receipt);
        setAmount("");
        setReferenceNo("");
      } else {
        alert(data.error || "Failed to process payment");
      }
    } catch (err) {
      console.error(err);
      alert("Internal Server Error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", padding: "10px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "#ffffff", padding: "24px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
          💳 Regular Fee Collection Desk
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>
              SELECT STUDENT *
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.admission_no} - {s.name} ({s.class_name || "N/A"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>
              AMOUNT TO COLLECT (₹) *
            </label>
            <input
              type="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>
              PAYMENT MODE
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI / Online</option>
              <option value="Bank">Bank Transfer</option>
            </select>
          </div>

          {(paymentMode === "UPI" || paymentMode === "Bank") && (
            <div style={{ background: "#f8f9fa", padding: "12px", borderRadius: "6px", border: "1px dashed #007bff" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#0056b3" }}>
                TRANSACTION REF / UTR NUMBER *
              </label>
              <input
                type="text"
                placeholder="Enter UPI Ref No / UTR No"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              background: "#0284c7",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Processing..." : "Issue Receipt & Save"}
          </button>
        </form>
      </div>

      {receipt && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "10px",
            width: "420px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
          }}>
            <div id="receipt-area" style={{ border: "2px dashed #333", padding: "18px", borderRadius: "8px" }}>
              <div style={{ textAlign: "center", borderBottom: "1px solid #ccc", paddingBottom: "10px", marginBottom: "12px" }}>
                <h2 style={{ margin: "0", fontSize: "18px", textTransform: "uppercase" }}>COLLEGE FEE RECEIPT</h2>
                <small style={{ color: "#666" }}>Fee Management Software</small>
              </div>

              <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
                <div><strong>Receipt No:</strong> {receipt.receipt_no}</div>
                <div><strong>Date:</strong> {receipt.date}</div>
                <div><strong>Student Name:</strong> {receipt.student_name}</div>
                <div><strong>Admission No:</strong> {receipt.admission_no}</div>
                <div><strong>Payment Mode:</strong> {receipt.payment_mode}</div>
                {receipt.reference_no !== "N/A" && (
                  <div><strong>Ref / UTR No:</strong> {receipt.reference_no}</div>
                )}
                <div style={{ marginTop: "10px", fontSize: "16px", borderTop: "1px solid #eee", paddingTop: "8px" }}>
                  <strong>Paid Amount:</strong> ₹{Number(receipt.amount).toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#555" }}>
                <span>Paid Stamp: VERIFIED</span>
                <span>Authorized Signatory</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button
                onClick={handlePrint}
                style={{ padding: "8px 16px", background: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
              >
                Print Receipt
              </button>
              <button
                onClick={() => setReceipt(null)}
                style={{ padding: "8px 16px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}