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
        <p className="text-2xl md:text-3xl font-semibold text-foreground/60 mb-4">Softy Software</p>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
          Цифровая Трансформация Бизнеса
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Автоматизация бизнес-процессов, интеграция с государственными системами и внедрение инновационных IT-решений для повышения эффективности вашего бизнеса
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" variant="default" asChild>
            <a href="#contact">Обсудить проект</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#services">Наши услуги</a>
          </Button>
        </div>
      </motion.div>
    </motion.section>
  );
}