import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NotificationPermissionPrompt } from "./components/NotificationPermissionPrompt";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
import Install from "./pages/Install";
import AdminVerification from "./pages/AdminVerification";
import AdminBlog from "./pages/AdminBlog";
import AdminDisputes from "./pages/AdminDisputes";
import AdminFraud from "./pages/AdminFraud";
import Analytics from "./pages/Analytics";
import ReferralProgram from "./pages/ReferralProgram";
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

import AdminDashboard from "./pages/AdminDashboard";
import { ChatButton } from "./components/ChatButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="sasktask-theme">
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationPermissionPrompt />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ChatButton />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/post-task" element={<PostTask />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<PublicProfile />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/task/:id" element={<TaskDetail />} />
            <Route path="/tasks/:id/edit" element={<TaskEdit />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/find-taskers" element={<FindTaskers />} />
            <Route path="/become-tasker" element={<BecomeTasker />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/install" element={<Install />} />
            <Route path="/admin/verify-users" element={<AdminVerification />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
          <Route path="/admin/fraud" element={<AdminFraud />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/referrals" element={<ReferralProgram />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/rss.xml" element={<RSSFeed />} />
            <Route path="/sitemap.xml" element={<Sitemap />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/account" element={<Account />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:bookingId" element={<ChatRoom />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
