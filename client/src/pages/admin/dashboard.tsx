import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Contact, Content, PageView } from "@shared/schema";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Check, Trash2, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Проверка аутентификации
  const { isLoading: authLoading, isError: authError } = useQuery({
    queryKey: ["/api/auth/status"],
    retry: false,
  });

  // Получение данных
  const { data: contacts, isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/admin/contacts"],
    retry: false,
  });

  const { data: content, isLoading: contentLoading } = useQuery<Content[]>({
    queryKey: ["/api/admin/content"],
    retry: false,
  });

  const { data: statistics, isLoading: statisticsLoading } = useQuery<PageView[]>({
    queryKey: ["/api/admin/statistics"],
    retry: false,
  });

  // Мутации
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

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      toast({
        title: "Готово",
        description: "Сообщение удалено",
      });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: string }) =>
      apiRequest("PATCH", `/api/admin/content/${id}`, { value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content"] });
      toast({
        title: "Готово",
        description: "Контент обновлен",
      });
    },
  });

  useEffect(() => {
    if (authError) {
      setLocation("/admin/login");
    }
  }, [authError, setLocation]);

  if (authLoading || contactsLoading || contentLoading || statisticsLoading) {
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
        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="messages">Сообщения</TabsTrigger>
            <TabsTrigger value="content">Контент</TabsTrigger>
            <TabsTrigger value="statistics">Статистика</TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Сообщения от пользователей</CardTitle>
                <CardDescription>
                  Управление сообщениями, полученными через форму обратной связи
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {contacts?.length === 0 ? (
                    <p className="py-4 text-muted-foreground">Нет новых сообщений</p>
                  ) : (
                    contacts?.map((contact) => (
                      <div key={contact.id} className="py-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{contact.name}</h3>
                            <p className="text-sm text-muted-foreground">{contact.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(contact.createdAt), "d MMMM yyyy, HH:mm", { locale: ru })}
                            </span>
                            <div className="flex gap-2">
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
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (window.confirm("Вы уверены, что хотите удалить это сообщение?")) {
                                    deleteContactMutation.mutate(contact.id);
                                  }
                                }}
                                disabled={deleteContactMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm">{contact.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Управление контентом</CardTitle>
                <CardDescription>
                  Редактирование текстового содержимого сайта
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {content?.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{item.section}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-muted-foreground capitalize">{item.key}</span>
                      </div>
                      {item.key === 'title' || item.key === 'subtitle' ? (
                        <Input
                          defaultValue={item.value}
                          onBlur={(e) => {
                            if (e.target.value !== item.value) {
                              updateContentMutation.mutate({
                                id: item.id,
                                value: e.target.value,
                              });
                            }
                          }}
                        />
                      ) : (
                        <Textarea
                          defaultValue={item.value}
                          onBlur={(e) => {
                            if (e.target.value !== item.value) {
                              updateContentMutation.mutate({
                                id: item.id,
                                value: e.target.value,
                              });
                            }
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle>Статистика посещений</CardTitle>
                <CardDescription>
                  Количество просмотров по разделам сайта
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics?.map((stat) => (
                    <div key={stat.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{stat.path}</span>
                      </div>
                      <span className="text-muted-foreground">{stat.count} просмотров</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}