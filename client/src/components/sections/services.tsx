import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceCard } from "@/components/ui/service-card";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";
import { Bot, Network, Binary, Lock, CodeSquare, Building2, Headphones } from "lucide-react";

export function Services() {
  return (
    <section id="services" className="py-20 bg-muted/30 px-4">
      <div className="container mx-auto">
        <SectionHeading 
          title="Наши Услуги" 
          subtitle="Комплексные решения для цифровой трансформации"
        />
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <ServiceCard 
            Icon={Binary}
            title="Автоматизация процессов"
            description="Разработка и внедрение решений для оптимизации работы компании и минимизации человеческого фактора"
          />
          <ServiceCard 
            Icon={Building2}
            title="Интеграция с госсистемами"
            description="Подключение к государственным информационным системам для упрощения документооборота и отчетности"
          />
          <ServiceCard 
            Icon={Network}
            title="Цифровизация бизнеса"
            description="Создание и внедрение IT-решений для перехода на цифровые процессы и повышения эффективности"
          />
          <ServiceCard 
            Icon={Bot}
            title="Искусственный интеллект"
            description="Внедрение AI-алгоритмов для аналитики данных и автоматизированного принятия решений"
          />
          <ServiceCard 
            Icon={CodeSquare}
            title="Разработка API"
            description="Создание надежных API для бесшовного взаимодействия между различными бизнес-системами"
          />
          <ServiceCard 
            Icon={Lock}
            title="Кибербезопасность"
            description="Обеспечение безопасности цифровых активов и защита информации от утечек и кибератак"
          />
        </motion.div>
      </div>
    </section>
  );
}