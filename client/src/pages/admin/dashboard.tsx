import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Contact } from "@shared/schema";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Check } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Проверка аутентификации
  const { isLoading: authLoading, isError: authError } = useQuery({
    queryKey: ["/api/auth/status"],
    retry: false,
  });

  // Получение списка сообщений
  const { data: contacts, isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
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

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/admin/contacts/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      toast({
        title: "Готово",
        description: "Сообщение отмечено как прочитанное",
      });
    },
  });

  useEffect(() => {
    if (authError) {
      setLocation("/admin/login");
    }
  }, [authError, setLocation]);

  if (authLoading || contactsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
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
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">Сообщения от пользователей</h2>
            <div className="border rounded-lg divide-y">
              {contacts?.length === 0 ? (
                <p className="p-4 text-muted-foreground">Нет новых сообщений</p>
              ) : (
                contacts?.map((contact) => (
                  <div key={contact.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{contact.name}</h3>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(contact.createdAt), "d MMMM yyyy, HH:mm", { locale: ru })}
                        </span>
                        {!contact.isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsReadMutation.mutate(contact.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Прочитано
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm">{contact.message}</p>
                  </div>
                ))
              )}
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