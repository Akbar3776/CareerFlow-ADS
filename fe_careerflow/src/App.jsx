import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.scss'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AdminDashboardPage from './pages/admindashboardPage.jsx'
import adminjobformpage from './pages/adminjobformPage.jsx'

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
        <Route path="/admin/job-form"  element={<AdminJobFormPage />} />
      </Routes>
    </BrowserRouter>
  )
}
