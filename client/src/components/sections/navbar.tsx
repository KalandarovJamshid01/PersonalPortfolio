import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <div className="hidden md:flex gap-8">
            <a href="#about" className="text-foreground/80 hover:text-foreground transition-colors">О нас</a>
            <a href="#services" className="text-foreground/80 hover:text-foreground transition-colors">Услуги</a>
            <a href="#contact" className="text-foreground/80 hover:text-foreground transition-colors">Контакты</a>
          </div>
          <Button variant="outline" asChild>
            <a href="#contact">Связаться</a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
