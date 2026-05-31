import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.scss'
import LoginPage from './pages/loginPage.jsx'
import SignUpPage from './pages/signupPage.jsx'
import ForgotPasswordPage from './pages/forgotpasswordPage.jsx'
import DashboardPage from './pages/dashboardPage.jsx'
import AdminDashboardPage from './pages/admindashboardPage.jsx'
import AdminJobFormPage from './pages/adminjobformPage.jsx'
import TrackingPage from './pages/trackingPage.jsx'
import ProfilePage from './pages/profilePage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<Navigate to="/login" replace />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/signup"          element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard"       element={<DashboardPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/add-job"      element={<AdminJobFormPage />} />
        <Route path="/admin/edit-job/:id" element={<AdminJobFormPage />} />
        <Route path="/tracking"        element={<TrackingPage />} />
        <Route path="/profile"         element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}
