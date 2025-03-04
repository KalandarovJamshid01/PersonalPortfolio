import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceCard } from "@/components/ui/service-card";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";
import { Palette, Code, LineChart } from "lucide-react";

export function Services() {
  return (
    <section id="services" className="py-20 bg-muted/30 px-4">
      <div className="container mx-auto">
        <SectionHeading 
          title="Our Services" 
          subtitle="Comprehensive solutions for your digital needs"
        />
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <ServiceCard 
            Icon={Palette}
            title="Web Design"
            description="Beautiful, responsive websites that engage your audience and reflect your brand identity."
          />
          <ServiceCard 
            Icon={Code}
            title="Development"
            description="Custom web applications built with modern technologies and best practices."
          />
          <ServiceCard 
            Icon={LineChart}
            title="Digital Strategy"
            description="Strategic planning and optimization to maximize your online presence and growth."
          />
        </motion.div>
      </div>
    </section>
  );
}
