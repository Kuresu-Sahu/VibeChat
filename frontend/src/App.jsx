import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import ProfilePage from './pages/ProfilePage'
import { Toaster } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext.jsx';

const App = () => {
  const { authUser } = useContext(AuthContext);
  return (
    // Use min-h-screen so the background fills the viewport height,
    // use bg-cover to scale the image while preserving aspect ratio,
    // center it and avoid repeating. For mobile you can override with a smaller image.
    <div className="min-h-screen bg-[url('./src/assets/bgImage.jpg')] bg-cover bg-center bg-no-repeat">
      <Toaster />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/verify" element={!authUser ? <VerifyOtpPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App
