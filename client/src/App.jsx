import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

// Layout Components
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { DeveloperRoute } from './components/DeveloperRoute.jsx';

// Pages
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { ForgotPage } from './pages/ForgotPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { PracticePage } from './pages/PracticePage.jsx';
import { SubscriptionPage } from './pages/SubscriptionPage.jsx';
import { PaymentPage } from './pages/PaymentPage.jsx';
import { UserPaymentsPage } from './pages/UserPaymentsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { LeaderboardPage } from './pages/LeaderboardPage.jsx';
import { MultiplayerPage } from './pages/MultiplayerPage.jsx';

// Developer Pages
import { DeveloperLoginPage } from './pages/developer/DeveloperLoginPage.jsx';
import { DeveloperRegisterPage } from './pages/developer/DeveloperRegisterPage.jsx';
import { DeveloperDashboardPage } from './pages/developer/DeveloperDashboardPage.jsx';
import { DeveloperPaymentsPage } from './pages/developer/DeveloperPaymentsPage.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot" element={<ForgotPage />} />
                  <Route path="/practice" element={<PracticePage />} />
                  <Route path="/multiplayer" element={<MultiplayerPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/subscription" element={<SubscriptionPage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                  {/* Protected User Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment"
                    element={
                      <ProtectedRoute>
                        <PaymentPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payments"
                    element={
                      <ProtectedRoute>
                        <UserPaymentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Developer Portal Routes */}
                  <Route path="/developer/login" element={<DeveloperLoginPage />} />
                  <Route path="/developer/register" element={<DeveloperRegisterPage />} />
                  <Route
                    path="/developer/dashboard"
                    element={
                      <DeveloperRoute>
                        <DeveloperDashboardPage />
                      </DeveloperRoute>
                    }
                  />
                  <Route
                    path="/developer/payments"
                    element={
                      <DeveloperRoute>
                        <DeveloperPaymentsPage />
                      </DeveloperRoute>
                    }
                  />

                  {/* Catch-all Redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
