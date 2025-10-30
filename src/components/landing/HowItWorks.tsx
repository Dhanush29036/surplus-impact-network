import { Upload, BrainCircuit, Truck, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";

const steps = [
  {
    icon: Upload,
    title: "Upload Surplus",
    description: "Donors upload photos of surplus items - food, clothes, books, hygiene kits, or devices",
    color: "text-primary",
  },
  {
    icon: BrainCircuit,
    title: "AI Classification",
    description: "Our AI instantly classifies items, checks freshness, and matches them with community needs",
    color: "text-secondary",
  },
  {
    icon: Truck,
    title: "Smart Logistics",
    description: "Automated scheduling connects donors with volunteers for efficient pickup and delivery",
    color: "text-accent",
  },
  {
    icon: Heart,
    title: "Impact Delivered",
    description: "Resources reach communities in need with full transparency and tracking",
    color: "text-primary",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How HUSON Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From surplus to social impact in four intelligent steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-glow transition-smooth">
              <div className="mb-4 flex justify-center">
                <div className={`${step.color} bg-current/10 p-4 rounded-full`}>
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-muted-foreground mb-2">
                Step {index + 1}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;