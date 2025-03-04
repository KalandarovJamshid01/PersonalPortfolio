import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export function Hero() {
  return (
    <motion.section 
      className="min-h-[90vh] flex items-center justify-center text-center px-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Creative Solutions for Your Business
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Transforming ideas into exceptional digital experiences with modern web solutions and creative design
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <a href="#contact">Get in Touch</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#services">Our Services</a>
          </Button>
        </div>
      </motion.div>
    </motion.section>
  );
}
