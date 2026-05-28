export interface SendTelegramBroadcastRequestDto {
  userIds: string[]; // Массив UUID пользователей (НЕ студентов, а их userId)
  text: string; // Текст сообщения (HTML)
}

export interface SendTelegramBroadcastResponseDto {
  success: boolean; // Успешность постановки задачи в очередь
  sentCount: number; // Количество студентов, у которых найден привязанный TG
  totalRequested: number; // Сколько студентов было изначально выделено в UI
  message?: string; // Поясняющий текст от сервера
}
