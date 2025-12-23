import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'sonner'

// Context Providers
import { CartProvider } from './context/CartContext'

// User Pages
import UserLogin from './components/UserLogin'
import UserSignup from './components/UserSignup'
import Dashboard from './components/Dashboard'
import MenuPage from './components/MenuPage'
import Profile from './components/Profile'
import TrackOrder from './components/TrackOrder'  // ✅ NEW

// Google OAuth Client ID from environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            {/* Toast Notifications */}
            <Toaster position="top-right" richColors />

            {/* Routes */}
            <Routes>
              {/* Public Routes - Anyone can access */}
              <Route path="/login" element={<UserLogin />} />
              <Route path="/signup" element={<UserSignup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/track-order" element={<TrackOrder />} />  {/* ✅ NEW */}

              {/* Default route - Redirect to dashboard (no login required) */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Catch all - Redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </GoogleOAuthProvider>
  )
}

export default App