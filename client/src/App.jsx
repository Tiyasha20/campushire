import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MyApplications from './pages/MyApplications';
import StudentRegister from './pages/StudentRegister';
import RecruiterRegister from './pages/RecruiterRegister';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<div className="p-8 text-white">Unauthorized access.</div>} />

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/applications" element={<MyApplications />} />
          </Route>

          {/* Recruiter routes */}
          <Route element={<ProtectedRoute allowedRoles={['RECRUITER']} />}>
            <Route path="/recruiter" element={<RecruiterDashboard />} />
          </Route>

          {/* TPC Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['TPC_ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/register/student" element={<StudentRegister />}/>
          <Route path="/register/recruiter" element={<RecruiterRegister />}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}