import { SectionHeading } from "@/components/ui/section-heading";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

export function About() {
  return (
    <section id="about" className="py-20 px-4">
      <div className="container mx-auto">
        <SectionHeading 
          title="О Компании" 
          subtitle="Ваш надежный партнер в цифровой трансформации"
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
              src="https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?auto=format&fit=crop&w=800"
              alt="Цифровая трансформация бизнеса"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <p className="text-lg">
              Мы специализируемся на разработке и внедрении комплексных решений для автоматизации бизнес-процессов и цифровой трансформации компаний.
            </p>
            <p className="text-lg">
              Наша команда экспертов помогает бизнесу оптимизировать операционную деятельность, внедрять инновационные технологии и повышать эффективность работы.
            </p>
            <p className="text-lg">
              С нами вы получаете не просто IT-решения, а надежного партнера, который поможет вашему бизнесу успешно пройти путь цифровой трансформации.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}