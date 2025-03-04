import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="py-8 px-4">
      <div className="container mx-auto">
        <Separator className="mb-8" />
        <div className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Softy Software. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}