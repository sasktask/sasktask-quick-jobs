import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NotificationPermissionPrompt } from "./components/NotificationPermissionPrompt";
import { AIAssistantWidget } from "./components/AIAssistantWidget";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SignIn from "./pages/SignIn";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import PostTask from "./pages/PostTask";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Bookings from "./pages/Bookings";
import TaskDetail from "./pages/TaskDetail";
import Verification from "./pages/Verification";
import FindTaskers from "./pages/FindTaskers";
import BecomeTasker from "./pages/BecomeTasker";
import HowItWorks from "./pages/HowItWorks";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import CookiePolicy from "./pages/CookiePolicy";
import AccessibilityStatement from "./pages/AccessibilityStatement";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import IndependentContractorAgreement from "./pages/IndependentContractorAgreement";
import SafetyGuidelines from "./pages/SafetyGuidelines";
import RefundPolicy from "./pages/RefundPolicy";
import CopyrightDMCA from "./pages/CopyrightDMCA";
import DisputeResolution from "./pages/DisputeResolution";
import SaskatchewanCompliance from "./pages/SaskatchewanCompliance";
import DisputePolicy from "./pages/DisputePolicy";
import TaxCompliance from "./pages/TaxCompliance";
import InsuranceRequirements from "./pages/InsuranceRequirements";
import Install from "./pages/Install";
import AdminVerification from "./pages/AdminVerification";
import AdminCertificates from "./pages/AdminCertificates";
import AdminDisputes from "./pages/AdminDisputes";
import AdminFraud from "./pages/AdminFraud";
import AdminUsers from "./pages/AdminUsers";
import AdminPayments from "./pages/AdminPayments";
import Analytics from "./pages/Analytics";
import ReferralProgram from "./pages/ReferralProgram";
import Achievements from "./pages/Achievements";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import RSSFeed from "./pages/RSSFeed";
import Sitemap from "./pages/Sitemap";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import Messages from "./pages/Messages";
import ChatRoom from "./pages/ChatRoom";
import MyTasks from "./pages/MyTasks";
import TaskEdit from "./pages/TaskEdit";
import Leaderboard from "./pages/Leaderboard";
import HelpCenter from "./pages/HelpCenter";
import MapView from "./pages/MapView";
import Payments from "./pages/Payments";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import Payouts from "./pages/Payouts";
import Checkout from "./pages/Checkout";
import Notifications from "./pages/Notifications";
import Services from "./pages/Services";
import ServicesHub from "./pages/ServicesHub";
import InstantWork from "./pages/InstantWork";
import CalendarPage from "./pages/Calendar";
import SignupStep1 from "./pages/signup/SignupStep1";
import SignupStep2 from "./pages/signup/SignupStep2";
import SignupStep3 from "./pages/signup/SignupStep3";
import SignupStep4 from "./pages/signup/SignupStep4";

import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminBackgroundChecks from "./pages/AdminBackgroundChecks";
import AdminTaxSettings from "./pages/AdminTaxSettings";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="sasktask-theme">
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <NotificationPermissionPrompt />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <MobileBottomNav />
              <AIAssistantWidget />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<Navigate to="/signup/step-1" replace />} />
                <Route path="/signup/step-1" element={<SignupStep1 />} />
                <Route path="/signup/step-2" element={<SignupStep2 />} />
                <Route path="/signup/step-3" element={<SignupStep3 />} />
                <Route path="/signup/step-4" element={<SignupStep4 />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="/accessibility" element={<AccessibilityStatement />} />
                <Route path="/community-guidelines" element={<CommunityGuidelines />} />
                <Route path="/contractor-agreement" element={<IndependentContractorAgreement />} />
                <Route path="/safety" element={<SafetyGuidelines />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/copyright" element={<CopyrightDMCA />} />
                <Route path="/dispute-resolution" element={<DisputeResolution />} />
                <Route path="/saskatchewan-compliance" element={<SaskatchewanCompliance />} />
                <Route path="/dispute-policy" element={<DisputePolicy />} />
                <Route path="/tax-compliance" element={<TaxCompliance />} />
                <Route path="/insurance-requirements" element={<InsuranceRequirements />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/rss.xml" element={<RSSFeed />} />
                <Route path="/sitemap.xml" element={<Sitemap />} />
                <Route path="/install" element={<Install />} />
                <Route path="/services" element={<Services />} />
                <Route path="/become-tasker" element={<BecomeTasker />} />
                <Route path="/install" element={<Install />} />

                {/* Protected routes - require authentication */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
                <Route path="/post-task" element={<ProtectedRoute><PostTask /></ProtectedRoute>} />
                <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile/:id" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
                <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                <Route path="/task/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
                <Route path="/tasks/:id/edit" element={<ProtectedRoute><TaskEdit /></ProtectedRoute>} />
                <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
                <Route path="/become-tasker" element={<ProtectedRoute><BecomeTasker /></ProtectedRoute>} />
                <Route path="/find-taskers" element={<ProtectedRoute><FindTaskers /></ProtectedRoute>} />
                <Route path="/how-it-works" element={<ProtectedRoute><HowItWorks /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
                <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
                <Route path="/admin/verify-users" element={<ProtectedRoute><AdminVerification /></ProtectedRoute>} />
                <Route path="/admin/certificates" element={<ProtectedRoute><AdminCertificates /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/disputes" element={<ProtectedRoute><AdminDisputes /></ProtectedRoute>} />
                <Route path="/admin/fraud" element={<ProtectedRoute><AdminFraud /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/payments" element={<ProtectedRoute><AdminPayments /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
                <Route path="/admin/background-checks" element={<ProtectedRoute><AdminBackgroundChecks /></ProtectedRoute>} />
                <Route path="/admin/tax-settings" element={<ProtectedRoute><AdminTaxSettings /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/referrals" element={<ProtectedRoute><ReferralProgram /></ProtectedRoute>} />
                <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/chat/:bookingId" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                <Route path="/payment-cancelled" element={<ProtectedRoute><PaymentCancelled /></ProtectedRoute>} />
                <Route path="/payouts" element={<ProtectedRoute><Payouts /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/instant-work" element={<ProtectedRoute><InstantWork /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/services-hub" element={<ProtectedRoute><ServicesHub /></ProtectedRoute>} />
                <Route path="/tiffin" element={<Navigate to="/browse?category=Tiffin+Services" replace />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
