// lib/data.ts  — All mock data for the School Management System

export const STUDENTS = [
  { id: 1, name: "Aarav Sharma", roll: "10A-01", class: "10-A", dob: "2009-03-12", gender: "Male",   phone: "9876543210", guardian: "Rajesh Sharma",   fee: "paid",    status: "active" },
  { id: 2, name: "Priya Patel",  roll: "10A-02", class: "10-A", dob: "2009-07-22", gender: "Female", phone: "9876543211", guardian: "Sunil Patel",     fee: "pending", status: "active" },
  { id: 3, name: "Rohan Gupta",  roll: "10B-01", class: "10-B", dob: "2008-11-05", gender: "Male",   phone: "9876543212", guardian: "Mohan Gupta",     fee: "paid",    status: "active" },
  { id: 4, name: "Sneha Verma",  roll: "9A-01",  class: "9-A",  dob: "2010-01-18", gender: "Female", phone: "9876543213", guardian: "Kavita Verma",    fee: "overdue", status: "active" },
  { id: 5, name: "Arjun Singh",  roll: "9A-02",  class: "9-A",  dob: "2010-04-30", gender: "Male",   phone: "9876543214", guardian: "Harpreet Singh",  fee: "paid",    status: "active" },
  { id: 6, name: "Diya Mehta",   roll: "8A-01",  class: "8-A",  dob: "2011-09-14", gender: "Female", phone: "9876543215", guardian: "Nitin Mehta",     fee: "paid",    status: "active" },
  { id: 7, name: "Kabir Khan",   roll: "8B-01",  class: "8-B",  dob: "2011-06-25", gender: "Male",   phone: "9876543216", guardian: "Salim Khan",      fee: "pending", status: "active" },
  { id: 8, name: "Ananya Joshi", roll: "7A-01",  class: "7-A",  dob: "2012-02-08", gender: "Female", phone: "9876543217", guardian: "Prakash Joshi",   fee: "paid",    status: "active" },
];

export const TEACHERS = [
  { id: 1, name: "Mrs. Sunita Rao",     subject: "Mathematics",     class: "10-A, 10-B", phone: "9811111111", email: "sunita@school.edu",   qualification: "M.Sc. Math",  exp: "12 yrs", status: "active" },
  { id: 2, name: "Mr. Deepak Tiwari",   subject: "Science",         class: "9-A, 9-B",   phone: "9811111112", email: "deepak@school.edu",   qualification: "M.Sc. Phys",  exp: "8 yrs",  status: "active" },
  { id: 3, name: "Mrs. Pooja Agarwal",  subject: "English",         class: "8-A, 8-B",   phone: "9811111113", email: "pooja@school.edu",    qualification: "M.A. English", exp: "10 yrs", status: "active" },
  { id: 4, name: "Mr. Ravi Kumar",      subject: "Social Studies",  class: "7-A, 7-B",   phone: "9811111114", email: "ravi@school.edu",     qualification: "M.A. History", exp: "6 yrs",  status: "active" },
  { id: 5, name: "Mrs. Anita Sharma",   subject: "Hindi",           class: "6-A, 6-B",   phone: "9811111115", email: "anita@school.edu",    qualification: "M.A. Hindi",  exp: "15 yrs", status: "on-leave" },
  { id: 6, name: "Mr. Sanjay Mishra",   subject: "Computer Science",class: "9-A, 10-A",  phone: "9811111116", email: "sanjay@school.edu",   qualification: "MCA",         exp: "9 yrs",  status: "active" },
];

export const CLASSES = [
  { id: 1, name: "Class 10-A", teacher: "Mrs. Sunita Rao",    students: 42, room: "101", subjects: ["Math", "Science", "English", "Hindi", "Social Studies", "Computer"] },
  { id: 2, name: "Class 10-B", teacher: "Mr. Deepak Tiwari",  students: 40, room: "102", subjects: ["Math", "Science", "English", "Hindi", "Social Studies", "Computer"] },
  { id: 3, name: "Class 9-A",  teacher: "Mrs. Pooja Agarwal", students: 38, room: "201", subjects: ["Math", "Science", "English", "Hindi", "Social Studies"] },
  { id: 4, name: "Class 9-B",  teacher: "Mr. Ravi Kumar",     students: 36, room: "202", subjects: ["Math", "Science", "English", "Hindi", "Social Studies"] },
  { id: 5, name: "Class 8-A",  teacher: "Mrs. Anita Sharma",  students: 35, room: "301", subjects: ["Math", "Science", "English", "Hindi", "Social Studies"] },
  { id: 6, name: "Class 7-A",  teacher: "Mr. Sanjay Mishra",  students: 33, room: "302", subjects: ["Math", "Science", "English", "Hindi", "Social Studies"] },
];

export const ATTENDANCE = [
  { id: 1, student: "Aarav Sharma",  class: "10-A", date: "2025-01-20", status: "present" },
  { id: 2, student: "Priya Patel",   class: "10-A", date: "2025-01-20", status: "absent" },
  { id: 3, student: "Rohan Gupta",   class: "10-B", date: "2025-01-20", status: "present" },
  { id: 4, student: "Sneha Verma",   class: "9-A",  date: "2025-01-20", status: "late" },
  { id: 5, student: "Arjun Singh",   class: "9-A",  date: "2025-01-20", status: "present" },
  { id: 6, student: "Diya Mehta",    class: "8-A",  date: "2025-01-20", status: "present" },
  { id: 7, student: "Kabir Khan",    class: "8-B",  date: "2025-01-20", status: "absent" },
  { id: 8, student: "Ananya Joshi",  class: "7-A",  date: "2025-01-20", status: "present" },
];

export const NOTICES = [
  { id: 1, title: "Annual Sports Day", content: "Annual Sports Day will be held on 28th January 2025. All students must participate in at least one event. Forms available at reception.", date: "2025-01-18", priority: "high",   target: "All",    sms: true  },
  { id: 2, title: "Fee Submission Deadline", content: "Last date for fee submission for Q3 is 25th January 2025. Penalty charges will apply after the deadline.", date: "2025-01-15", priority: "urgent", target: "All",    sms: true  },
  { id: 3, title: "PTM – Class 10",    content: "Parent-Teacher Meeting for Class 10 is scheduled for 22nd January at 10:00 AM in the school auditorium.", date: "2025-01-14", priority: "medium", target: "10-A, 10-B", sms: false },
  { id: 4, title: "Republic Day Holiday", content: "School will remain closed on 26th January 2025 on account of Republic Day.", date: "2025-01-12", priority: "low",    target: "All",    sms: false },
];

export const SMS_LOGS = [
  { id: 1, to: "Rajesh Sharma (Parent)",  message: "Aarav Sharma was PRESENT today (20-Jan).",            type: "attendance", status: "sent",   time: "08:45 AM" },
  { id: 2, to: "Sunil Patel (Parent)",    message: "Priya Patel was ABSENT today (20-Jan). Please check.", type: "absent",     status: "sent",   time: "08:46 AM" },
  { id: 3, to: "All Parents – Class 10",  message: "PTM scheduled on 22-Jan at 10 AM. Please attend.",     type: "notice",     status: "sent",   time: "09:00 AM" },
  { id: 4, to: "Salim Khan (Parent)",     message: "Kabir Khan was ABSENT today (20-Jan). Please check.",  type: "absent",     status: "failed", time: "08:47 AM" },
  { id: 5, to: "All Parents",             message: "Fee deadline is 25-Jan. Kindly submit fees on time.",   type: "general",    status: "sent",   time: "10:30 AM" },
];

export const EXAMS = [
  { id: 1, name: "Unit Test 1",     class: "10-A", subject: "Mathematics",     date: "2025-01-25", maxMarks: 25, status: "upcoming" },
  { id: 2, name: "Unit Test 1",     class: "10-A", subject: "Science",         date: "2025-01-26", maxMarks: 25, status: "upcoming" },
  { id: 3, name: "Half Yearly",     class: "9-A",  subject: "All Subjects",    date: "2025-02-10", maxMarks: 100, status: "upcoming" },
  { id: 4, name: "Unit Test 1",     class: "8-A",  subject: "English",         date: "2025-01-22", maxMarks: 25, status: "completed" },
  { id: 5, name: "Annual Exam",     class: "10-B", subject: "All Subjects",    date: "2025-03-15", maxMarks: 100, status: "upcoming" },
];

export const RESULTS = [
  { id: 1, student: "Aarav Sharma",  class: "10-A", exam: "Unit Test 1", subject: "Mathematics", marks: 22, maxMarks: 25, grade: "A+" },
  { id: 2, student: "Priya Patel",   class: "10-A", exam: "Unit Test 1", subject: "Mathematics", marks: 18, maxMarks: 25, grade: "B" },
  { id: 3, student: "Rohan Gupta",   class: "10-B", exam: "Unit Test 1", subject: "Science",     marks: 20, maxMarks: 25, grade: "A" },
  { id: 4, student: "Sneha Verma",   class: "9-A",  exam: "Unit Test 1", subject: "English",     marks: 15, maxMarks: 25, grade: "C" },
];

export const FEES = [
  { id: 1, student: "Aarav Sharma", class: "10-A", amount: 12000, paid: 12000, due: 0,     dueDate: "2025-01-25", status: "paid" },
  { id: 2, student: "Priya Patel",  class: "10-A", amount: 12000, paid: 6000,  due: 6000,  dueDate: "2025-01-25", status: "pending" },
  { id: 3, student: "Rohan Gupta",  class: "10-B", amount: 12000, paid: 12000, due: 0,     dueDate: "2025-01-25", status: "paid" },
  { id: 4, student: "Sneha Verma",  class: "9-A",  amount: 10000, paid: 0,     due: 10000, dueDate: "2025-01-10", status: "overdue" },
  { id: 5, student: "Arjun Singh",  class: "9-A",  amount: 10000, paid: 10000, due: 0,     dueDate: "2025-01-25", status: "paid" },
  { id: 6, student: "Kabir Khan",   class: "8-B",  amount: 9000,  paid: 4500,  due: 4500,  dueDate: "2025-01-25", status: "pending" },
];

export const TIMETABLE = {
  "10-A": {
    Monday:    ["Math",    "Science", "English",  "Hindi",   "Social", "Computer"],
    Tuesday:   ["English", "Math",    "Science",  "PE",      "Hindi",  "Library"],
    Wednesday: ["Science", "Hindi",   "Math",     "English", "Computer","Social"],
    Thursday:  ["Hindi",   "English", "Social",   "Math",    "Science","PE"],
    Friday:    ["Computer","Social",  "Hindi",    "Science", "Math",   "Assembly"],
    Saturday:  ["Math",    "Science", "Activities","Activities","—",   "—"],
  }
};

export const LIBRARY_BOOKS = [
  { id: 1, title: "Mathematics Textbook Class 10",  author: "NCERT",           category: "Textbook",  available: 8,  total: 10, isbn: "978-81-7450-001-1" },
  { id: 2, title: "Science for Class 9",            author: "NCERT",           category: "Textbook",  available: 5,  total: 10, isbn: "978-81-7450-002-2" },
  { id: 3, title: "Wings of Fire",                  author: "A.P.J. Abdul Kalam", category: "Autobiography", available: 2, total: 5, isbn: "978-81-7371-146-3" },
  { id: 4, title: "The Jungle Book",                author: "Rudyard Kipling", category: "Fiction",   available: 0,  total: 3,  isbn: "978-0-14-062382-3" },
  { id: 5, title: "India: A History",               author: "John Keay",       category: "Reference", available: 3,  total: 4,  isbn: "978-0-8021-3797-5" },
];

export const TRANSPORT_ROUTES = [
  { id: 1, route: "Route 1 – North Zone",  bus: "DL-1C-1234", driver: "Ramesh Kumar", stops: ["Pitampura", "Rohini", "Shalimar Bagh"], students: 28, status: "active" },
  { id: 2, route: "Route 2 – South Zone",  bus: "DL-1C-5678", driver: "Suresh Singh", stops: ["Saket", "Malviya Nagar", "Hauz Khas"],  students: 24, status: "active" },
  { id: 3, route: "Route 3 – East Zone",   bus: "DL-1C-9012", driver: "Prakash Yadav",stops: ["Laxmi Nagar", "Mayur Vihar", "Patparganj"], students: 20, status: "maintenance" },
];

export const COLORS = ["#1e3a5f","#3b82f6","#8b5cf6","#ec4899","#10b981","#f59e0b","#ef4444","#14b8a6"];
