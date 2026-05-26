# Student Module — Server API Reference for Client Implementation

Этот документ содержит полное описание REST API серверной части модулей **Student** и **Integrations** для реализации клиентского приложения (Web UI / Admin Panel).

---

## 1. Базовые соглашения

- **Base URL**: `/api`
- **Формат запроса/ответа**: JSON
- **Идентификация организации**: все ресурсы принадлежат организации, идентификатор передаётся в пути (`:orgId`)
- **Авторизация**: все эндпоинты требуют JWT-токен в заголовке `Authorization: Bearer <token>`
- **Валидация**: ошибки валидации возвращаются с HTTP-статусом `400 Bad Request` и телом `{ "message": [...], "error": "Bad Request", "statusCode": 400 }`

---

## 2. Модуль Student — Управление учениками

### 2.1 Полная ER-диаграмма (агрегат Student)

```
User (глобальная учётная запись)
  │
  ├── OrgMember (член организации)
  │
  └── Student (карточка ученика в организации)
        │
        ├── MemberExternalIdentity (связь с Telegram/Classroom/Discord)
        │
        ├── Enrollment (зачисление на учебную сессию) — Шаг 3
        │
        └── Practice (практики) — Шаг 3
```

**Важно**: `User` — «безликая» учётная запись (только email). Все анкетные данные ученика (`name`, `nameRu`, `city`, `country`) хранятся в **Student**, а не в User. Это сделано намеренно (ADR-5): администратор организации заполняет карточку ученика.

### 2.2 REST API эндпоинты

#### POST /api/organizations/:orgId/students
Создать нового студента в организации.

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",  // UUID существующего User
  "instrument": "Piano",                              // обязательное
  "specialization": "Classical",                      // обязательное
  "name": "Иван Петров",                              // обязательное
  "nameRu": "Иван",                                   // опционально
  "city": "Москва",                                   // опционально
  "country": "Россия",                                // опционально
  "gradebookNumber": "GR-2025-001"                    // обязательное, формат: буквы-цифры(-цифры)
}
```

**Response 201 Created:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "userId": "uuid",
  "instrument": "Piano",
  "specialization": "Classical",
  "name": "Иван Петров",
  "nameRu": "Иван",
  "city": "Москва",
  "country": "Россия",
  "gradebookNumber": "GR-2025-001",
  "enrolledAt": "2025-06-01T10:00:00.000Z"
}
```

**Ошибки:**
- `409 Conflict` — gradebookNumber уже существует в этой организации
- `409 Conflict` — userId уже зарегистрирован как студент в этой организации

---

#### GET /api/organizations/:orgId/students
Получить список всех студентов организации.

**Response 200 OK:**
```json
[
  {
    "id": "uuid",
    "organizationId": "uuid",
    "userId": "uuid",
    "instrument": "Piano",
    "specialization": "Classical",
    "name": "Иван Петров",
    "nameRu": "Иван",
    "city": "Москва",
    "country": "Россия",
    "gradebookNumber": "GR-2025-001",
    "enrolledAt": "2025-06-01T10:00:00.000Z"
  }
]
```

Сортировка: по `enrolledAt` (от новых к старым).

---

#### GET /api/organizations/:orgId/students/:id
Получить студента по ID.

**Response 200 OK:** (аналогично одному объекту из списка)
**Ошибки:** `404 Not Found`

---

#### PATCH /api/organizations/:orgId/students/:id
Обновить профиль студента (частичное обновление — все поля опциональны).

**Request Body:**
```json
{
  "instrument": "Violin",           // опционально
  "specialization": "Jazz",         // опционально
  "name": "Иван Смирнов",           // опционально
  "nameRu": "Иван",                 // опционально
  "city": "Санкт-Петербург",        // опционально
  "country": "Россия"               // опционально
}
```

**Response 200 OK:**
```json
{
  "id": "uuid",
  "name": "Иван Смирнов",
  "instrument": "Violin",
  "specialization": "Jazz",
  "city": "Санкт-Петербург",
  "country": "Россия"
}
```

**Ошибки:** `404 Not Found`

---

#### DELETE /api/organizations/:orgId/students/:id
Удалить студента.

**Response 204 No Content**
**Ошибки:** `404 Not Found`

---

#### GET /api/organizations/:orgId/students/by-external-id?provider=TELEGRAM&externalId=123456789
Найти студента по его внешнему идентификатору (Telegram, Classroom, Discord).

**Query Parameters:**
| Параметр | Тип | Описание |
|---|---|---|
| `provider` | string | Провайдер: `TELEGRAM`, `GOOGLE_CLASSROOM`, `MOODLE`, `DISCORD`, `WHATSAPP`, `ONE_C` |
| `externalId` | string | Идентификатор пользователя во внешней системе |

**Response 200 OK:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "userId": "uuid",
  "instrument": "Piano",
  "specialization": "Classical",
  "name": "Иван Петров",
  "nameRu": null,
  "city": null,
  "country": null,
  "gradebookNumber": "GR-2025-001",
  "enrolledAt": "2025-06-01T10:00:00.000Z"
}
```

**Response если не найден:**
```json
null
```

---

## 3. Модуль Integrations — Управление интеграциями

### 3.1 Модель данных

**OrgIntegrationConfig** — конфигурация подключения внешнего сервиса к организации:
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "provider": "TELEGRAM",
  "config": { "webhookUrl": "https://..." },
  "secrets": "зашифрованный токен",
  "isActive": true,
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-06-01T10:00:00.000Z"
}
```

**MemberExternalIdentity** — связь пользователя с внешним аккаунтом:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "organizationId": "uuid",
  "provider": "TELEGRAM",
  "externalId": "123456789",
  "meta": { "username": "ivan_bot" },
  "createdAt": "2025-06-01T10:00:00.000Z"
}
```

### 3.2 REST API эндпоинты

#### POST /api/organizations/:orgId/integrations
Создать или обновить конфигурацию интеграции.

**Request Body:**
```json
{
  "provider": "TELEGRAM",                     // обязательное
  "config": { "webhookUrl": "https://..." },  // обязательное, объект
  "secrets": "bot-token-123",                 // опционально
  "isActive": true                            // опционально, по умолчанию true
}
```

**Response 201 Created:**
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "provider": "TELEGRAM",
  "isActive": true,
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-06-01T10:00:00.000Z"
}
```

**Логика**: Если конфигурация для данного провайдера в организации уже существует — она обновляется (upsert). Если нет — создаётся новая.

---

#### GET /api/organizations/:orgId/integrations
Получить список всех интеграций организации.

**Response 200 OK:**
```json
[
  {
    "id": "uuid",
    "organizationId": "uuid",
    "provider": "TELEGRAM",
    "isActive": true,
    "createdAt": "2025-06-01T10:00:00.000Z",
    "updatedAt": "2025-06-01T10:00:00.000Z"
  }
]
```

---

#### DELETE /api/organizations/:orgId/integrations/:id
Удалить конфигурацию интеграции.

**Response 204 No Content**
**Ошибки:** `404 Not Found`

---

#### POST /api/organizations/:orgId/identities
Привязать внешний аккаунт к пользователю.

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",  // UUID существующего User
  "provider": "TELEGRAM",                             // обязательное
  "externalId": "123456789",                          // обязательное
  "meta": { "username": "ivan_bot" }                  // опционально
}
```

**Response 201 Created:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "organizationId": "uuid",
  "provider": "TELEGRAM",
  "externalId": "123456789",
  "meta": { "username": "ivan_bot" },
  "createdAt": "2025-06-01T10:00:00.000Z"
}
```

**Ошибки:**
- `409 Conflict` — данный externalId уже привязан к другому пользователю в этой организации

---

#### DELETE /api/organizations/:orgId/identities/:id
Отвязать внешний аккаунт.

**Response 204 No Content**
**Ошибки:** `404 Not Explicit`

---

## 4. Типы данных для клиента (TypeScript)

```typescript
// ───── Student ─────

interface Student {
  id: string;
  organizationId: string;
  userId: string;
  instrument: string;
  specialization: string;
  name: string;
  nameRu: string | null;
  city: string | null;
  country: string | null;
  gradebookNumber: string;
  enrolledAt: string; // ISO 8601
}

interface CreateStudentRequest {
  userId: string;
  instrument: string;
  specialization: string;
  name: string;
  nameRu?: string;
  city?: string;
  country?: string;
  gradebookNumber: string;
}

interface UpdateStudentProfileRequest {
  instrument?: string;
  specialization?: string;
  name?: string;
  nameRu?: string | null;
  city?: string | null;
  country?: string | null;
}

interface FindByExternalIdQuery {
  provider: string;   // "TELEGRAM" | "GOOGLE_CLASSROOM" | "MOODLE" | "DISCORD" | "WHATSAPP" | "ONE_C"
  externalId: string;
}

// ───── Integrations ─────

interface IntegrationConfig {
  id: string;
  organizationId: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SaveIntegrationConfigRequest {
  provider: string;
  config: Record<string, unknown>;
  secrets?: string;
  isActive?: boolean;
}

interface ExternalIdentity {
  id: string;
  userId: string;
  organizationId: string;
  provider: string;
  externalId: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

interface BindExternalIdentityRequest {
  userId: string;
  provider: string;
  externalId: string;
  meta?: Record<string, unknown>;
}
```

---

## 5. Рекомендации по реализации клиента

### 5.1 Навигация по маршрутам (UI)

```
/orgs/:orgId/students                    → список студентов
/orgs/:orgId/students/new                → форма создания студента
/orgs/:orgId/students/:id                → профиль студента
/orgs/:orgId/students/:id/edit           → редактирование студента
/orgs/:orgId/integrations                → список интеграций
/orgs/:orgId/integrations/new            → добавление интеграции
/orgs/:orgId/identities                  → управление привязками аккаунтов
```

### 5.2 Валидация на стороне клиента

Поля `name`, `instrument`, `specialization`, `gradebookNumber` — обязательные, непустые.
`gradebookNumber` — формат `буквы-цифры` (например: `GR-2025-001`, `АБ-1234`).
`userId` — UUID v4.

### 5.3 Важные архитектурные заметки

1. **User «безликий»**: При создании студента клиент должен сначала создать `User` (через модуль регистрации/приглашения), получить `userId`, и только потом создавать `Student` с этим `userId`.
2. **Один User — много Student**: Один глобальный `User` может быть студентом в разных организациях. Каждый раз создаётся отдельный `Student`.
3. **ExternalId уникален в рамках организации**: Нельзя привязать один Telegram ID к двум разным пользователям в одной организации.
4. **Организационный контекст**: Все ресурсы привязаны к `:orgId`. Клиент должен всегда передавать ID текущей организации.
