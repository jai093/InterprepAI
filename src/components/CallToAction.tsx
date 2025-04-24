
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <div className="bg-interprepai-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Land Your Dream Job?</h2>
          <p className="text-lg text-interprepai-100">
            Start practicing with our AI interviewer today and receive personalized feedback to improve your interview performance.
          </p>
          <Button className="bg-white text-interprepai-900 hover:bg-interprepai-100 text-lg py-6 px-8" asChild>
            <Link to="/simulation">Start Your First Practice Interview</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
