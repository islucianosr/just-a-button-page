import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NewSearch from "./pages/NewSearch";
import UploadXML from "./pages/UploadXML";
import Results from "./pages/Results";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Pipeline from "./pages/Pipeline";
import Quiz from "./pages/Quiz";
import ResetPassword from "./pages/ResetPassword";
import SearchLogs from "./pages/SearchLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/new-search" element={<NewSearch />} />
          <Route path="/upload-xml" element={<UploadXML />} />
          <Route path="/results" element={<Results />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/logs" element={<SearchLogs />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
