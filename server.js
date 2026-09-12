const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Root Route Handler to load index.html automatically
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// In-Memory Database Simulation
let pickupRequests = [
  { id: 101, citizenName: "Aarav Sharma", phone: "9876543210", address: "H-42, Connaught Place, New Delhi", wasteType: "Paper & Cardboard", status: "Pending Pickup", collectorAssigned: null },
  { id: 102, citizenName: "Priya Verma", phone: "9123456789", address: "Flat 204, Sector 15, Rohini, Delhi", wasteType: "Plastic Bottles", status: "Accepted", collectorAssigned: "Ramesh Kumar (KB-DL-88)" }
];

let registeredSchools = [
  { schoolId: "SCH-001", name: "Delhi Public School, RK Puram", contact: "admin@dpsrkp.edu", totalStudents: 1200, activeToday: 1140 },
  { schoolId: "SCH-002", name: "Modern School, Barakhamba Road", contact: "info@moderninfo.edu", totalStudents: 950, activeToday: 910 }
];

let studentsList = [
  { studentId: "STU-1001", schoolId: "SCH-001", name: "Rohan Gupta", grade: "12th A", attendanceStatus: "Present" },
  { studentId: "STU-1002", schoolId: "SCH-001", name: "Sneha Iyer", grade: "12th A", attendanceStatus: "Present" },
  { studentId: "STU-2001", schoolId: "SCH-002", name: "Kabir Mehra", grade: "11th B", attendanceStatus: "Absent" }
];

// API Endpoints
app.post('/api/citizen/request-pickup', (req, res) => {
  const { citizenName, phone, address, wasteType } = req.body;
  const newRequest = {
    id: Date.now(),
    citizenName,
    phone,
    address,
    wasteType,
    status: "Pending Pickup",
    collectorAssigned: null
  };
  pickupRequests.push(newRequest);
  res.json({ success: true, message: "Scrap pickup booked successfully! Nearby collector can now view your location.", data: newRequest });
});

app.get('/api/kabadiwala/available-jobs', (req, res) => {
  res.json(pickupRequests);
});

app.post('/api/kabadiwala/accept-job', (req, res) => {
  const { jobId, collectorName } = req.body;
  const job = pickupRequests.find(j => j.id == jobId);
  if (job) {
    job.status = "Accepted & En Route";
    job.collectorAssigned = collectorName;
    return res.json({ success: true, message: `Job accepted! Navigate to citizen location: ${job.address}` });
  }
  res.status(404).json({ success: false, message: "Job not found." });
});

app.get('/api/school/dashboard/:schoolId', (req, res) => {
  const school = registeredSchools.find(s => s.schoolId === req.params.schoolId);
  const students = studentsList.filter(s => s.schoolId === req.params.schoolId);
  if (!school) return res.status(404).json({ error: "School not found" });
  res.json({ school, students });
});

app.post('/api/school/register-student', (req, res) => {
  const { schoolId, name, grade } = req.body;
  const newStudent = {
    studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
    schoolId,
    name,
    grade,
    attendanceStatus: "Present"
  };
  studentsList.push(newStudent);
  const school = registeredSchools.find(s => s.schoolId === schoolId);
  if (school) {
    school.totalStudents += 1;
    school.activeToday += 1;
  }
  res.json({ success: true, message: "Student registered successfully.", data: newStudent });
});

app.get('/api/admin/metrics', (req, res) => {
  res.json({
    totalPickups: pickupRequests.length,
    activeSchools: registeredSchools.length,
    totalRegisteredStudents: studentsList.length,
    systemHealth: "Optimal (Delhi NCR Node Operational)"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});