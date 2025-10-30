import Hero from "@/components/landing/Hero";
import Mission from "@/components/landing/Mission";
import HowItWorks from "@/components/landing/HowItWorks";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Mission />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;