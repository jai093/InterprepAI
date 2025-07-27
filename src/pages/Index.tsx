
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureCard from "@/components/FeatureCard";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  const { user, isHR, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!isLoading && user) {
      if (isHR) {
        navigate("/hr");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, isHR, isLoading, navigate]);

  // Don't render the landing page if user is authenticated
  if (!isLoading && user) {
    return null;
  }

  // Icons for feature cards
  const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );

  const AnalyticsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );

  const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  );

  const AIIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      
      <main className="flex-grow pt-16">
        <Hero />
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features to Boost Your Interview Skills</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our platform combines advanced AI technologies to provide comprehensive feedback on all aspects of your interview performance.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<VideoIcon />}
                title="Video Analysis"
                description="Our AI analyzes your facial expressions and body language to provide feedback on your non-verbal communication."
              />
              <FeatureCard 
                icon={<MicIcon />}
                title="Voice Tone Analysis"
                description="Receive insights on your speaking pace, tone variations, and vocal clarity to improve your verbal delivery."
              />
              <FeatureCard 
                icon={<AIIcon />}
                title="AI Interviewer"
                description="Practice with our realistic AI interviewer that asks industry-specific questions tailored to your target role."
              />
              <FeatureCard 
                icon={<AnalyticsIcon />}
                title="Detailed Reports"
                description="Get comprehensive feedback reports with actionable tips to improve your interview performance over time."
              />
            </div>
            
            {/* How It Works */}
            <div className="mt-24">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">How InterprepAI Works</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Our platform makes interview preparation simple, effective, and personalized.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-interprepai-100 text-interprepai-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                  <h3 className="text-xl font-bold mb-2">Select Your Interview Type</h3>
                  <p className="text-gray-600">Choose from various interview formats including behavioral, technical, or role-specific.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-interprepai-100 text-interprepai-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                  <h3 className="text-xl font-bold mb-2">Practice with AI Interviewer</h3>
                  <p className="text-gray-600">Engage in a realistic interview simulation with our AI-powered virtual interviewer.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-interprepai-100 text-interprepai-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                  <h3 className="text-xl font-bold mb-2">Get Detailed Feedback</h3>
                  <p className="text-gray-600">Receive comprehensive analysis and actionable tips to improve your performance.</p>
                </div>
              </div>
            </div>
            
            {/* Testimonials Section */}
            <div className="mt-24">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    quote: "InterprepAI helped me identify speaking patterns I wasn't aware of. After just a few practice sessions, I felt much more confident in my actual interview.",
                    author: "Sarah K.",
                    role: "Software Engineer"
                  },
                  {
                    quote: "The feedback on my body language was eye-opening. I secured a job offer after improving the areas InterprepAI highlighted.",
                    author: "Michael T.",
                    role: "Marketing Manager"
                  },
                  {
                    quote: "As someone who gets nervous during interviews, practicing with InterprepAI made a huge difference. The AI interviewer feels surprisingly realistic!",
                    author: "Jessica L.",
                    role: "Data Analyst"
                  }
                ].map((testimonial, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center mb-4">
                      <svg className="h-5 w-5 text-interprepai-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.5 19.5c-1.41 0-2.73-.67-3.54-1.8C.15 16.56-.11 15.12.06 13.7.83 7.07 6.32 1.88 13.25.38c.29-.06.6.08.78.34.18.26.19.6.01.88l-1.69 2.55c-.15.22-.41.36-.68.36-.85.01-2.64.85-3.77 2.25-.65.81-1.29 2.06-1.29 3.75 0 2.07 1.68 3.75 3.75 3.75.34 0 .68-.04 1-.13v2.25c-1.19.18-1.36.27-2.25.27M19.5 19.5c-1.41 0-2.73-.67-3.54-1.8-.81-1.14-1.07-2.58-.9-4 .77-6.63 6.26-11.82 13.19-13.32.29-.06.6.08.78.34.18.26.19.6.01.88l-1.69 2.55c-.15.22-.41.36-.68.36-.85.01-2.64.85-3.77 2.25-.65.81-1.29 2.06-1.29 3.75 0 2.07 1.68 3.75 3.75 3.75.34 0 .68-.04 1-.13v2.25c-1.19.18-1.86.27-2.75.27"></path>
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-4">{testimonial.quote}</p>
                    <div>
                      <p className="font-bold">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        <CallToAction />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
