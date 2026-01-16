import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const AnalyticsDashboard = () => {
  useEffect(() => {
    // Analytics dashboard page loaded
    console.log("Analytics Dashboard page loaded");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Analytics dashboard is available in a separate application.
          </p>
          <div className="bg-card border rounded-lg p-6">
            <p className="text-sm text-muted-foreground">
              The analytics dashboard is currently being set up. Please check back soon.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnalyticsDashboard;
