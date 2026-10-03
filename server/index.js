const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "college_erp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  try {
    const conn = await pool.getConnection();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
      )
    `);
    await conn.query("INSERT IGNORE INTO admin_users (id, username, password) VALUES (1, 'admin', 'admin123')");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'Staff'
      )
    `);
    await conn.query("INSERT IGNORE INTO users (id, username, password, role) VALUES (1, 'staff', 'staff123', 'Staff')");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      )
    `);

    // Clean up school-level classes if any exist
    try {
      await conn.query(`
        DELETE FROM classes 
        WHERE name LIKE '%Class%' 
           OR name IN ('Nursery', 'LKG', 'UKG')
      `);
    } catch (e) {
      // Ignore foreign key conflict if old students reference them
    }

    // Insert College Courses / Branches
    const collegeCourses = [
      "BTech - CSE", 
      "BTech - AIML", 
      "BTech - AI", 
      "BTech - ECE", 
      "BTech - EEE", 
      "BTech - MEC", 
      "BTech - Civil", 
      "B Pharmacy", 
      "D Pharmacy", 
      "Nursing", 
      "MBA", 
      "M Tech"
    ];
    for (const name of collegeCourses) {
      await conn.query("INSERT IGNORE INTO classes (name) VALUES (?)", [name]);
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admission_no VARCHAR(50) UNIQUE,
        name VARCHAR(150) NOT NULL,
        class_id INT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      )
    `);

    // Add College Admission Columns to Students table
    const alterQueries = [
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_name VARCHAR(100)",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS student_phone VARCHAR(20)",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS caste VARCHAR(20)",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS tenth_marks VARCHAR(50)",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS inter_marks VARCHAR(50)",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS eamcet_qualified VARCHAR(20)",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS eamcet_rank VARCHAR(30)",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS gender VARCHAR(10) DEFAULT 'Male'",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS father_name VARCHAR(100)",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(20)",
      "ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT"
    ];
    for (const q of alterQueries) {
      try { 
        await conn.query(q); 
      } catch (e) {}
    }

    // Admission Enquiries Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admission_enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        candidate_name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        interested_class_id INT,
        tenth_marks VARCHAR(50),
        inter_marks VARCHAR(50),
        eamcet_rank VARCHAR(30),
        notes TEXT,
        status VARCHAR(50) DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (interested_class_id) REFERENCES classes(id) ON DELETE SET NULL
      )
    `);

    // Exams Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exam_name VARCHAR(150) NOT NULL,
        class_id INT NOT NULL,
        exam_date DATE NOT NULL,
        max_marks INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS fee_structures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        fee_type VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        frequency VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_fee (class_id, fee_type, academic_year, frequency),
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_fees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        fee_structure_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        balance_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_student_fee (student_id, fee_structure_id),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS fee_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        receipt_no VARCHAR(50) UNIQUE,
        student_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_mode VARCHAR(50) NOT NULL DEFAULT 'Cash',
        reference_no VARCHAR(100) NULL,
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(20) NOT NULL,
        UNIQUE KEY uq_att (student_id, date),
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS employee_salaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        emp_id VARCHAR(50) NOT NULL,
        emp_name VARCHAR(100) NOT NULL,
        designation VARCHAR(100),
        department VARCHAR(100),
        basic_salary DECIMAL(10,2) NOT NULL,
        allowances DECIMAL(10,2) DEFAULT 0.00,
        deductions DECIMAL(10,2) DEFAULT 0.00,
        advance_amount DECIMAL(10,2) DEFAULT 0.00,
        net_salary DECIMAL(10,2) GENERATED ALWAYS AS (basic_salary + allowances - deductions - advance_amount) STORED,
        payment_date DATE NOT NULL,
        month_year VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        vendor_name VARCHAR(150) NOT NULL,
        invoice_no VARCHAR(100),
        taxable_amount DECIMAL(10,2) NOT NULL,
        cgst DECIMAL(10,2) DEFAULT 0.00,
        sgst DECIMAL(10,2) DEFAULT 0.00,
        igst DECIMAL(10,2) DEFAULT 0.00,
        total_gst DECIMAL(10,2) GENERATED ALWAYS AS (cgst + sgst + igst) STORED,
        total_amount DECIMAL(10,2) GENERATED ALWAYS AS (taxable_amount + cgst + sgst + igst) STORED,
        doc_path VARCHAR(255),
        payment_status VARCHAR(50) DEFAULT 'PAID',
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS notices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        body TEXT NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    conn.release();
    console.log("All Database Tables verified & ready.");
  } catch (err) {
    console.error("DB Init Error:", err.message);
  }
}

initDB();

// ================= APIS =================

// LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [admins] = await pool.query("SELECT id, username, 'Admin' AS role FROM admin_users WHERE username=? AND password=?", [username, password]);
    if (admins.length > 0) return res.json({ success: true, user: admins[0] });

    const [staff] = await pool.query("SELECT id, username, role FROM users WHERE username=? AND password=?", [username, password]);
    if (staff.length > 0) return res.json({ success: true, user: staff[0] });

    res.status(401).json({ error: "Invalid username or password" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// COURSES / BRANCHES (CLASSES)
app.get("/api/classes", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name FROM classes ORDER BY id");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// STUDENTS
app.get("/api/students", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, c.name AS class_name 
      FROM students s
      JOIN classes c ON c.id = s.class_id
      ORDER BY s.id DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

app.post("/api/students", async (req, res) => {
  const { 
    admission_no, name, class_id, gender, father_name, 
    mother_name, student_phone, phone, caste, tenth_marks, 
    inter_marks, eamcet_qualified, eamcet_rank, address 
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO students (
        admission_no, name, class_id, gender, father_name, 
        mother_name, student_phone, phone, caste, tenth_marks, 
        inter_marks, eamcet_qualified, eamcet_rank, address, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [
        String(admission_no).trim(), 
        String(name).trim(), 
        Number(class_id),
        gender || 'Male',
        father_name || '',
        mother_name || '',
        student_phone || '',
        phone || '',
        caste || 'OC',
        tenth_marks || '',
        inter_marks || '',
        eamcet_qualified || 'Qualified',
        eamcet_rank || '',
        address || ''
      ]
    );
    res.status(201).json({ id: result.insertId, message: "Student admitted successfully!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/students/:id", async (req, res) => {
  const { 
    name, admission_no, class_id, gender, father_name, 
    mother_name, student_phone, phone, caste, tenth_marks, 
    inter_marks, eamcet_qualified, eamcet_rank, address 
  } = req.body;

  try {
    await pool.query(
      `UPDATE students SET 
        name = ?, admission_no = ?, class_id = ?, gender = ?, 
        father_name = ?, mother_name = ?, student_phone = ?, 
        phone = ?, caste = ?, tenth_marks = ?, inter_marks = ?, 
        eamcet_qualified = ?, eamcet_rank = ?, address = ? 
      WHERE id = ?`,
      [
        name, admission_no, class_id, gender, father_name, 
        mother_name, student_phone, phone, caste, tenth_marks, 
        inter_marks, eamcet_qualified, eamcet_rank, address, 
        req.params.id
      ]
    );
    res.json({ success: true, message: "Student updated successfully!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM students WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Student deleted successfully!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// STUDENT PROMOTIONS (Course/Year Promotion)
app.post("/api/students/promote", async (req, res) => {
  const { from_class_id, to_class_id } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE students SET class_id = ? WHERE class_id = ? AND status = 'Active'",
      [to_class_id, from_class_id]
    );
    res.json({ 
      success: true, 
      message: `Promoted ${result.affectedRows} students to new course / year successfully!`,
      promotedCount: result.affectedRows 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET ALL ENQUIRIES
app.get("/api/enquiries", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT e.*, c.name as course_name FROM admission_enquiries e LEFT JOIN classes c ON e.class_id = c.id ORDER BY e.id DESC"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// CREATE NEW COLLEGE ENQUIRY
app.post("/api/enquiries", async (req, res) => {
  const { student_name, phone, email, class_id, previous_qualification, previous_marks, entrance_exam_rank, status, notes } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO admission_enquiries 
       (student_name, phone, email, class_id, previous_qualification, previous_marks, entrance_exam_rank, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_name, phone, email, class_id || null, previous_qualification || 'Inter/12th', previous_marks || '', entrance_exam_rank || '', status || 'Pending', notes || '']
    );
    res.json({ success: true, id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// UPDATE ENQUIRY STATUS
app.put("/api/enquiries/:id/status", async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query("UPDATE admission_enquiries SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ success: true, message: "Status updated" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// EXAMS
app.get("/api/exams", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ex.*, c.name AS class_name 
      FROM exams ex 
      JOIN classes c ON c.id = ex.class_id 
      ORDER BY ex.exam_date DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/exams", async (req, res) => {
  const { exam_name, class_id, exam_date, max_marks } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO exams (exam_name, class_id, exam_date, max_marks) VALUES (?, ?, ?, ?)",
      [exam_name, class_id, exam_date, max_marks || 100]
    );
    res.status(201).json({ id: result.insertId, message: "Exam scheduled successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// FEE STRUCTURES
app.get("/api/fee-structures", async (req, res) => {
  const year = req.query.academic_year || "2027-28";
  try {
    const [rows] = await pool.query(
      `SELECT fs.*, c.name AS class_name 
       FROM fee_structures fs 
       JOIN classes c ON c.id = fs.class_id 
       WHERE fs.academic_year = ? 
       ORDER BY c.id, fs.id`,
      [year]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/fee-structures", async (req, res) => {
  const { class_id, fee_type, amount, academic_year, frequency } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO fee_structures (class_id, fee_type, amount, academic_year, frequency) VALUES (?, ?, ?, ?, ?)",
      [Number(class_id), String(fee_type).trim(), Number(amount), academic_year, frequency]
    );
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/fee-structures/:id", async (req, res) => {
  const { class_id, fee_type, amount, frequency } = req.body;
  try {
    await pool.query(
      "UPDATE fee_structures SET class_id = ?, fee_type = ?, amount = ?, frequency = ? WHERE id = ?",
      [class_id, fee_type, Number(amount), frequency, req.params.id]
    );
    res.json({ success: true, message: "Fee structure updated successfully!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/fee-structures/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM fee_structures WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Fee structure deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ASSIGN FEES TO COURSE / BRANCH
app.post("/api/fee-assignments/assign-all", async (req, res) => {
  const { class_id, academic_year } = req.body;
  try {
    const [students] = await pool.query("SELECT id FROM students WHERE class_id=? AND status='Active'", [class_id]);
    const [fees] = await pool.query("SELECT * FROM fee_structures WHERE class_id=? AND academic_year=?", [class_id, academic_year]);
    let created = 0;
    for (const s of students) {
      for (const f of fees) {
        const [r] = await pool.query(
          "INSERT IGNORE INTO student_fees (student_id, fee_structure_id, total_amount, paid_amount, balance_amount) VALUES (?, ?, ?, 0, ?)",
          [s.id, f.id, f.amount, f.amount]
        );
        if (r.affectedRows > 0) created++;
      }
    }
    res.json({ created, students: students.length, fee_types: fees.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// FEE COLLECTION & RECEIPT
app.post("/api/fees/collect", async (req, res) => {
  try {
    const { student_id, amount, payment_mode, reference_no } = req.body;

    if ((payment_mode === "UPI" || payment_mode === "Bank") && !reference_no) {
      return res.status(400).json({ error: "Transaction Reference No is required for UPI/Bank" });
    }

    const receipt_no = `REC/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`;

    const query = `
      INSERT INTO fee_payments (receipt_no, student_id, amount, payment_mode, reference_no) 
      VALUES (?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
      receipt_no,
      Number(student_id),
      Number(amount),
      payment_mode || "Cash",
      reference_no || null
    ]);

    const [[student]] = await pool.query("SELECT name, admission_no FROM students WHERE id = ?", [student_id]);

    res.json({
      success: true,
      receipt_no: receipt_no,
      message: "Payment recorded successfully",
      receipt: {
        receipt_no,
        student_id,
        student_name: student ? student.name : "",
        admission_no: student ? student.admission_no : "",
        amount,
        payment_mode: payment_mode || "Cash",
        reference_no: reference_no || "N/A",
        date: new Date().toISOString().split("T")[0]
      }
    });
  } catch (error) {
    console.error("Fee collect error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/fees/payments", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT fp.*, s.name as student_name, s.admission_no 
      FROM fee_payments fp 
      JOIN students s ON s.id = fp.student_id 
      ORDER BY fp.id DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET Fee Dues Report
app.get("/api/fees/dues", async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id,
        COALESCE(s.admission_no, s.id) AS admission_no,
        s.name,
        50000 AS total_fee,
        COALESCE(SUM(p.amount), 0) AS paid_amount,
        (50000 - COALESCE(SUM(p.amount), 0)) AS balance_amount
      FROM students s
      LEFT JOIN fee_payments p ON s.id = p.student_id
      GROUP BY s.id, s.admission_no, s.name
      ORDER BY balance_amount DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (e) {
    console.error("Dues Fetch Error:", e.message);
    try {
      const [students] = await pool.query("SELECT * FROM students");
      const fallbackData = students.map(s => ({
        id: s.id,
        admission_no: s.admission_no || s.id,
        name: s.name,
        total_fee: 50000,
        paid_amount: 0,
        balance_amount: 50000
      }));
      res.json(fallbackData);
    } catch (err2) {
      res.status(500).json({ error: err2.message });
    }
  }
});

// ATTENDANCE (BRANCH-WISE)
app.post("/api/attendance", async (req, res) => {
  const { records, date } = req.body;
  try {
    for (const r of records) {
      await pool.query(
        "INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)",
        [r.student_id, date, r.status]
      );
    }
    res.json({ success: true, message: "Attendance saved." });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/attendance", async (req, res) => {
  const { date, class_id } = req.query;
  const targetDate = date || new Date().toISOString().split("T")[0];
  try {
    let query = `
      SELECT s.id as student_id, s.name, s.admission_no, 
             COALESCE(a.status, 'Present') as status 
      FROM students s 
      LEFT JOIN attendance a ON s.id = a.student_id AND a.date = ? 
      WHERE s.status = 'active'
    `;
    const params = [targetDate];

    if (class_id) {
      query += ` AND s.class_id = ?`;
      params.push(class_id);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SALARIES / PAYROLL
app.get("/api/salaries", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM employee_salaries ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/salaries", async (req, res) => {
  const { emp_id, emp_name, designation, department, basic_salary, allowances, deductions, advance_amount, payment_date, month_year } = req.body;
  try {
    await pool.query(
      `INSERT INTO employee_salaries (emp_id, emp_name, designation, department, basic_salary, allowances, deductions, advance_amount, payment_date, month_year) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [emp_id, emp_name, designation, department, basic_salary, allowances || 0, deductions || 0, advance_amount || 0, payment_date, month_year]
    );
    res.json({ success: true, message: "Salary saved." });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/salaries/:id", async (req, res) => {
  const { emp_id, emp_name, designation, department, basic_salary, allowances, deductions } = req.body;
  try {
    await pool.query(
      `UPDATE employee_salaries SET emp_id = ?, emp_name = ?, designation = ?, department = ?, basic_salary = ?, allowances = ?, deductions = ? WHERE id = ?`,
      [emp_id, emp_name, designation, department, basic_salary, allowances || 0, deductions || 0, req.params.id]
    );
    res.json({ success: true, message: "Salary voucher updated successfully!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/salaries/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM employee_salaries WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Salary record deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// EXPENSES
app.get("/api/expenses", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM expenses ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/expenses", upload.single("invoice_file"), async (req, res) => {
  const { category, vendor_name, invoice_no, taxable_amount, cgst, sgst, igst, expense_date } = req.body;
  const doc_path = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    await pool.query(
      `INSERT INTO expenses (category, vendor_name, invoice_no, taxable_amount, cgst, sgst, igst, doc_path, expense_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category, vendor_name, invoice_no, taxable_amount, cgst || 0, sgst || 0, igst || 0, doc_path, expense_date]
    );
    res.json({ success: true, message: "Expense recorded." });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  const { category, vendor_name, invoice_no, taxable_amount, cgst, sgst, igst, expense_date } = req.body;
  try {
    await pool.query(
      `UPDATE expenses SET category = ?, vendor_name = ?, invoice_no = ?, taxable_amount = ?, cgst = ?, sgst = ?, igst = ?, expense_date = ? WHERE id = ?`,
      [category, vendor_name, invoice_no, taxable_amount, cgst || 0, sgst || 0, igst || 0, expense_date, req.params.id]
    );
    res.json({ success: true, message: "Expense record updated successfully!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM expenses WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Expense deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// NOTICES
app.get("/api/notices", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM notices ORDER BY id DESC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/notices", async (req, res) => {
  const { title, body } = req.body;
  try {
    await pool.query("INSERT INTO notices (title, body, date) VALUES (?, ?, ?)", [title, body, new Date().toISOString().split("T")[0]]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/notices/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM notices WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Notice deleted" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// FINANCIALS OVERVIEW
app.get("/api/financials/overview", async (req, res) => {
  try {
    const [[feeRes]] = await pool.query("SELECT IFNULL(SUM(amount), 0) AS total_fee_income FROM fee_payments");
    const [[salaryRes]] = await pool.query("SELECT IFNULL(SUM(net_salary), 0) AS total_salaries FROM employee_salaries");
    const [[expenseRes]] = await pool.query("SELECT IFNULL(SUM(total_amount), 0) AS total_expenses FROM expenses");

    const totalIncome = Number(feeRes.total_fee_income);
    const totalOutflow = Number(salaryRes.total_salaries) + Number(expenseRes.total_expenses);
    const netBalance = totalIncome - totalOutflow;

    res.json({
      totalIncome,
      salaries: Number(salaryRes.total_salaries),
      expenses: Number(expenseRes.total_expenses),
      totalOutflow,
      netBalance
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// EXPORT TO EXCEL
app.get("/api/export/:type", async (req, res) => {
  const { type } = req.params;
  try {
    let query = "SELECT * FROM students";
    if (type === "salaries") query = "SELECT * FROM employee_salaries";
    if (type === "expenses") query = "SELECT * FROM expenses";
    if (type === "fees") query = "SELECT * FROM fee_payments";

    const [data] = await pool.query(query);
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, type.toUpperCase());

    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", `attachment; filename=${type}_report.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET EXAM MARKS FOR BRANCH
app.get("/api/exam-marks", async (req, res) => {
  const { class_id, exam_name } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT s.id as student_id, s.name, s.admission_no, 
              em.subject, em.marks_obtained, em.max_marks 
       FROM students s 
       LEFT JOIN exam_marks em ON s.id = em.student_id AND em.exam_name = ? 
       WHERE s.class_id = ? AND s.status = 'active'`,
      [exam_name || 'Sem-1 Mid', class_id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SAVE BATCH EXAM MARKS
app.post("/api/exam-marks/bulk", async (req, res) => {
  const { exam_name, subject, max_marks, records } = req.body;
  try {
    for (const r of records) {
      await pool.query(
        `INSERT INTO exam_marks (student_id, exam_name, subject, marks_obtained, max_marks) 
         VALUES (?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE marks_obtained = VALUES(marks_obtained), max_marks = VALUES(max_marks)`,
        [r.student_id, exam_name, subject, r.marks_obtained || 0, max_marks || 100]
      );
    }
    res.json({ success: true, message: "Marks saved successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PROMOTE STUDENTS TO NEXT SEMESTER / YEAR
app.post("/api/students/promote", async (req, res) => {
  const { current_class_id, target_class_id } = req.body;
  try {
    await pool.query(
      "UPDATE students SET class_id = ? WHERE class_id = ? AND status = 'active'",
      [target_class_id, current_class_id]
    );
    res.json({ success: true, message: "Students promoted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// టేబుల్ ఆటోమేటిక్ గా క్రియేట్ అవ్వడానికి & మార్క్స్ తెచ్చుకోవడానికి
app.get("/api/exam-marks", async (req, res) => {
  const { class_id, exam_name } = req.query;
  try {
    // 1. టేబుల్ లేకపోతే ఆటోమేటిక్ గా క్రియేట్ చేస్తుంది
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_marks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        exam_name VARCHAR(50) NOT NULL,
        sub1 INT DEFAULT 0,
        sub2 INT DEFAULT 0,
        sub3 INT DEFAULT 0,
        sub4 INT DEFAULT 0,
        sub5 INT DEFAULT 0,
        sub6 INT DEFAULT 0,
        total INT DEFAULT 0,
        UNIQUE KEY unique_student_exam (student_id, exam_name)
      )
    `);

    // 2. స్టూడెంట్స్ లిస్ట్ పంపిస్తుంది
    const [rows] = await pool.query(
      `SELECT s.id as student_id, s.name, s.admission_no,
              COALESCE(em.sub1, '') as sub1,
              COALESCE(em.sub2, '') as sub2,
              COALESCE(em.sub3, '') as sub3,
              COALESCE(em.sub4, '') as sub4,
              COALESCE(em.sub5, '') as sub5,
              COALESCE(em.sub6, '') as sub6,
              COALESCE(em.total, '') as total
       FROM students s
       LEFT JOIN exam_marks em ON s.id = em.student_id AND em.exam_name = ?
       WHERE s.class_id = ? AND s.status = 'active'`,
      [exam_name || 'Sem-1 Mid', class_id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 6 సబ్జెక్టుల మార్కులు సేవ్ చేయడానికి
app.post("/api/exam-marks/bulk", async (req, res) => {
  const { exam_name, records } = req.body;
  try {
    for (const r of records) {
      const s1 = Number(r.sub1) || 0;
      const s2 = Number(r.sub2) || 0;
      const s3 = Number(r.sub3) || 0;
      const s4 = Number(r.sub4) || 0;
      const s5 = Number(r.sub5) || 0;
      const s6 = Number(r.sub6) || 0;
      const tot = s1 + s2 + s3 + s4 + s5 + s6;

      await pool.query(
        `INSERT INTO exam_marks (student_id, exam_name, sub1, sub2, sub3, sub4, sub5, sub6, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
            sub1=VALUES(sub1), sub2=VALUES(sub2), sub3=VALUES(sub3),
            sub4=VALUES(sub4), sub5=VALUES(sub5), sub6=VALUES(sub6), total=VALUES(total)`,
        [r.student_id, exam_name, s1, s2, s3, s4, s5, s6, tot]
      );
    }
    res.json({ success: true, message: "Marks saved successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Server Listen
app.listen(PORT, () => console.log(`College ERP API running on http://localhost:${PORT}`));