import { Profile } from "@/components/Profile";

const Dashboard = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <Profile />
    </div>
  );
};

export default Dashboard;
