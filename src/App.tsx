import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import UserDashboard from "./pages/UserDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import SellerRegisterPage from "./pages/SellerRegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSellerDetailsPage from "./pages/AdminSellerDetailsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/layout/ScrollToTop";

const queryClient = new QueryClient();

/**
 * Helper component to protect routes based on User Role
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles: Array<'user' | 'seller' | 'admin'> 
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If the user's role is not authorized for this specific route
  if (!allowedRoles.includes(user.role)) {
    // Determine where to send them based on who they actually are
    const redirectPath = 
      user.role === 'admin' ? '/admin' : 
      user.role === 'seller' ? '/seller' : 
      '/dashboard';
      
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/property/:id" element={<PropertyDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />

            {/* Standard User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            } />

            {/* Seller Specific Routes */}
            <Route path="/seller" element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller/register" element={<SellerRegisterPage />} />

            {/* Admin Specific Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/seller/:id" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSellerDetailsPage />
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
