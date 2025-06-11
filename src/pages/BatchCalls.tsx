
import Header from "@/components/Header";
import BatchCallManager from "@/components/BatchCallManager";

const BatchCalls = () => {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">ElevenLabs Batch Calls</h1>
          <p className="text-gray-600 mt-1">
            Manage automated interview calls with ElevenLabs voice synthesis
          </p>
        </div>

        <BatchCallManager />
      </div>
    </div>
  );
};

export default BatchCalls;
