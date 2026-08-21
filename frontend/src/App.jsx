import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import AuthenticatedLayout from './components/AuthenticatedLayout.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import CompaniesPage from './pages/CompaniesPage.jsx';
import CompanyDetailPage from './pages/CompanyDetailPage.jsx';
import ProblemsPage from './pages/ProblemsPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import BlogsPage from './pages/BlogsPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import UserBlogsPage from './pages/UserBlogsPage.jsx';
import AdminBlogsPage from './pages/AdminBlogsPage.jsx';
import ProblemPage from './pages/ProblemPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
          {/* Skip to content for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]
                       focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:font-semibold"
          >
            Skip to main content
          </a>

          <Navbar />

          <div className="flex-1">
            <Routes>
              {/* Public routes — no sidebar */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Content pages — sidebar shown when authenticated */}
              <Route path="/problems" element={
                <AuthenticatedLayout>
                  <ProblemsPage />
                </AuthenticatedLayout>
              } />
              <Route path="/problems/:id" element={
                <AuthenticatedLayout>
                  <ProblemPage />
                </AuthenticatedLayout>
              } />
              <Route path="/companies" element={
                <AuthenticatedLayout>
                  <CompaniesPage />
                </AuthenticatedLayout>
              } />
              <Route path="/companies/:slug/problems" element={
                <AuthenticatedLayout>
                  <CompanyDetailPage />
                </AuthenticatedLayout>
              } />
              
              {/* Blog Routes */}
              <Route path="/blogs" element={
                <AuthenticatedLayout>
                  <BlogsPage />
                </AuthenticatedLayout>
              } />
              <Route path="/blogs/:slug" element={
                <AuthenticatedLayout>
                  <BlogPage />
                </AuthenticatedLayout>
              } />
              <Route path="/my-blogs" element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <UserBlogsPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/topics" element={
                <AuthenticatedLayout>
                  <PlaceholderPage
                    title="Topics"
                    description="Practice problems organized by DSA topics — Arrays, Trees, DP, Graphs, and more."
                  />
                </AuthenticatedLayout>
              } />

              {/* Protected routes — always have sidebar */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <DashboardPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <SettingsPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AuthenticatedLayout>
                      <AdminPage />
                    </AuthenticatedLayout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/blogs"
                element={
                  <AdminRoute>
                    <AuthenticatedLayout>
                      <AdminBlogsPage />
                    </AuthenticatedLayout>
                  </AdminRoute>
                }
              />

              {/* Catch-all */}
              <Route
                path="*"
                element={
                  <PlaceholderPage
                    title="Page Not Found"
                    description="The page you're looking for doesn't exist."
                  />
                }
              />
            </Routes>
          </div>

          {/* Hide footer on dashboard, settings, and admin for more workspace */}
          <Routes>
            <Route path="/dashboard" element={null} />
            <Route path="/settings" element={null} />
            <Route path="/admin" element={null} />
            <Route path="/admin/blogs" element={null} />
            <Route path="*" element={<Footer />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
