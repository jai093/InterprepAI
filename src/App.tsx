
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/interview" element={<InterviewSimulation />} />
      <Route path="/start-practice" element={<InterviewSimulation />} />
      <Route path="/practice" element={<InterviewSimulation />} />
      <Route path="/meetups" element={<Meetups />} />
      <Route path="/batch-calls" element={<BatchCalls />} />
      <Route path="/meetup/:id" element={<MeetupDetails />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
