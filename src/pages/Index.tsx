import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { TrendingProducts } from "@/components/TrendingProducts";
import { CategorySection } from "@/components/CategorySection";
import { BrandStory } from "@/components/BrandStory";
import { Testimonials } from "@/components/Testimonials";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
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
