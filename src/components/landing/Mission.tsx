import { Card } from "@/components/ui/card";
import { Target, TrendingUp, Shield } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Purpose-Driven",
    description: "Every donation creates measurable social impact in underserved communities",
  },
  {
    icon: TrendingUp,
    title: "AI-Powered",
    description: "Smart matching algorithms ensure resources reach those who need them most",
  },
  {
    icon: Shield,
    title: "Transparent",
    description: "Full traceability from donation to delivery with blockchain-inspired tracking",
  },
];

const Mission = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Mission</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            HUSON — Holistic Urban Surplus Optimization Network — bridges the gap between abundance and need, 
            using technology to create a more equitable and sustainable future
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {values.map((value, index) => (
            <Card key={index} className="p-8 text-center hover:shadow-glow transition-smooth">
              <div className="mb-4 flex justify-center">
                <div className="bg-gradient-hero p-4 rounded-full">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Mission;