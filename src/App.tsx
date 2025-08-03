
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import InterviewSimulation from "@/pages/InterviewSimulation";
import BatchCalls from "@/pages/BatchCalls";
import MeetupDetails from "@/pages/MeetupDetails";
import NotFound from "@/pages/NotFound";
import Meetups from "@/components/Meetups";
import "./App.css";
import HrDashboard from "./pages/HrDashboard";
import CandidateInterview from "./pages/CandidateInterview";
import InvitesPage from "./pages/hr/Invites";
import HRSettingsPage from "./pages/hr/Settings";
import HrAssessmentsPage from "./pages/hr/Assessments";
import HrProfilePage from "./pages/hr/Profile";
import InterviewReview from "./pages/hr/InterviewReview";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Candidate Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requireCandidate={true}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/interview" element={
        <ProtectedRoute requireCandidate={true}>
          <InterviewSimulation />
        </ProtectedRoute>
      } />
      <Route path="/simulation" element={
        <ProtectedRoute requireCandidate={true}>
          <InterviewSimulation />
        </ProtectedRoute>
      } />
      <Route path="/start-practice" element={
        <ProtectedRoute requireCandidate={true}>
          <InterviewSimulation />
        </ProtectedRoute>
      } />
      <Route path="/practice" element={
        <ProtectedRoute requireCandidate={true}>
          <InterviewSimulation />
        </ProtectedRoute>
      } />
      <Route path="/meetups" element={
        <ProtectedRoute>
          <Meetups />
        </ProtectedRoute>
      } />
      <Route path="/batch-calls" element={
        <ProtectedRoute>
          <BatchCalls />
        </ProtectedRoute>
      } />
      <Route path="/meetup/:id" element={
        <ProtectedRoute>
          <MeetupDetails />
        </ProtectedRoute>
      } />
      
      {/* HR Routes */}
      <Route path="/hr" element={
        <ProtectedRoute requireHR={true}>
          <HrDashboard />
        </ProtectedRoute>
      } />
      <Route path="/hr/invites" element={
        <ProtectedRoute requireHR={true}>
          <InvitesPage />
        </ProtectedRoute>
      } />
      <Route path="/hr/settings" element={
        <ProtectedRoute requireHR={true}>
          <HRSettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/hr/assessments" element={
        <ProtectedRoute requireHR={true}>
          <HrAssessmentsPage />
        </ProtectedRoute>
      } />
      <Route path="/hr/profile" element={
        <ProtectedRoute requireHR={true}>
          <HrProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/hr/interview-review/:inviteId" element={
        <ProtectedRoute requireHR={true}>
          <InterviewReview />
        </ProtectedRoute>
      } />
      
      {/* Public assessment interview route - no authentication required */}
      <Route path="/candidate-interview" element={<CandidateInterview />} />
      <Route path="/candidate-interview/:candidateId" element={
        <ProtectedRoute>
          <CandidateInterview />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
