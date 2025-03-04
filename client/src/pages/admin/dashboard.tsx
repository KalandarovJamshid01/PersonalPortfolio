import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Проверка аутентификации
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/auth/status"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      toast({
        title: "Успешный выход",
        description: "Вы вышли из системы",
      });
      setLocation("/admin/login");
    },
  });

  useEffect(() => {
    if (isError) {
      setLocation("/admin/login");
    }
  }, [isError, setLocation]);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Админ-панель</h1>
          <Button 
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Выход..." : "Выйти"}
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Сообщения</h2>
            <div className="border rounded-lg p-4">
              {/* Здесь будет список сообщений */}
              <p className="text-muted-foreground">Скоро будет доступно управление сообщениями</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Контент</h2>
            <div className="border rounded-lg p-4">
              {/* Здесь будет управление контентом */}
              <p className="text-muted-foreground">Скоро будет доступно управление контентом</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
