import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import DailyRegister from "./DailyRegister.jsx";
import ScholarshipConcession from "./ScholarshipConcession.jsx";
import RefundCancellation from "./RefundCancellation.jsx";
import ManagementDashboard from "./ManagementDashboard.jsx";

const API = "http://localhost:4000/api";

const menu = [
  ["MAIN", [["◉", "Dashboard"]]],
  ["STUDENTS", [["▣", "Admission Enquiry"], ["♟", "All Students"], ["＋", "New Admission"], ["▤", "Passed Out Archive"], ["🎓", "Promotion"]]],
["FEES", [["📑", "Fee Structure"], ["💵", "Fee Collection"], ["📖", "Daily Register"], ["🎓", "Scholarships"], ["💸", "Refunds"], ["📊", "Management Dashboard"]]],  ["ACADEMICS", [["◫", "Attendance"], ["⌁", "Attendance Report"], ["▣", "Exams"], ["▥", "Subjects"]]],
  ["FINANCE", [["▤", "Expenses"], ["▤", "Reports"], ["⚖", "Income vs Expense"]]],
  ["STAFF / PAYROLL", [["♟", "Staff Management"], ["▣", "Salary Management"], ["▥", "Salary Report"]]],
  ["COMMUNICATION", [["♟", "Notices"]]],
  ["ADMIN", [["☷", "Admin Settings"], ["⚙", "Settings"]]],
  ["ACCOUNT", [["🔑", "Password Change"], ["↪", "Logout"]]]
];
function App() {
  const [newStudent, setNewStudent] = useState({
  name: '',
  class: '',
  phone: '',
  agreedFee: '',
  paidFee: ''
});
  const [receipt, setReceipt] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [message, setMessage] = useState("");

  const [duesList, setDuesList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [structures, setStructures] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [finOverview, setFinOverview] = useState({ totalIncome: 0, totalOutflow: 0, netBalance: 0, salaries: 0, expenses: 0 });

  // EDIT STATE HOLDERS
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingFee, setEditingFee] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingSalary, setEditingSalary] = useState(null);
  const [feeForm, setFeeForm] = useState({ class_id: "", fee_type: "", amount: "", academic_year: "2027-28", frequency: "Per Semester" });
  const [attDate, setAttDate] = useState(new Date().toISOString().split("T")[0]);
  const [attBranch, setAttBranch] = useState("");
  const [attList, setAttList] = useState([]);
  const [certFiles, setCertFiles] = useState({
    tc: null,
    study_cert: null,
    tenth_memo: null,
    inter_memo: null,
    caste_cert: null,
    income_cert: null,
    other_cert: null
  });
  const [enquiries, setEnquiries] = useState([]);
  const [enquiryForm, setEnquiryForm] = useState({
    student_name: "",
    phone: "",
    email: "",
    class_id: "",
    previous_qualification: "Intermediate (MPC)",
    previous_marks: "",
    entrance_exam_rank: "",
    notes: ""
  });
  const [examBranch, setExamBranch] = useState("");
  const [examName, setExamName] = useState("Sem-1 Mid");
  const [examSubject, setExamSubject] = useState("");
  const [marksList, setMarksList] = useState([]);
  const [promoteFrom, setPromoteFrom] = useState("");
  const [promoteTo, setPromoteTo] = useState("");
  const [feeHistory, setFeeHistory] = useState([]);
  const [studentForm, setStudentForm] = useState({
    admission_no: "",
    name: "",
    gender: "Male",
    dob: "",
    class_id: "",
    parent_name: "",
    phone: "",
    address: ""
  });
const [fees, setFees] = useState([]);
const sendWhatsAppReminder = (phone, name, dueAmount) => {
  const message = `Dear Parent, reminder: fee pending for ${name} is Rs. ${dueAmount}. Please pay at the earliest.`;
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
const agreed = Number(newStudent.agreedFee || 0);
const paid = Number(newStudent.paidAmount || 0);
const balance = agreed - paid;

const updatedStudent = {
  ...newStudent,
  id: Date.now(),
  agreedFee: agreed,
  paidAmount: paid,
  pendingDue: balance 
};

const [activeTab, setActiveTab] = useState('dailyRegister');
// setStudents([...students, updatedStudent]);
// Forms
  const [form, setForm] = useState({ class_id: "", fee_type: "", amount: "", academic_year: "2027-28", frequency: "Monthly" });
  const [assignClass, setAssignClass] = useState("");
  const [assignYear, setAssignYear] = useState("2027-28");

  const [feeCollect, setFeeCollect] = useState({ student_id: "", amount: "", payment_mode: "Cash" });
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  const [salaryForm, setSalaryForm] = useState({
    emp_id: "", emp_name: "", designation: "", department: "", basic_salary: "",
    allowances: 0, deductions: 0, advance_amount: 0, payment_date: new Date().toISOString().split("T")[0], month_year: "October 2026"
  });

  const [expenseForm, setExpenseForm] = useState({
    category: "Office Supplies", vendor_name: "", invoice_no: "", taxable_amount: "", cgst: 0, sgst: 0, igst: 0,
    expense_date: new Date().toISOString().split("T")[0]
  });
  const [invoiceFile, setInvoiceFile] = useState(null);

  const [subjects, setSubjects] = useState([
    { id: 1, name: "", code: "", teacher: "" },
    { id: 2, name: "", code: "", teacher: "" },
    { id: 3, name: "", code: "", teacher: "" }
  ]);
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", teacher: "" });

  const [exams, setExams] = useState([
    { id: 1, name: "Unit Test 1", start_date: "2026-11-10", class_name: "10th Class" },
    { id: 2, name: "Half Yearly Exams", start_date: "2026-12-15", class_name: "All Classes" }
  ]);
  const [examForm, setExamForm] = useState({ name: "", start_date: "", class_name: "All Classes" });

  const [staffList, setStaffList] = useState([
    { id: 1, emp_id: "", name: "", designation: "", department: "", phone: "" },
    { id: 2, emp_id: "", name: "", designation: "", department: "", phone: "" },
    { id: 3, emp_id: "", name: " ", designation: "", department: "", phone: "" }
  ]);
  const [staffForm, setStaffForm] = useState({ emp_id: "", name: "", designation: "", department: "", phone: "" });
  const [editingStaff, setEditingStaff] = useState(null);

  const [instituteSettings, setInstituteSettings] = useState({
    collegeName: "Adarsh College / High School",
    phone: "9182815182",
    email: "collegeerp@123.gmail.com",
    academicYear: "2027-28"
  });

const handleDeletePayment = (id) => {
  if (window.confirm("Ee payment record ni delete cheyala?")) {
    setPayments(payments.filter(p => p.id !== id));
  }
};

const handleEditPayment = (p) => {
  const newAmount = prompt("Enter new amount:", p.amount);
  if (newAmount !== null && newAmount !== "") {
    setPayments(payments.map(item => item.id === p.id ? { ...item, amount: Number(newAmount) } : item));
  }
};

  const [newNotice, setNewNotice] = useState({ title: "", body: "" });

  async function loadData() {
    try {
      const [c, f, s, p, sal, exp, n, fin] = await Promise.all([
        fetch(`${API}/classes`).then(r => r.json()),
        fetch(`${API}/fee-structures?academic_year=${encodeURIComponent(form.academic_year)}`).then(r => r.json()),
        fetch(`${API}/students`).then(r => r.json()),
        fetch(`${API}/fees/payments`).then(r => r.json()).catch(() => []),
        fetch(`${API}/salaries`).then(r => r.json()).catch(() => []),
        fetch(`${API}/expenses`).then(r => r.json()).catch(() => []),
        fetch(`${API}/notices`).then(r => r.json()).catch(() => []),
        fetch(`${API}/financials/overview`).then(r => r.json()).catch(() => ({}))
      ]);
      setClasses(Array.isArray(c) ? c : []);
      setStructures(Array.isArray(f) ? f : []);
      setStudents(Array.isArray(s) ? s : []);
      setPayments(Array.isArray(p) ? p : []);
      setSalaries(Array.isArray(sal) ? sal : []);
      setExpenses(Array.isArray(exp) ? exp : []);
      setNotices(Array.isArray(n) ? n : []);
      if (fin.totalIncome !== undefined) setFinOverview(fin);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchMarksSheet() {
    if (!examBranch) return alert("Select a Branch first");
    try {
      const res = await fetch(`${API}/exam-marks?class_id=${examBranch}&exam_name=${examName}`);
      const data = await res.json();
      setMarksList(Array.isArray(data) ? data.map(d => ({ ...d, marks_obtained: d.marks_obtained ?? "" })) : []);
    } catch (e) {
      alert("Error loading marks");
    }
  }

  function handleMarkInput(student_id, val) {
    setMarksList(prev => prev.map(item => item.student_id === student_id ? { ...item, marks_obtained: val } : item));
  }

  async function handleSaveMarks() {
    if (!examSubject) return alert("Please enter Subject Name");
    try {
      const res = await fetch(`${API}/exam-marks/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_name: examName, subject: examSubject, max_marks: 100, records: marksList })
      });
      if (res.ok) alert("Marks saved successfully!");
      else alert("Failed to save marks");
    } catch (e) {
      alert("Error saving marks");
    }
  }

  async function handlePromoteBatch() {
    if (!promoteFrom || !promoteTo) return alert("Select both Current and Target classes");
    if (promoteFrom === promoteTo) return alert("Source and Target cannot be the same");
    if (!confirm("Are you sure you want to promote all active students?")) return;

    try {
      const res = await fetch(`${API}/students/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_class_id: promoteFrom, target_class_id: promoteTo })
      });
      if (res.ok) {
        alert("Batch promoted successfully!");
        loadData();
      } else {
        alert("Promotion failed");
      }
    } catch (e) {
      alert("Error promoting batch");
    }
  }

async function fetchEnquiries() {
    try {
      const res = await fetch(`${API}/enquiries`);
      const data = await res.json();
      setEnquiries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreateEnquiry(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiryForm)
      });
      if (res.ok) {
        alert("Enquiry added successfully!");
        setEnquiryForm({
          student_name: "", phone: "", email: "", class_id: "",
          previous_qualification: "Intermediate (MPC)", previous_marks: "",
          entrance_exam_rank: "", notes: ""
        });
        fetchEnquiries();
      } else {
        alert("Failed to submit enquiry");
      }
    } catch (err) {
      alert("Error adding enquiry");
    }
  }

  async function updateEnquiryStatus(id, newStatus) {
    try {
      const res = await fetch(`${API}/enquiries/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchEnquiries();
    } catch (err) {
      alert("Error updating status");
    }
  }


  async function fetchAttendance() {
    if (!attBranch) return alert("Please select a Course / Branch");
    try {
      const res = await fetch(`${API}/attendance?class_id=${attBranch}&date=${attDate}`);
      const data = await res.json();
      setAttList(Array.isArray(data) ? data : []);
    } catch (e) {
      alert("Error loading attendance");
    }
  }

  function handleAttStatusChange(student_id, newStatus) {
    setAttList(prev => prev.map(s => s.student_id === student_id ? { ...s, status: newStatus } : s));
  }

  async function uploadDocuments(studentId) {
    const formData = new FormData();
    let hasFiles = false;

    Object.keys(certFiles).forEach(key => {
      if (certFiles[key]) {
        formData.append(key, certFiles[key]);
        hasFiles = true;
      }
    });

    if (!hasFiles) return true;

    try {
      const res = await fetch(`${API}/students/${studentId}/documents`, {
        method: "POST",
        body: formData
      });
      return res.ok;
    } catch (e) {
      console.error("Document upload failed", e);
      return false;
    }
  }

  async function handleSaveAttendance() {
    try {
      const res = await fetch(`${API}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: attDate, records: attList })
      });
      if (res.ok) alert("✅ Attendance saved successfully!");
      else alert("Failed to save attendance");
    } catch (e) {
      alert("Error saving attendance");
    }
  }

async function handleCreateFeeStructure(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/fee-structures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feeForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Fee Structure added successfully!");
        setFeeForm({ class_id: "", fee_type: "", amount: "", academic_year: "2026-27", frequency: "Per Semester" });
        loadData();
      } else {
        alert(data.error || "Failed to add fee structure");
      }
    } catch (err) {
      alert("Error adding fee structure");
    }
  }

async function handleAssignFees(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/fee-assignments/assign-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Fees assigned successfully to ${data.students || 0} students!`);
      } else {
        alert(data.error || "Failed to assign fees");
      }
    } catch (err) {
      alert("Error assigning fees");
    }
  }

  const fetchDues = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/fees/dues");
      const data = await res.json();
      setDuesList(data);
    } catch (err) {
      console.error("Error fetching dues:", err);
    }
  };

  useEffect(() => {
    fetchDues();
    if (currentUser) loadData();
  }, [currentUser, form.academic_year]);

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        setActiveMenu("Dashboard");
      } else {
        setMessage(data.error || "Login Failed");
      }
    } catch {
      setMessage("Server connection failed");
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    setLoginForm({ username: "", password: "" });
    setActiveMenu("Dashboard");
  }

  // --- STUDENT ACTIONS ---
  async function addStudent(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Student admitted successfully!");
        setStudentForm({});
        loadData();
      } else {
        setMessage(data.error || "Failed to admit student");
      }
    } catch (err) {
      setMessage("Admission error occurred");
    }
  }

  async function handleDeleteStudent(id) {
    if (!window.confirm("Are you sure you want to delete this student record?")) return;
    try {
      const res = await fetch(`${API}/students/${id}`, { method: "DELETE" });
      if (res.ok) { setMessage("Student deleted!"); loadData(); }
    } catch { setMessage("Error deleting student"); }
  }

  async function handleUpdateStudent(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/students/${editingStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStudent)
      });
      if (res.ok) {
        setMessage("Student updated!");
        setEditingStudent(null);
        loadData();
      }
    } catch { setMessage("Error updating student"); }
  }

  // --- FEE STRUCTURE ACTIONS ---
  async function addFee(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/fee-structures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) })
      });
      if (res.ok) {
        setMessage("Fee structure saved!");
        setForm(prev => ({ ...prev, fee_type: "", amount: "" }));
        loadData();
      }
    } catch { setMessage("Error saving fee structure"); }
  }

  async function handleDeleteFee(id) {
    if (!window.confirm("Delete this fee structure rule?")) return;
    try {
      const res = await fetch(`${API}/fee-structures/${id}`, { method: "DELETE" });
      if (res.ok) { setMessage("Fee rule deleted!"); loadData(); }
    } catch { setMessage("Error deleting fee rule"); }
  }

  async function handleUpdateFee(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/fee-structures/${editingFee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingFee,
          amount: Number(editingFee.amount)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Fee rule updated successfully!");
        setEditingFee(null);
        loadData();
      } else {
        setMessage(data.error || "Update failed");
      }
    } catch {
      setMessage("Error updating fee rule");
    }
  }
  async function assignAll() {
    if (!assignClass) return setMessage("Select a class.");
    try {
      const res = await fetch(`${API}/fee-assignments/assign-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_id: Number(assignClass), academic_year: assignYear })
      });
      const data = await res.json();
      setMessage(`Assigned ${data.created} records.`);
    } catch { setMessage("Error assigning fees"); }
  }

  // --- EXPENSE ACTIONS ---
  async function handleAddExpense(e) {
    e.preventDefault();
    const data = new FormData();
    Object.keys(expenseForm).forEach(k => data.append(k, expenseForm[k]));
    if (invoiceFile) data.append("invoice_file", invoiceFile);
    try {
      const res = await fetch(`${API}/expenses`, { method: "POST", body: data });
      if (res.ok) {
        setMessage("Expense & GST recorded!");
        setExpenseForm({ category: "Office Supplies", vendor_name: "", invoice_no: "", taxable_amount: "", cgst: 0, sgst: 0, igst: 0, expense_date: new Date().toISOString().split("T")[0] });
        setInvoiceFile(null);
        loadData();
      }
    } catch { setMessage("Expense recording error"); }
  }

  async function handleDeleteExpense(id) {
    if (!window.confirm("Delete this expense bill?")) return;
    try {
      const res = await fetch(`${API}/expenses/${id}`, { method: "DELETE" });
      if (res.ok) { setMessage("Expense deleted!"); loadData(); }
    } catch { setMessage("Error deleting expense"); }
  }

  async function handleUpdateExpense(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/expenses/${editingExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingExpense)
      });
      if (res.ok) {
        setMessage("Expense updated!");
        setEditingExpense(null);
        loadData();
      }
    } catch { setMessage("Error updating expense"); }
  }

  // --- SALARY ACTIONS ---
  async function handleAddSalary(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/salaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salaryForm)
      });
      if (res.ok) {
        setMessage("Salary recorded!");
        setSalaryForm({ emp_id: "", emp_name: "", designation: "", department: "", basic_salary: "", allowances: 0, deductions: 0, advance_amount: 0, payment_date: new Date().toISOString().split("T")[0], month_year: "October 2026" });
        loadData();
      }
    } catch { setMessage("Salary recording error"); }
  }

  async function handleDeleteSalary(id) {
    if (!window.confirm("Delete this salary voucher?")) return;
    try {
      const res = await fetch(`${API}/salaries/${id}`, { method: "DELETE" });
      if (res.ok) { setMessage("Salary voucher deleted!"); loadData(); }
    } catch { setMessage("Error deleting salary"); }
  }

  async function handleUpdateSalary(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/salaries/${editingSalary.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSalary)
      });
      if (res.ok) {
        setMessage("Salary record updated!");
        setEditingSalary(null);
        loadData();
      }
    } catch { setMessage("Error updating salary"); }
  }

  // --- NOTICES ACTIONS ---
  async function handleAddNotice(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotice)
      });
      if (res.ok) {
        setMessage("Notice published!");
        setNewNotice({ title: "", body: "" });
        loadData();
      }
    } catch { setMessage("Notice error"); }
  }

  async function handleDeleteNotice(id) {
    if (!window.confirm("Remove this notice?")) return;
    try {
      const res = await fetch(`${API}/notices/${id}`, { method: "DELETE" });
      if (res.ok) { setMessage("Notice removed!"); loadData(); }
    } catch { setMessage("Error deleting notice"); }
  }

  async function handleCollectFee(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/fees/collect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feeCollect)
      });
      const data = await res.json();
     if (res.ok) {
      setMessage(`Receipt Generated: ${data.receipt_no || data.id || 'TXN'}`);
      
      const studentObj = students?.find(s => String(s.id) === String(feeCollect.student_id));
      const newTxn = {
        date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        receipt: data.receipt_no || data.receipt || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
        student: studentObj ? (studentObj.name || studentObj.student_name) : `Student #${feeCollect.student_id}`,
        cash: (feeCollect.payment_mode === "Cash") ? Number(feeCollect.amount) : 0,
        upi: (feeCollect.payment_mode === "UPI" || feeCollect.payment_mode === "Online" || feeCollect.payment_mode?.includes("UPI")) ? Number(feeCollect.amount) : 0,
        total: Number(feeCollect.amount)
      };
      setFeeHistory(prev => [newTxn, ...prev]);

      setFeeCollect({ student_id: "", amount: "", payment_mode: "Cash" });
      loadData();
    }
    } catch { setMessage("Payment error"); }
  }

  async function handleSaveAttendance() {
    const records = students.map(s => ({
      student_id: s.id,
      status: attendanceRecords[s.id] || "Present"
    }));
    try {
      const res = await fetch(`${API}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: attendanceDate, records })
      });
      if (res.ok) setMessage("Attendance recorded for " + attendanceDate);
    } catch { setMessage("Error saving attendance"); }
  }

  if (!currentUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0f172a" }}>
        <form onSubmit={handleLogin} style={{ background: "#ffffff", padding: "40px", borderRadius: "12px", width: "360px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <span style={{ fontSize: "40px" }}>🏫</span>
            <h2 style={{ margin: "10px 0 5px", color: "#1e293b" }}>College ERP Login</h2>
            <small style={{ color: "#64748b" }}>Admin / Staff Portal</small>
          </div>
          <label style={{ fontSize: "12px", fontWeight: "bold", color: "#475569" }}>USERNAME</label>
          <input style={{ width: "100%", padding: "10px", margin: "6px 0 15px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} placeholder="admin / staff" required />
          <label style={{ fontSize: "12px", fontWeight: "bold", color: "#475569" }}>PASSWORD</label>
          <input type="password" style={{ width: "100%", padding: "10px", margin: "6px 0 20px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="••••••••" required />
          <button type="submit" className="primary" style={{ width: "100%", padding: "12px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}>Sign In</button>
          {message && <div style={{ color: "#ef4444", fontSize: "13px", marginTop: "15px", textAlign: "center", fontWeight: "bold" }}>{message}</div>}
        </form>
      </div>
    );
  }

  const filteredMenu = menu.filter(([section]) => {
    if (currentUser.role === "Staff") return !["FINANCE", "STAFF / PAYROLL", "ADMIN"].includes(section);
    return true;
  });

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">🏫</div>
          <div><b>School ERP</b><small>Management System</small></div>
        </div>
        <div className="admin-badge">
          <span>{currentUser.role[0]}</span>
          <div><b>{currentUser.username}</b><small>★ {currentUser.role}</small></div>
        </div>
        {filteredMenu.map(([section, items]) => (
          <div className="menu-section" key={section}>
            <div className="section-title">{section}</div>
            {items.map(([icon, label]) => (
              <div className={`menu-item ${label === activeMenu ? "active" : ""}`} key={label} onClick={() => label === "Logout" ? handleLogout() : setActiveMenu(label)} style={{ cursor: "pointer" }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
        ))}
        <div className="sidebar-footer">☎ {instituteSettings.phone} &nbsp; | &nbsp; Support</div>
      </aside>

      <main className="content">
        <header className="topbar">
          <h1>{activeMenu}</h1>
          <div className="year">▣ {instituteSettings.academicYear} &nbsp; ({currentUser.role})</div>
          <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "4px 10px", borderRadius: "4px", cursor: "pointer" }}>Logout</button>
        </header>

        {message && <div className="toast">{message}</div>}

        {/* 1. DASHBOARD */}
        {activeMenu === "Dashboard" && (
  <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "10px" }}>
    <h2>📊 College Overview Dashboard</h2>
    <p style={{ color: "#64748b", marginBottom: "25px" }}>Welcome to the college administration and tracking portal.</p>

    {/* 4 SUMMARY STAT CARDS */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "30px" }}>
      <div className="card" style={{ padding: "18px", borderLeft: "5px solid #2563eb", background: "#ffffff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>👥 ENROLLED STUDENTS</span>
        <h2 style={{ fontSize: "28px", margin: "8px 0 4px 0", color: "#1e293b" }}>{students.length}</h2>
        <small style={{ color: "#94a3b8" }}>Active candidates across branches</small>
      </div>

      <div className="card" style={{ padding: "18px", borderLeft: "5px solid #10b981", background: "#ffffff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>🏛 COURSES / BRANCHES</span>
        <h2 style={{ fontSize: "28px", margin: "8px 0 4px 0", color: "#1e293b" }}>{classes.length}</h2>
        <small style={{ color: "#94a3b8" }}>Configured departments</small>
      </div>

      <div className="card" style={{ padding: "18px", borderLeft: "5px solid #f59e0b", background: "#ffffff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>💰 TOTAL FEE COLLECTED</span>
        <h2 style={{ fontSize: "28px", margin: "8px 0 4px 0", color: "#1e293b" }}>
          ₹{(fees || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0).toLocaleString()}
        </h2>
        <small style={{ color: "#94a3b8" }}>Real-time total income</small>
      </div>

      <div className="card" style={{ padding: "18px", borderLeft: "5px solid #8b5cf6", background: "#ffffff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <span style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>🎓 NEW ENQUIRIES</span>
        <h2 style={{ fontSize: "28px", margin: "8px 0 4px 0", color: "#1e293b" }}>{enquiries.length}</h2>
        <small style={{ color: "#94a3b8" }}>Prospective leads registered</small>
      </div>
    </div>

    {/* QUICK SHORTCUT ACTIONS */}
    <div className="card" style={{ padding: "20px", background: "#ffffff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
      <h3 style={{ margin: "0 0 16px 0", color: "#334155" }}>⚡ Quick Operations</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
        <button 
          onClick={() => setActiveMenu("Students")} 
          style={{ padding: "14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", textAlign: "center" }}
        >
          ➕ New Admission
        </button>
        <button 
          onClick={() => setActiveMenu("Fees")} 
          style={{ padding: "14px", background: "#059669", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", textAlign: "center" }}
        >
          💳 Collect Fees
        </button>
        <button
  onClick={() => setActiveMenu("dailyRegister")}
  style={{ padding: "14px", background: activeMenu === "dailyRegister" ? "#2563eb" : "#475569", color: "#fff" }}
>
  📖 Daily Cash / UPI Register
</button>
        <button 
          onClick={() => setActiveMenu("Attendance")} 
          style={{ padding: "14px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", textAlign: "center" }}
        >
          📋 Mark Attendance
        </button>
        <button 
          onClick={() => setActiveMenu("Exams")} 
          style={{ padding: "14px", background: "#d97706", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", textAlign: "center" }}
        >
          📝 Exams & Marks
        </button>
        <button 
          onClick={() => setActiveMenu("Admission Enquiry")} 
          style={{ padding: "14px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", textAlign: "center" }}
        >
          📞 Candidate Leads
        </button>
      </div>
    </div>
  </div>
)}

        {/* 2. ADMISSION ENQUIRY WITH EDIT/DELETE */}
        {activeMenu === "Admission Enquiry" && (
          <div className="grid2">
            <section className="card">
              <h2>📝 New Admission Enquiry</h2>
              <form onSubmit={e => {
                e.preventDefault();
                setEnquiries([...enquiries, { id: Date.now(), ...enquiryForm, status: "Follow-up" }]);
                setEnquiryForm({ name: "", phone: "", class_name: "" });
                setMessage("Enquiry added!");
              }} style={{ marginTop: "15px" }}>
                <label>STUDENT / PARENT NAME *</label>
                <input value={enquiryForm.name} onChange={e => setEnquiryForm({ ...enquiryForm, name: e.target.value })} placeholder="Enter Name" required />
                <label>CONTACT PHONE *</label>
                <input value={enquiryForm.phone} onChange={e => setEnquiryForm({ ...enquiryForm, phone: e.target.value })} placeholder="e.g. 9876543210" required />
                <label>INTERESTED CLASS</label>
                <select value={enquiryForm.class_name} onChange={e => setEnquiryForm({ ...enquiryForm, class_name: e.target.value })}>
                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <button className="primary" type="submit" style={{ marginTop: "15px" }}>Save Enquiry</button>
              </form>
            </section>
            <section className="card">
              <div className="table-head"><h2>Enquiries List</h2></div>
              <table>
                <thead><tr><th>NAME</th><th>PHONE</th><th>CLASS</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {enquiries.map(enq => (
                    <tr key={enq.id}>
                      <td><b>{enq.name}</b></td>
                      <td>{enq.phone}</td>
                      <td>{enq.class_name}</td>
                      <td><span style={{ color: "#3b82f6", fontWeight: "bold" }}>{enq.status}</span></td>
                      <td>
                        <button onClick={() => {
                          const updated = prompt("Update Enquiry Status (Follow-up / Enrolled / Rejected):", enq.status);
                          if (updated) setEnquiries(enquiries.map(item => item.id === enq.id ? { ...item, status: updated } : item));
                        }} style={{ background: "#3b82f6", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", marginRight: "6px" }}>✏️</button>
                        <button onClick={() => setEnquiries(enquiries.filter(item => item.id !== enq.id))} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {/* 3. ALL STUDENTS WITH EDIT & DELETE */}
        {activeMenu === "All Students" && (
          <section className="card">
            <div className="table-head">
              <h2>👥 All Students List</h2>
              <button className="primary" onClick={() => setActiveMenu("New Admission")}>＋ Add Student</button>
            </div>

            {editingStudent && (
              <form onSubmit={handleUpdateStudent} style={{ marginTop: "15px", display: "grid", gap: "10px" }}>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
    <div>
      <label>ADMISSION NO *</label>
      <input 
        required 
        value={editingStudent.admission_no || ''} 
        onChange={e => setEditingStudent({ ...editingStudent, admission_no: e.target.value })} 
      />
    </div>
    <div>
      <label>FULL NAME *</label>
      <input 
        required 
        value={editingStudent.name || ''} 
        onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })} 
      />
    </div>
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
    <div>
      <label>COURSE / BRANCH *</label>
      <select 
        required 
        value={editingStudent.class_id || ''} 
        onChange={e => setEditingStudent({ ...editingStudent, class_id: e.target.value })}
      >
        <option value="">Select Course</option>
        {classes.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
      </select>
    </div>
    <div>
      <label>GENDER</label>
      <select 
        value={editingStudent.gender || 'Male'} 
        onChange={e => setEditingStudent({ ...editingStudent, gender: e.target.value })}
      >
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </div>
    <div>
      <label>CASTE</label>
      <select 
        value={editingStudent.caste || 'OC'} 
        onChange={e => setEditingStudent({ ...editingStudent, caste: e.target.value })}
      >
        <option value="OC">OC</option>
        <option value="BC-A">BC-A</option>
        <option value="BC-B">BC-B</option>
        <option value="BC-C">BC-C</option>
        <option value="BC-D">BC-D</option>
        <option value="BC-E">BC-E</option>
        <option value="SC">SC</option>
        <option value="ST">ST</option>
        <option value="EWS">EWS</option>
      </select>
    </div>
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
    <div>
      <label>STUDENT MOBILE</label>
      <input 
        value={editingStudent.student_phone || ''} 
        onChange={e => setEditingStudent({ ...editingStudent, student_phone: e.target.value })} 
      />
    </div>
    <div>
      <label>PARENT MOBILE</label>
      <input 
        value={editingStudent.phone || ''} 
        onChange={e => setEditingStudent({ ...editingStudent, phone: e.target.value })} 
      />
    </div>
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
    <div>
      <label>FATHER'S NAME</label>
      <input 
        value={editingStudent.father_name || ''} 
        onChange={e => setEditingStudent({ ...editingStudent, father_name: e.target.value })} 
      />
    </div>
    <div>
      <label>MOTHER'S NAME</label>
      <input 
        value={editingStudent.mother_name || ''} 
        onChange={e => setEditingStudent({ ...editingStudent, mother_name: e.target.value })} 
      />
    </div>
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
    <div>
      <label>10TH MARKS</label>
      <input 
        value={editingStudent.tenth_marks || ''} 
        onChange={e => setEditingStudent({ ...editingStudent, tenth_marks: e.target.value })} 
      />
    </div>
    <div>
      <label>INTER MARKS</label>
      <input 
        value={editingStudent.inter_marks || ''} 
        onChange={e => setEditingStudent({ ...editingStudent, inter_marks: e.target.value })} 
      />
    </div>
    <div>
      <label>EAMCET RANK</label>
      <input 
        value={editingStudent.eamcet_rank || ''} 
        onChange={e => setEditingStudent({ ...editingStudent, eamcet_rank: e.target.value })} 
      />
    </div>
  </div>

  <div>
    <label>ADDRESS</label>
    <input 
      value={editingStudent.address || ''} 
      onChange={e => setEditingStudent({ ...editingStudent, address: e.target.value })} 
    />
  </div>

  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
    <button className="primary" type="submit">Save Changes</button>
    <button type="button" className="secondary" onClick={() => setEditingStudent(null)}>Cancel</button>
  </div>
</form>
            )}

            <table>
              <thead>
                <tr><th>#</th><th>ADM NO</th><th>NAME</th><th>CLASS</th><th>STATUS</th><th>ACTIONS</th></tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td><b>{s.admission_no}</b></td>
                    <td>{s.name}</td>
                    <td>{s.class_name}</td>
                    <td><span style={{ color: "#10b981", fontWeight: "bold" }}>{s.status}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setEditingStudent(s)} style={{ background: "#3b82f6", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>✏️ Edit</button>
                        <button onClick={() => handleDeleteStudent(s.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

         {/* 4. NEW ADMISSION */}
{activeMenu === "New Admission" && (
  <section className="card" style={{ maxWidth: "750px", margin: "0 auto", padding: "20px" }}>
    <h2>🎓 College Student Admission</h2>
    <form onSubmit={addStudent} style={{ marginTop: "15px", display: "grid", gap: "12px" }}>
      
      {/* Basic Student Info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <label>ADMISSION NO *</label>
          <input 
            required
            placeholder="e.g. ADM2026/001"
            value={studentForm.admission_no || ''} 
            onChange={e => setStudentForm({ ...studentForm, admission_no: e.target.value })} 
          />
        </div>
        <div>
          <label>FULL NAME *</label>
          <input 
            required
            placeholder="Student Full Name"
            value={studentForm.name || ''} 
            onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} 
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        <div>
          <label>COURSE / BRANCH *</label>
          <select 
            required
            value={studentForm.class_id || ''} 
            onChange={e => setStudentForm({ ...studentForm, class_id: e.target.value })}
          >
            <option value="">-- Select Course --</option>
            {classes.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label>GENDER</label>
          <select 
            value={studentForm.gender || 'Male'} 
            onChange={e => setStudentForm({ ...studentForm, gender: e.target.value })}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label>CASTE / CATEGORY</label>
          <select 
            value={studentForm.caste || 'OC'} 
            onChange={e => setStudentForm({ ...studentForm, caste: e.target.value })}
          >
            <option value="OC">OC</option>
            <option value="BC-A">BC-A</option>
            <option value="BC-B">BC-B</option>
            <option value="BC-C">BC-C</option>
            <option value="BC-D">BC-D</option>
            <option value="BC-E">BC-E</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>
        </div>
      </div>

      {/* Parents & Contacts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <label>FATHER'S NAME</label>
          <input 
            placeholder="Father's Name"
            value={studentForm.father_name || ''} 
            onChange={e => setStudentForm({ ...studentForm, father_name: e.target.value })} 
          />
        </div>
        <div>
          <label>MOTHER'S NAME</label>
          <input 
            placeholder="Mother's Name"
            value={studentForm.mother_name || ''} 
            onChange={e => setStudentForm({ ...studentForm, mother_name: e.target.value })} 
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <label>STUDENT PHONE NUMBER *</label>
          <input 
            required
            placeholder="10-digit Student Mobile"
            value={studentForm.student_phone || ''} 
            onChange={e => setStudentForm({ ...studentForm, student_phone: e.target.value })} 
          />
        </div>
        <div>
          <label>PARENT PHONE NUMBER</label>
          <input 
            placeholder="Parent Contact No"
            value={studentForm.phone || ''} 
            onChange={e => setStudentForm({ ...studentForm, phone: e.target.value })} 
          />
        </div>
      </div>

      {/* Academic Marks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <label>10TH TOTAL MARKS / GPA</label>
          <input 
            placeholder="e.g. 550 / 600 or 9.5 GPA"
            value={studentForm.tenth_marks || ''} 
            onChange={e => setStudentForm({ ...studentForm, tenth_marks: e.target.value })} 
          />
        </div>
        <div>
          <label>INTER / DIPLOMA MARKS</label>
          <input 
            placeholder="e.g. 920 / 1000"
            value={studentForm.inter_marks || ''} 
            onChange={e => setStudentForm({ ...studentForm, inter_marks: e.target.value })} 
          />
        </div>
      </div>

      {/* EAMCET Details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <label>EAMCET QUALIFIED?</label>
          <select 
            value={studentForm.eamcet_qualified || 'Qualified'} 
            onChange={e => setStudentForm({ ...studentForm, eamcet_qualified: e.target.value })}
          >
            <option value="Qualified">Qualified</option>
            <option value="Not Qualified">Not Qualified</option>
            <option value="Not Appeared">Not Appeared</option>
          </select>
        </div>
        <div>
          <label>QUALIFY RANK</label>
          <input 
            placeholder="e.g. 24500 (Leave blank if N/A)"
            value={studentForm.eamcet_rank || ''} 
            onChange={e => setStudentForm({ ...studentForm, eamcet_rank: e.target.value })} 
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label>RESIDENTIAL ADDRESS</label>
        <input 
          placeholder="Door No, Street, Mandal, District"
          value={studentForm.address || ''} 
          onChange={e => setStudentForm({ ...studentForm, address: e.target.value })} 
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
  <div>
    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>
      Agreed / Total Fee :
    </label>
    <input
      type="number"
      placeholder="ex. 45000"
      value={newStudent.agreedFee || ''}
      onChange={(e) => setNewStudent({ ...newStudent, agreedFee: e.target.value })}
      style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc' }}
      required
    />
  </div>

  <div>
    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>
      Admission Time Paid (total paid ₹):
    </label>
    <input
      type="number"
      placeholder="0 if nothing paid"
      value={newStudent.paidAmount || ''}
      onChange={(e) => setNewStudent({ ...newStudent, paidAmount: e.target.value })}
      style={{ width: '100%', padding: '9px', borderRadius: '5px', border: '1px solid #ccc' }}
    />
  </div>
</div>
      {/* CERTIFICATES UPLOAD SECTION */}
        <div style={{ marginTop: "16px", padding: "12px", border: "1px dashed #cbd5e1", borderRadius: "8px", background: "#f8fafc" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>📄 Upload Certificates (PDF / Images)</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Transfer Certificate (TC)</label>
              <input type="file" onChange={e => setCertFiles({ ...certFiles, tc: e.target.files[0] })} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Study / Conduct Certificate</label>
              <input type="file" onChange={e => setCertFiles({ ...certFiles, study_cert: e.target.files[0] })} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>10th Marks Memo</label>
              <input type="file" onChange={e => setCertFiles({ ...certFiles, tenth_memo: e.target.files[0] })} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Inter / Diploma Memo</label>
              <input type="file" onChange={e => setCertFiles({ ...certFiles, inter_memo: e.target.files[0] })} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Caste Certificate</label>
              <input type="file" onChange={e => setCertFiles({ ...certFiles, caste_cert: e.target.files[0] })} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Income Certificate</label>
              <input type="file" onChange={e => setCertFiles({ ...certFiles, income_cert: e.target.files[0] })} />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Other Certificate (Aadhar/Special)</label>
              <input type="file" onChange={e => setCertFiles({ ...certFiles, other_cert: e.target.files[0] })} />
            </div>
          </div>
        </div>
      <button className="primary" type="submit" style={{ marginTop: "15px", height: "42px", fontWeight: "bold" }}>
        Save & Admit Student
      </button>
    </form>
  </section>
)}

        {/* 5. PASSED OUT ARCHIVE */}
        {activeMenu === "Passed Out Archive" && (
          <section className="card">
            <h2>🎓 Passed Out / Alumni Archive</h2>
            <p className="hint">Records of students who completed their final schooling.</p>
            <table style={{ marginTop: "15px" }}>
              <thead><tr><th>ADM NO</th><th>NAME</th><th>BATCH YEAR</th><th>FINAL RESULT</th><th>TRANSFER CERTIFICATE</th></tr></thead>
              <tbody>
                <tr><td> </td><td><b> </b></td><td> </td><td><span style={{ color: "#10b981", fontWeight: "bold" }}> (%)</span></td><td> </td></tr>
                <tr><td> </td><td><b> </b></td><td> </td><td><span style={{ color: "#10b981", fontWeight: "bold" }}> (%)</span></td><td> </td></tr>
              </tbody>
            </table>
          </section>
        )}

        {/* 6. PROMOTION */}
        {activeMenu === "Promotion" && (
          <section className="card" style={{ maxWidth: "700px" }}>
            <h2>🎓 Student Academic Promotion</h2>
            <p className="hint">Promote all students of a selected class to the next academic level.</p>
            <div style={{ marginTop: "20px" }}>
              <label>CURRENT CLASS</label>
              <select>{classes.map(c => <option key={c.id}>{c.name}</option>)}</select>
              <label>PROMOTE TO TARGET CLASS</label>
              <select>{classes.map(c => <option key={c.id}>{c.name}</option>)}</select>
              <button className="orange" onClick={() => setMessage("Selected students promoted to the next class successfully!")} style={{ marginTop: "15px" }}>
                Promote Batch
              </button>
            </div>
          </section>
        )}

{/* ASSIGN FEES TO COURSE / BRANCH */}
      {activeMenu === "Assign Fees" && (
        <section className="card" style={{ maxWidth: "650px", margin: "0 auto", padding: "20px" }}>
          <h2>📌 Assign Fees to Course / Branch</h2>
          <p style={{ color: "#666", marginBottom: "15px" }}>
            Assign configured fee structures to all active students in the selected branch/course.
          </p>

          <form onSubmit={handleAssignFees} style={{ display: "grid", gap: "12px" }}>
            <div>
              <label>SELECT COURSE / BRANCH *</label>
              <select 
                required 
                value={assignForm.class_id || ''} 
                onChange={e => setAssignForm({ ...assignForm, class_id: e.target.value })}
              >
                <option value="">-- Select Course / Branch --</option>
                {classes.map(c => (
                  <option value={c.id} key={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label>ACADEMIC YEAR *</label>
              <input 
                required
                placeholder="e.g. 2026-27"
                value={assignForm.academic_year || '2026-27'}
                onChange={e => setAssignForm({ ...assignForm, academic_year: e.target.value })}
              />
            </div>

            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", fontSize: "13px", color: "#475569" }}>
              💡 <strong>Note:</strong> 
            </div>

            <button className="primary" type="submit" style={{ marginTop: "10px", height: "42px", fontWeight: "bold" }}>
              Assign Fees to Entire Branch
            </button>
          </form>
        </section>
      )}

        {/* FEE STRUCTURE MANAGEMENT */}
{activeMenu === "Fee Structure" && (
  <section className="card" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
    <h2>💳 College Fee Structure Management</h2>
    <p style={{ color: "#666", marginBottom: "15px" }}>
      Configure semester/annual fees branch-wise (BTech, Pharmacy, MBA, etc.)
    </p>

    <form onSubmit={handleCreateFeeStructure} style={{ display: "grid", gap: "12px", marginBottom: "25px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div>
          <label>COURSE / BRANCH *</label>
          <select 
            required 
            value={feeForm.class_id || ''} 
            onChange={e => setFeeForm({ ...feeForm, class_id: e.target.value })}
          >
            <option value="">-- Select Course / Branch --</option>
            {classes.map(c => (
              <option value={c.id} key={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>FEE HEAD / TYPE *</label>
          <input 
            required
            placeholder="e.g. Tuition Fee, Lab Fee, Library"
            value={feeForm.fee_type || ''}
            onChange={e => setFeeForm({ ...feeForm, fee_type: e.target.value })}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        <div>
          <label>AMOUNT (₹) *</label>
          <input 
            type="number"
            required
            placeholder="e.g. 45000"
            value={feeForm.amount || ''}
            onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })}
          />
        </div>

        <div>
          <label>ACADEMIC YEAR</label>
          <input 
            placeholder="e.g. 2026-27"
            value={feeForm.academic_year || '2026-27'}
            onChange={e => setFeeForm({ ...feeForm, academic_year: e.target.value })}
          />
        </div>

        <div>
          <label>FREQUENCY</label>
          <select 
            value={feeForm.frequency || 'Per Semester'}
            onChange={e => setFeeForm({ ...feeForm, frequency: e.target.value })}
          >
            <option value="Per Semester">Per Semester</option>
            <option value="Per Year">Per Year</option>
            <option value="One Time">One Time / Admission</option>
          </select>
        </div>
      </div>

      <button className="primary" type="submit" style={{ marginTop: "10px", height: "40px", fontWeight: "bold" }}>
        + Add Branch Fee Head
      </button>
    </form>

    {/* Fee Structure Table */}
    <h3>Existing Course Fee Structures</h3>
    <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
          <th style={{ padding: "8px" }}>Course / Branch</th>
          <th style={{ padding: "8px" }}>Fee Type</th>
          <th style={{ padding: "8px" }}>Amount (₹)</th>
          <th style={{ padding: "8px" }}>Frequency</th>
          <th style={{ padding: "8px" }}>Year</th>
        </tr>
      </thead>
      <tbody>
        {structures && structures.length > 0 ? (
          structures.map(f => (
            <tr key={f.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={{ padding: "8px", fontWeight: "600" }}>{f.class_name}</td>
              <td style={{ padding: "8px" }}>{f.fee_type}</td>
              <td style={{ padding: "8px" }}>₹{Number(f.amount).toLocaleString('en-IN')}</td>
              <td style={{ padding: "8px" }}>{f.frequency}</td>
              <td style={{ padding: "8px" }}>{f.academic_year}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" style={{ textAlign: "center", padding: "12px", color: "#888" }}>
              No fee structures configured yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </section>
)}

        {/* 8. WHATSAPP REMINDER */}
        {activeMenu === "WhatsApp Reminder" && (
          <section className="card">
            <h2>➤ WhatsApp Fee Reminders</h2>
            <p className="hint">Send direct WhatsApp payment reminder alerts to parents.</p>
            <table style={{ marginTop: "15px" }}>
              <thead><tr><th>STUDENT</th><th>CLASS</th><th>PENDING DUE</th><th>ACTION</th></tr></thead>
              <tbody>
  {students
                ?.filter((s) => Number(s.pendingDue || s.due || 0) > 0)
                .map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.class || student.grade}</td>
                    <td style={{ color: 'red', fontWeight: 'bold' }}>
                      ₹{student.pendingDue || student.due}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      )}

     {/* 1. DAILY REGISTER */}
{(activeMenu === "Daily Register" || activeMenu === "dailyRegister") && (
  <DailyRegister feeHistory={feeHistory} />
)}

{/* 2. SCHOLARSHIPS */}
{(activeMenu === "Scholarships" || activeMenu === "scholarship") && (
  <ScholarshipConcession students={students} />
)}

{/* 3. REFUNDS */}
{(activeMenu === "Refunds" || activeMenu === "refund") && (
  <RefundCancellation feeHistory={feeHistory} />
)}

{/* 4. MANAGEMENT DASHBOARD */}
{(activeMenu === "Management Dashboard" || activeMenu === "managementDashboard") && (
  <ManagementDashboard students={students} feeHistory={feeHistory} />
)}
        {/* 9. EXAMS WITH EDIT & DELETE */}
        {activeMenu === "Exams" && (
  <section className="card" style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
    <h2>📝 Semester Exams & Batch Promotions</h2>
    <p style={{ color: "#64748b", marginBottom: "20px" }}>Manage internal/external marks and promote student batches.</p>

    {/* PROMOTION CARD */}
    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "25px" }}>
      <h4 style={{ margin: "0 0 10px 0" }}>🚀 Semester / Year-End Promotion</h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "10px", alignItems: "end" }}>
        <div>
          <label style={{ fontSize: "12px" }}>FROM (CURRENT CLASS)</label>
          <select value={promoteFrom} onChange={e => setPromoteFrom(e.target.value)}>
            <option value="">-- Select Current --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: "12px" }}>TO (NEXT SEMESTER / YEAR)</label>
          <select value={promoteTo} onChange={e => setPromoteTo(e.target.value)}>
            <option value="">-- Select Next Class --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button className="primary" type="button" onClick={handlePromoteBatch} style={{ height: "40px", background: "#2563eb" }}>
          Promote Entire Batch
        </button>
      </div>
    </div>

    {/* MARKS ENTRY SECTION */}
    <h3>Enter Semester Exam Marks</h3>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "10px", alignItems: "end", marginBottom: "15px" }}>
      <div>
        <label>COURSE / BRANCH *</label>
        <select value={examBranch} onChange={e => setExamBranch(e.target.value)}>
          <option value="">-- Select Branch --</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label>EXAM TYPE</label>
        <select value={examName} onChange={e => setExamName(e.target.value)}>
          <option value="Sem-1 Mid">Sem-1 Mid</option>
          <option value="Sem-1 External">Sem-1 External</option>
          <option value="Sem-2 Mid">Sem-2 Mid</option>
          <option value="Sem-2 External">Sem-2 External</option>
        </select>
      </div>
      <div>
        <label>SUBJECT NAME *</label>
        <input placeholder="e.g. Data Structures" value={examSubject} onChange={e => setExamSubject(e.target.value)} />
      </div>
      <button className="primary" type="button" onClick={fetchMarksSheet} style={{ height: "40px" }}>
        Fetch Students
      </button>
    </div>

    {marksList.length > 0 && (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Roll / Adm No</th>
              <th style={{ padding: "8px" }}>Student Name</th>
              <th style={{ padding: "8px", width: "180px" }}>Marks (Max: 100)</th>
            </tr>
          </thead>
          <tbody>
            {marksList.map(item => (
              <tr key={item.student_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px", fontWeight: "bold" }}>{item.admission_no}</td>
                <td style={{ padding: "8px" }}>{item.name}</td>
                <td style={{ padding: "8px" }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Marks"
                    value={item.marks_obtained}
                    onChange={e => handleMarkInput(item.student_id, e.target.value)}
                    style={{ width: "120px", padding: "6px" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="primary" type="button" onClick={handleSaveMarks} style={{ width: "100%", height: "42px", fontWeight: "bold" }}>
          💾 Save Exam Marks
        </button>
      </div>
    )}
  </section>
)}

        {/* 10. SUBJECTS WITH EDIT & DELETE */}
        {activeMenu === "Subjects" && (
          <div className="grid2">
            <section className="card">
              <h2>➕ Add New Subject</h2>
              <form onSubmit={e => {
                e.preventDefault();
                setSubjects([...subjects, { id: Date.now(), ...subjectForm }]);
                setSubjectForm({ name: "", code: "", teacher: "" });
                setMessage("Subject added!");
              }} style={{ marginTop: "15px" }}>
                <label>SUBJECT NAME *</label>
                <input value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="e.g. Social Studies" required />
                <label>SUBJECT CODE *</label>
                <input value={subjectForm.code} onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })} placeholder="e.g. SOC101" required />
                <label>ASSIGNED FACULTY</label>
                <input value={subjectForm.teacher} onChange={e => setSubjectForm({ ...subjectForm, teacher: e.target.value })} placeholder="e.g. Ms. Sarita" />
                <button className="primary" type="submit" style={{ marginTop: "15px" }}>Save Subject</button>
              </form>
            </section>
            <section className="card">
              <div className="table-head"><h2>All Subjects List</h2></div>
              <table>
                <thead><tr><th>CODE</th><th>SUBJECT</th><th>TEACHER</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {subjects.map(sub => (
                    <tr key={sub.id}>
                      <td><b>{sub.code}</b></td>
                      <td>{sub.name}</td>
                      <td>{sub.teacher || "Unassigned"}</td>
                      <td>
                        <button onClick={() => {
                          const updated = prompt("Edit Faculty Name:", sub.teacher);
                          if (updated !== null) setSubjects(subjects.map(item => item.id === sub.id ? { ...item, teacher: updated } : item));
                        }} style={{ background: "#3b82f6", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", marginRight: "6px" }}>✏️</button>
                        <button onClick={() => setSubjects(subjects.filter(item => item.id !== sub.id))} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {/* 11. ADMIN SETTINGS */}
        {activeMenu === "Admin Settings" && (
          <section className="card" style={{ maxWidth: "600px" }}>
            <h2>🏫 College / School Profile Details</h2>
            <form onSubmit={e => { e.preventDefault(); setMessage("College profile updated successfully!"); }} style={{ marginTop: "15px" }}>
              <label>COLLEGE / INSTITUTE NAME *</label>
              <input value={instituteSettings.collegeName} onChange={e => setInstituteSettings({ ...instituteSettings, collegeName: e.target.value })} required />
              <label>CONTACT PHONE / WHATSAPP *</label>
              <input value={instituteSettings.phone} onChange={e => setInstituteSettings({ ...instituteSettings, phone: e.target.value })} required />
              <label>OFFICIAL EMAIL ADDRESS *</label>
              <input value={instituteSettings.email} onChange={e => setInstituteSettings({ ...instituteSettings, email: e.target.value })} required />
              <label>CAMPUS ADDRESS</label>
              <textarea rows="3" placeholder="College Campus Location..." style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} defaultValue="Main Road, Andhra Pradesh" />
              <button className="primary" type="submit" style={{ marginTop: "15px" }}>Save Profile Details</button>
            </form>
          </section>
        )}

        {/* 11.B GENERAL SETTINGS */}
        {activeMenu === "Settings" && (
          <section className="card" style={{ maxWidth: "600px" }}>
            <h2>⚙️ System & Academic Year Configuration</h2>
            <form onSubmit={e => { e.preventDefault(); setMessage("System configuration updated!"); }} style={{ marginTop: "15px" }}>
              <label>ACTIVE ACADEMIC SESSION</label>
              <select value={instituteSettings.academicYear} onChange={e => setInstituteSettings({ ...instituteSettings, academicYear: e.target.value })}>
                <option>2026-27</option><option>2027-28</option><option>2028-29</option>
              </select>
              <label>CURRENCY FORMAT</label>
              <input value="INR (₹) - Indian Rupee" readOnly style={{ background: "#f1f5f9" }} />
              <label>DATABASE STATUS</label>
              <div style={{ padding: "10px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "6px", color: "#065f46", fontSize: "13px" }}>✓ MySQL Connected (`college_erp`)</div>
              <button className="orange" type="submit" style={{ marginTop: "15px" }}>Save Configurations</button>
            </form>
          </section>
        )}

        {/* 11.C PASSWORD CHANGE */}
        {activeMenu === "Password Change" && (
          <section className="card" style={{ maxWidth: "500px" }}>
            <h2>🔑 Change Account Password</h2>
            <form onSubmit={e => { e.preventDefault(); setMessage("Password updated successfully!"); }} style={{ marginTop: "15px" }}>
              <label>CURRENT PASSWORD *</label><input type="password" placeholder="Enter current password" required />
              <label>NEW PASSWORD *</label><input type="password" placeholder="Enter new secure password" required />
              <label>CONFIRM NEW PASSWORD *</label><input type="password" placeholder="Confirm new password" required />
              <button className="primary" type="submit" style={{ marginTop: "15px" }}>Update Password</button>
            </form>
          </section>
        )}
        {activeMenu === "Fee Collection" && (
          <div className="grid2">
            <section className="card">
              <h2>💳 Regular Fee Collection Desk</h2>
              <form onSubmit={handleCollectFee} style={{ marginTop: "15px" }}>
                <label>SELECT STUDENT *</label>
                <select value={feeCollect.student_id} onChange={e => setFeeCollect({ ...feeCollect, student_id: e.target.value })} required>
                  <option value="">-- Select Student --</option>
                  {students.map(s => <option value={s.id} key={s.id}>{s.admission_no} - {s.name} ({s.class_name})</option>)}
                </select>
                <label>AMOUNT TO COLLECT (₹) *</label>
                <input type="number" step="0.01" value={feeCollect.amount} onChange={e => setFeeCollect({ ...feeCollect, amount: e.target.value })} placeholder="Enter Amount" required />
                <label>PAYMENT MODE</label>
                <select value={feeCollect.payment_mode} onChange={e => setFeeCollect({ ...feeCollect, payment_mode: e.target.value })}>
                  <option>Cash</option><option>UPI / Online</option><option>Cheque</option><option>Bank Transfer</option>
                </select>
                {feeCollect.payment_mode === "UPI / Online" && (
  <div style={{ marginTop: "12px", background: "#f0f9ff", padding: "10px", borderRadius: "6px", border: "1px dashed #0284c7" }}>
    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px", color: "#0369a1" }}>
      TRANSACTION REF / UTR NUMBER *
    </label>
    <input
      type="text"
      placeholder="Enter UPI Ref No / UTR No"
      value={feeCollect.reference_no || ""}
      onChange={(e) => setFeeCollect({ ...feeCollect, reference_no: e.target.value })}
      required
      style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
    />
  </div>
)}
<button className="primary" type="submit" style={{ marginTop: "15px" }}>
 Issue Receipt & Save
 </button>
              </form>
            </section>
            {receipt && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  }}>
    <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", width: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
      <div style={{ border: "2px dashed #333", padding: "16px", borderRadius: "6px" }}>
        <h3 style={{ textAlign: "center", margin: "0 0 10px 0" }}>FEE RECEIPT</h3>
        <p style={{ margin: "4px 0", fontSize: "13px" }}><b>Receipt No:</b> {receipt.receipt_no}</p>
        <p style={{ margin: "4px 0", fontSize: "13px" }}><b>Student:</b> {receipt.student_name}</p>
        <p style={{ margin: "4px 0", fontSize: "13px" }}><b>Payment Mode:</b> {receipt.payment_mode}</p>
        {receipt.reference_no && (
          <p style={{ margin: "4px 0", fontSize: "13px" }}><b>Ref / UTR:</b> {receipt.reference_no}</p>
        )}
        <hr style={{ margin: "10px 0" }} />
        <h4 style={{ margin: "0", color: "#16a34a" }}>Paid: ₹{receipt.amount}</h4>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "15px" }}>
        <button className="primary" onClick={() => window.print()}>Print</button>
        <button onClick={() => setReceipt(null)} style={{ padding: "6px 12px" }}>Close</button>
      </div>
    </div>
  </div>
)}
            <section className="card">
             <div className="table-head"><h2>Recent Payments Log</h2></div>
              <table>
              <thead>
                <tr>
                  <th>REC NO</th>
                  <th>STUDENT</th>
                  <th>AMOUNT</th>
                  <th>MODE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td><b>{p.receipt_no}</b></td>
                    <td>{p.student_name}</td>
                    <td style={{ color: "#10b981", fontWeight: "bold" }}>₹{Number(p.amount)}</td>
                    <td>{p.mode || "Cash"}</td>
                    <td>
                      <button 
                        type="button" 
                        onClick={() => handleEditPayment(p)}
                        style={{ padding: "4px 8px", marginRight: "6px", cursor: "pointer", background: "#fef08a", border: "1px solid #ca8a04", borderRadius: "4px" }}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDeletePayment(p.id)}
                        style={{ padding: "4px 8px", cursor: "pointer", background: "#fee2e2", border: "1px solid #dc2626", color: "#dc2626", borderRadius: "4px" }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </section>
            <section className="card" style={{ marginTop: "24px", background: "#fff", padding: "20px", borderRadius: "8px" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
    <h3 style={{ margin: 0, fontSize: "16px" }}>📊 Pending & Due Fees Summary</h3>
    <button className="primary" onClick={fetchDues} style={{ padding: "6px 12px", cursor: "pointer" }}>Refresh List</button>
  </div>
  
  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
    <thead>
      <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #cbd5e1" }}>
        <th style={{ padding: "10px" }}>Roll / Adm No</th>
        <th style={{ padding: "10px" }}>Student Name</th>
        <th style={{ padding: "10px" }}>Total Fee</th>
        <th style={{ padding: "10px" }}>Paid</th>
        <th style={{ padding: "10px" }}>Balance Due</th>
        <th style={{ padding: "10px" }}>Status</th>
      </tr>
    </thead>
    <tbody>
      {duesList.map((item) => (
        <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
          <td style={{ padding: "10px" }}>{item.admission_no}</td>
          <td style={{ padding: "10px" }}><b>{item.name}</b></td>
          <td style={{ padding: "10px" }}>₹{Number(item.total_fee).toLocaleString("en-IN")}</td>
          <td style={{ padding: "10px", color: "#16a34a" }}>₹{Number(item.paid_amount).toLocaleString("en-IN")}</td>
          <td style={{ padding: "10px", color: item.balance_amount > 0 ? "#dc2626" : "#16a34a", fontWeight: "bold" }}>
            ₹{Number(item.balance_amount).toLocaleString("en-IN")}
          </td>
          <td style={{ padding: "10px" }}>
            <span style={{
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: "bold",
              background: item.balance_amount <= 0 ? "#dcfce7" : "#fee2e2",
              color: item.balance_amount <= 0 ? "#15803d" : "#b91c1c"
            }}>
              {item.balance_amount <= 0 ? "PAID" : "PENDING"}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</section>
          </div>
        )}
      

        {/* 12.B QUICK FEE COLLECT */}
        {activeMenu === "Quick Fee Collect" && (
          <section className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
              <span style={{ fontSize: "24px" }}>⚡</span>
              <div><h2 style={{ margin: 0 }}>Express Quick Fee Collect</h2><small style={{ color: "#64748b" }}>Instant Counter Mode</small></div>
            </div>
            <form onSubmit={handleCollectFee} style={{ marginTop: "20px" }}>
              <label>QUICK SELECT STUDENT *</label>
              <select value={feeCollect.student_id} onChange={e => setFeeCollect({ ...feeCollect, student_id: e.target.value })} required style={{ fontSize: "15px", padding: "10px" }}>
                <option value="">-- Choose Student by Admission No --</option>
                {students.map(s => <option value={s.id} key={s.id}>{s.admission_no} | {s.name} ({s.class_name})</option>)}
              </select>
              <label style={{ marginTop: "15px" }}>COLLECT AMOUNT (₹) *</label>
              <input type="number" step="0.01" value={feeCollect.amount} onChange={e => setFeeCollect({ ...feeCollect, amount: e.target.value })} placeholder="Amount" required style={{ fontSize: "18px", fontWeight: "bold", padding: "10px" }} />
              <button className="orange" type="submit" style={{ width: "100%", padding: "12px", fontSize: "16px", fontWeight: "bold", marginTop: "25px" }}>
                ⚡ One-Click Instant Collect & Print
              </button>
            </form>
          </section>
        )}

        {activeMenu === "Attendance" && (
  <section className="card" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
    <h2>📋 Branch-wise Daily Attendance</h2>
    <p style={{ color: "#666", marginBottom: "15px" }}>Mark student attendance by Course / Branch.</p>

    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr auto", gap: "10px", alignItems: "end", marginBottom: "20px" }}>
      <div>
        <label>COURSE / BRANCH *</label>
        <select value={attBranch} onChange={e => setAttBranch(e.target.value)}>
          <option value="">-- Select Course / Branch --</option>
          {classes.map(c => (
            <option value={c.id} key={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>DATE *</label>
        <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} />
      </div>

      <button className="primary" type="button" onClick={fetchAttendance} style={{ height: "40px" }}>
        Load Students
      </button>
    </div>

    {attList.length > 0 ? (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Roll / Adm No</th>
              <th style={{ padding: "8px" }}>Student Name</th>
              <th style={{ padding: "8px", textAlign: "center" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {attList.map(s => (
              <tr key={s.student_id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px", fontWeight: "bold" }}>{s.admission_no}</td>
                <td style={{ padding: "8px" }}>{s.name}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>
                  <button 
                    type="button"
                    onClick={() => handleAttStatusChange(s.student_id, "Present")}
                    style={{ 
                      padding: "5px 12px", marginRight: "6px", cursor: "pointer",
                      background: s.status === "Present" ? "#16a34a" : "#e2e8f0", 
                      color: s.status === "Present" ? "#fff" : "#333", border: "none", borderRadius: "4px" 
                    }}
                  >
                    P
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleAttStatusChange(s.student_id, "Absent")}
                    style={{ 
                      padding: "5px 12px", cursor: "pointer",
                      background: s.status === "Absent" ? "#dc2626" : "#e2e8f0", 
                      color: s.status === "Absent" ? "#fff" : "#333", border: "none", borderRadius: "4px" 
                    }}
                  >
                    A
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="primary" type="button" onClick={handleSaveAttendance} style={{ width: "100%", height: "42px", fontWeight: "bold" }}>
          💾 Save Attendance
        </button>
      </div>
    ) : (
      <p style={{ color: "#888", textAlign: "center", marginTop: "20px" }}>
        Select a Course/Branch and click "Load Students" to take attendance.
      </p>
    )}
  </section>
)}

        {/* 13.B ATTENDANCE REPORT */}
        {activeMenu === "Attendance Report" && (
          <div>
            <div className="grid2" style={{ marginBottom: "20px" }}>
              <div className="card" style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                <h4>Present Count ({attendanceDate})</h4>
                <h1 style={{ color: "#059669", marginTop: "10px" }}>{students.filter(s => (attendanceRecords[s.id] || "Present") === "Present").length}</h1>
                <small>Total Present Students</small>
              </div>
              <div className="card" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <h4>Absent Count ({attendanceDate})</h4>
                <h1 style={{ color: "#dc2626", marginTop: "10px" }}>{students.filter(s => attendanceRecords[s.id] === "Absent").length}</h1>
                <small>Total Absent Students</small>
              </div>
            </div>
            <section className="card">
              <div className="table-head"><h2>📊 Attendance Status Report</h2><input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} /></div>
              <table>
                <thead><tr><th>#</th><th>ADM NO</th><th>NAME</th><th>CLASS</th><th>DATE</th><th>STATUS</th></tr></thead>
                <tbody>
                  {students.map((s, idx) => {
                    const status = attendanceRecords[s.id] || "Present";
                    return (
                      <tr key={s.id}>
                        <td>{idx + 1}</td><td><b>{s.admission_no}</b></td><td>{s.name}</td><td>{s.class_name}</td><td>{attendanceDate}</td>
                        <td><span style={{ padding: "4px 10px", borderRadius: "4px", fontWeight: "bold", background: status === "Present" ? "#d1fae5" : "#fee2e2", color: status === "Present" ? "#065f46" : "#991b1b" }}>{status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {/* 14. EXPENSES WITH EDIT & DELETE */}
        {activeMenu === "Expenses" && (
          <div className="grid2">
            <section className="card">
              <h2>🧾 {editingExpense ? "Edit Expense Bill" : "Log College Expense & GST"}</h2>
              <form onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense} style={{ marginTop: "15px" }}>
                <label>CATEGORY *</label>
                <select 
                  value={editingExpense ? editingExpense.category : expenseForm.category} 
                  onChange={e => editingExpense ? setEditingExpense({ ...editingExpense, category: e.target.value }) : setExpenseForm({ ...expenseForm, category: e.target.value })}
                >
                  <option>Office Supplies</option><option>Utilities</option><option>Equipment</option><option>Stationery</option><option>Events</option>
                </select>
                <label>VENDOR NAME *</label>
                <input 
                  value={editingExpense ? editingExpense.vendor_name : expenseForm.vendor_name} 
                  onChange={e => editingExpense ? setEditingExpense({ ...editingExpense, vendor_name: e.target.value }) : setExpenseForm({ ...expenseForm, vendor_name: e.target.value })} 
                  placeholder="Vendor Name" 
                  required 
                />
                <label>INVOICE NO</label>
                <input 
                  value={editingExpense ? editingExpense.invoice_no : expenseForm.invoice_no} 
                  onChange={e => editingExpense ? setEditingExpense({ ...editingExpense, invoice_no: e.target.value }) : setExpenseForm({ ...expenseForm, invoice_no: e.target.value })} 
                  placeholder="INV-001" 
                />
                <label>TAXABLE AMOUNT (₹) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={editingExpense ? editingExpense.taxable_amount : expenseForm.taxable_amount} 
                  onChange={e => editingExpense ? setEditingExpense({ ...editingExpense, taxable_amount: e.target.value }) : setExpenseForm({ ...expenseForm, taxable_amount: e.target.value })} 
                  required 
                />
                <div className="row">
                  <div>
                    <label>CGST</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editingExpense ? editingExpense.cgst : expenseForm.cgst} 
                      onChange={e => editingExpense ? setEditingExpense({ ...editingExpense, cgst: e.target.value }) : setExpenseForm({ ...expenseForm, cgst: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label>SGST</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editingExpense ? editingExpense.sgst : expenseForm.sgst} 
                      onChange={e => editingExpense ? setEditingExpense({ ...editingExpense, sgst: e.target.value }) : setExpenseForm({ ...expenseForm, sgst: e.target.value })} 
                    />
                  </div>
                </div>
                {!editingExpense && (
                  <>
                    <label>ATTACH INVOICE FILE</label>
                    <input type="file" onChange={e => setInvoiceFile(e.target.files[0])} />
                  </>
                )}
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button className="primary" type="submit">{editingExpense ? "Update Expense" : "Save Expense Record"}</button>
                  {editingExpense && <button type="button" onClick={() => setEditingExpense(null)} style={{ background: "#94a3b8", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>}
                </div>
              </form>
            </section>

            <section className="card">
              <div className="table-head"><h2>Logged Expenses</h2></div>
              <table>
                <thead><tr><th>VENDOR</th><th>TAXABLE</th><th>TOTAL</th><th>FILE</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id}>
                      <td><b>{exp.vendor_name}</b><br/><small>{exp.category}</small></td>
                      <td>₹{Number(exp.taxable_amount).toFixed(2)}</td>
                      <td style={{ color: "#ef4444", fontWeight: "bold" }}>₹{Number(exp.total_amount).toFixed(2)}</td>
                      <td>{exp.doc_path ? <a href={`http://localhost:4000${exp.doc_path}`} target="_blank" rel="noreferrer" style={{ color: "#3b82f6" }}>View Bill</a> : "No File"}</td>
                      <td>
                        <button onClick={() => setEditingExpense(exp)} style={{ background: "#3b82f6", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", marginRight: "6px" }}>✏️</button>
                        <button onClick={() => handleDeleteExpense(exp.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {/* 15.A STAFF MANAGEMENT WITH EDIT & DELETE */}
        {activeMenu === "Staff Management" && (
          <div className="grid2">
            <section className="card">
              <h2>👥 {editingStaff ? "Edit Staff Details" : "Add New Staff / Faculty"}</h2>
              <form onSubmit={e => {
                e.preventDefault();
                if (editingStaff) {
                  setStaffList(staffList.map(st => st.id === editingStaff.id ? editingStaff : st));
                  setEditingStaff(null);
                  setMessage("Staff updated!");
                } else {
                  setStaffList([...staffList, { id: Date.now(), ...staffForm }]);
                  setStaffForm({ emp_id: "", name: "", designation: "", department: "", phone: "" });
                  setMessage("Staff member registered!");
                }
              }} style={{ marginTop: "15px" }}>
                <label>EMPLOYEE ID *</label>
                <input value={editingStaff ? editingStaff.emp_id : staffForm.emp_id} onChange={e => editingStaff ? setEditingStaff({ ...editingStaff, emp_id: e.target.value }) : setStaffForm({ ...staffForm, emp_id: e.target.value })} placeholder="e.g. EMP005" required />
                <label>EMPLOYEE ID *</label>
                <input 
                  value={editingStaff ? editingStaff.emp_id : staffForm.emp_id} 
                  onChange={e => editingStaff ? setEditingStaff({ ...editingStaff, emp_id: e.target.value }) : setStaffForm({ ...staffForm, emp_id: e.target.value })} 
                  placeholder="e.g. EMP005" 
                  required 
                />

                <label>FULL NAME *</label>
                <input 
                  value={editingStaff ? editingStaff.name : staffForm.name} 
                  onChange={e => editingStaff ? setEditingStaff({ ...editingStaff, name: e.target.value }) : setStaffForm({ ...staffForm, name: e.target.value })} 
                  placeholder="e.g. Ramesh Varma" 
                  required 
                />

                <div className="row">
                  <div>
                    <label>DESIGNATION</label>
                    <input 
                      value={editingStaff ? editingStaff.designation : staffForm.designation} 
                      onChange={e => editingStaff ? setEditingStaff({ ...editingStaff, designation: e.target.value }) : setStaffForm({ ...staffForm, designation: e.target.value })} 
                      placeholder="Faculty" 
                      required 
                    />
                  </div>
                  <div>
                    <label>PHONE NUMBER *</label>
                    <input 
                      value={editingStaff ? editingStaff.phone : staffForm.phone} 
                      onChange={e => editingStaff ? setEditingStaff({ ...editingStaff, phone: e.target.value }) : setStaffForm({ ...staffForm, phone: e.target.value })} 
                      placeholder="9876543210" 
                      required 
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button className="primary" type="submit">{editingStaff ? "Save Updates" : "Add Staff Member"}</button>
                  {editingStaff && <button type="button" onClick={() => setEditingStaff(null)} style={{ background: "#94a3b8", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>}
                </div>
              </form>
            </section>

            <section className="card">
              <div className="table-head"><h2>All Active Staff</h2></div>
              <table>
                <thead><tr><th>EMP ID</th><th>NAME</th><th>DESIGNATION</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {staffList.map(st => (
                    <tr key={st.id}>
                      <td><b>{st.emp_id}</b></td><td>{st.name}</td><td>{st.designation}</td>
                      <td>
                        <button onClick={() => setEditingStaff(st)} style={{ background: "#3b82f6", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", marginRight: "6px" }}>✏️</button>
                        <button onClick={() => setStaffList(staffList.filter(item => item.id !== st.id))} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {/* 15.B SALARY MANAGEMENT WITH EDIT & DELETE */}
        {activeMenu === "Salary Management" && (
          <div className="grid2">
            <section className="card">
              <h2>💼 {editingSalary ? "Edit Salary Voucher" : "Disburse Employee Salary"}</h2>
              <form onSubmit={editingSalary ? handleUpdateSalary : handleAddSalary} style={{ marginTop: "15px" }}>
                <div className="row">
                  <div>
                    <label>EMP ID *</label>
                    <input 
                      value={editingSalary ? editingSalary.emp_id : salaryForm.emp_id} 
                      onChange={e => editingSalary ? setEditingSalary({ ...editingSalary, emp_id: e.target.value }) : setSalaryForm({ ...salaryForm, emp_id: e.target.value })} 
                      placeholder="EMP01" 
                      required 
                    />
                  </div>
                  <div>
                    <label>EMP NAME *</label>
                    <input 
                      value={editingSalary ? editingSalary.emp_name : salaryForm.emp_name} 
                      onChange={e => editingSalary ? setEditingSalary({ ...editingSalary, emp_name: e.target.value }) : setSalaryForm({ ...salaryForm, emp_name: e.target.value })} 
                      placeholder="Full name" 
                      required 
                    />
                  </div>
                </div>
                <div className="row">
                  <div>
                    <label>DESIGNATION</label>
                    <input 
                      value={editingSalary ? editingSalary.designation : salaryForm.designation} 
                      onChange={e => editingSalary ? setEditingSalary({ ...editingSalary, designation: e.target.value }) : setSalaryForm({ ...salaryForm, designation: e.target.value })} 
                      placeholder="Faculty / Admin" 
                    />
                  </div>
                  <div>
                    <label>BASIC SALARY (₹) *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editingSalary ? editingSalary.basic_salary : salaryForm.basic_salary} 
                      onChange={e => editingSalary ? setEditingSalary({ ...editingSalary, basic_salary: e.target.value }) : setSalaryForm({ ...salaryForm, basic_salary: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
                <div className="row">
                  <div>
                    <label>ALLOWANCES (+)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editingSalary ? editingSalary.allowances : salaryForm.allowances} 
                      onChange={e => editingSalary ? setEditingSalary({ ...editingSalary, allowances: e.target.value }) : setSalaryForm({ ...salaryForm, allowances: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label>DEDUCTIONS (-)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={editingSalary ? editingSalary.deductions : salaryForm.deductions} 
                      onChange={e => editingSalary ? setEditingSalary({ ...editingSalary, deductions: e.target.value }) : setSalaryForm({ ...salaryForm, deductions: e.target.value })} 
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button className="primary" type="submit">{editingSalary ? "Update Salary Voucher" : "Save Salary Voucher"}</button>
                  {editingSalary && <button type="button" onClick={() => setEditingSalary(null)} style={{ background: "#94a3b8", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>}
                </div>
              </form>
            </section>

            <section className="card">
              <div className="table-head"><h2>Recent Salary Vouchers</h2></div>
              <table>
                <thead><tr><th>EMP NAME</th><th>BASIC</th><th>NET SALARY</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {salaries.map(sal => (
                    <tr key={sal.id}>
                      <td><b>{sal.emp_name}</b><br/><small>{sal.emp_id}</small></td>
                      <td>₹{Number(sal.basic_salary).toFixed(2)}</td>
                      <td style={{ color: "#10b981", fontWeight: "bold" }}>₹{Number(sal.net_salary).toFixed(2)}</td>
                      <td>
                        <button onClick={() => setEditingSalary(sal)} style={{ background: "#3b82f6", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", marginRight: "6px" }}>✏️</button>
                        <button onClick={() => handleDeleteSalary(sal.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {/* 15.C SALARY REPORT */}
        {activeMenu === "Salary Report" && (
          <section className="card">
            <div className="table-head">
              <h2>📊 Monthly Salary Disbursal Report</h2>
              <a href={`${API}/export/salaries`} className="primary" style={{ padding: "8px 16px", textDecoration: "none", borderRadius: "5px" }} download>📥 Export Payroll Excel</a>
            </div>
            <table>
              <thead><tr><th>#</th><th>EMP ID</th><th>NAME</th><th>DESIGNATION</th><th>BASIC</th><th>NET SALARY</th><th>DATE</th></tr></thead>
              <tbody>
                {salaries.map((sal, i) => (
                  <tr key={sal.id}>
                    <td>{i + 1}</td><td><b>{sal.emp_id}</b></td><td>{sal.emp_name}</td><td>{sal.designation}</td>
                    <td>₹{Number(sal.basic_salary).toFixed(2)}</td>
                    <td style={{ color: "#10b981", fontWeight: "bold" }}>₹{Number(sal.net_salary).toFixed(2)}</td>
                    <td>{sal.payment_date?.split("T")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 16. INCOME VS EXPENSE */}
        {activeMenu === "Income vs Expense" && (
          <div className="card">
            <h2>⚖️ College Cash & Bank Balance Tracking</h2>
            <div className="grid2" style={{ marginTop: "20px" }}>
              <div style={{ background: "#ecfdf5", padding: "20px", borderRadius: "8px", border: "1px solid #a7f3d0" }}>
                <h4>Total Revenue Collected (Income)</h4>
                <h1 style={{ color: "#059669", marginTop: "10px" }}>₹{finOverview.totalIncome.toFixed(2)}</h1>
                <small>From All Student Fees</small>
              </div>
              <div style={{ background: "#fef2f2", padding: "20px", borderRadius: "8px", border: "1px solid #fecaca" }}>
                <h4>Total Outflow (Salaries + Expenses)</h4>
                <h1 style={{ color: "#dc2626", marginTop: "10px" }}>₹{finOverview.totalOutflow.toFixed(2)}</h1>
                <small>Salaries: ₹{finOverview.salaries.toFixed(2)} | Bills: ₹{finOverview.expenses.toFixed(2)}</small>
              </div>
            </div>
            <div style={{ marginTop: "20px", padding: "20px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
              <h3>Net Closing Cash/Bank Balance: <span style={{ color: finOverview.netBalance >= 0 ? "#10b981" : "#ef4444" }}>₹{finOverview.netBalance.toFixed(2)}</span></h3>
            </div>
          </div>
        )}

        {/* 17. REPORTS */}
        {activeMenu === "Reports" && (
          <section className="card">
            <h2>📊 Download Reports to Excel (.xlsx)</h2>
            <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
              <a href={`${API}/export/students`} className="primary" style={{ padding: "12px 20px", textDecoration: "none", borderRadius: "6px" }} download>📥 Export Students (.xlsx)</a>
              <a href={`${API}/export/fees`} className="orange" style={{ padding: "12px 20px", textDecoration: "none", borderRadius: "6px" }} download>📥 Export Fee Receipts (.xlsx)</a>
              <a href={`${API}/export/salaries`} className="primary" style={{ padding: "12px 20px", textDecoration: "none", borderRadius: "6px" }} download>📥 Export Payroll (.xlsx)</a>
              <a href={`${API}/export/expenses`} className="orange" style={{ padding: "12px 20px", textDecoration: "none", borderRadius: "6px" }} download>📥 Export GST & Expenses (.xlsx)</a>
            </div>
          </section>
        )}

        {/* 18. NOTICES WITH DELETE */}
        {activeMenu === "Notices" && (
          <div className="grid2">
            <section className="card">
              <h2>📢 Publish Notice</h2>
              <form onSubmit={handleAddNotice} style={{ marginTop: "15px" }}>
                <label>TITLE *</label>
                <input value={newNotice.title} onChange={e => setNewNotice({ ...newNotice, title: e.target.value })} placeholder="Notice Title" required />
                <label>MESSAGE *</label>
                <textarea rows="4" value={newNotice.body} onChange={e => setNewNotice({ ...newNotice, body: e.target.value })} placeholder="Notice details..." required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                <button className="primary" type="submit" style={{ marginTop: "15px" }}>Publish Notice</button>
              </form>
            </section>
            <section className="card">
              <div className="table-head"><h2>Active Notices</h2></div>
              {notices.map(n => (
                <div key={n.id} style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <b>{n.title}</b>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0" }}>{n.date?.split("T")[0]}</p>
                    <p style={{ margin: "5px 0" }}>{n.body}</p>
                  </div>
                  <button onClick={() => handleDeleteNotice(n.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>🗑️ Delete</button>
                </div>
              ))}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
