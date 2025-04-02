import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img 
      src="/assets/softy-1.jpg"
      alt="Softy Software"
      className={cn("h-8 w-auto", className)}
    />
  );
}