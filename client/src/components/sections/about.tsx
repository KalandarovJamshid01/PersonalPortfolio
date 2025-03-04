import { SectionHeading } from "@/components/ui/section-heading";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

export function About() {
  return (
    <section id="about" className="py-20 px-4">
      <div className="container mx-auto">
        <SectionHeading 
          title="About Us" 
          subtitle="Passionate about creating impactful digital solutions"
        />
        <motion.div 
          className="grid md:grid-cols-2 gap-12 items-center"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div>
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800"
              alt="Team working together"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <p className="text-lg">
              We specialize in crafting beautiful and functional websites that help businesses grow and succeed in the digital world.
            </p>
            <p className="text-lg">
              With years of experience in web development and design, we understand what it takes to create online experiences that engage and convert.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
