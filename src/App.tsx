import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { LabManagement } from './pages/LabManagement';
import { RadiologyManagement } from './pages/RadiologyManagement';
import { MCUExamination } from './pages/MCUExamination';
import { MCUResultDetail } from './pages/MCUResultDetail';
import { Login } from './pages/Login';
import { authService } from './services/authService';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
};

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedLayout>
              <Patients />
            </ProtectedLayout>
          }
        />
        <Route
          path="/lab"
          element={
            <ProtectedLayout>
              <LabManagement />
            </ProtectedLayout>
          }
        />
        <Route
          path="/radiology"
          element={
            <ProtectedLayout>
              <RadiologyManagement />
            </ProtectedLayout>
          }
        />

        {/* Rute Pemeriksaan MCU */}
        <Route
          path="/mcu-examination/:id"
          element={
            <ProtectedLayout>
              <MCUExamination />
            </ProtectedLayout>
          }
        />

        {/* Alias Rute Kompatibilitas */}
        <Route
          path="/examination/:id"
          element={
            <ProtectedLayout>
              <MCUExamination />
            </ProtectedLayout>
          }
        />

        <Route
          path="/mcu-results/:id"
          element={
            <ProtectedLayout>
              <MCUResultDetail />
            </ProtectedLayout>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;