
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative bg-gradient-to-b from-white to-blue-50 pt-24 pb-12 md:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Ace Your Next Interview with <span className="gradient-text">AI-Powered</span> Practice
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Get personalized feedback on your interview skills with real-time analysis of your responses, body language, and voice tone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="bg-interprepai-700 hover:bg-interprepai-800 transition-colors text-lg py-6 px-8" asChild>
                <Link to="/simulation">Start Practicing</Link>
              </Button>
              <Button variant="outline" className="border-interprepai-300 text-interprepai-700 hover:bg-interprepai-50 transition-colors text-lg py-6 px-8">
                Learn More
              </Button>
            </div>
            <div className="text-sm text-gray-500 flex items-center justify-center lg:justify-start gap-4 pt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                ))}
              </div>
              <span>Join 10,000+ job seekers already using InterprepAI</span>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="aspect-video bg-white p-2 rounded-xl shadow-2xl shadow-blue-200/50 border border-blue-100 overflow-hidden">
              <div className="bg-interprepai-50 rounded-lg h-full w-full flex items-center justify-center">
                <div className="text-interprepai-700 text-xl font-medium">Interview Simulation Preview</div>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-5 bg-interprepai-100 p-3 rounded-lg border border-interprepai-200 shadow-lg">
              <div className="text-sm font-medium text-interprepai-800">Real-time Feedback</div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-interprepai-600 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
