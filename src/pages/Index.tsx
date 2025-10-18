import React from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { TrendingProducts } from "@/components/TrendingProducts";
import { CategorySection } from "@/components/CategorySection";
import { BrandStory } from "@/components/BrandStory";
import { Testimonials } from "@/components/Testimonials";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";

const Index = () => {
  // Scroll to top when page loads
  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior
    });
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
      <Navbar />
      <HeroSection />
      <BrandStory />
      <TrendingProducts />
      <CategorySection />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
