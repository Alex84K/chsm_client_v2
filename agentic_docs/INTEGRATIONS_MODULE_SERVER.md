# Integrations Module — Server API Reference for Client Implementation

Этот документ содержит полное описание REST API серверной части модуля **Integrations** для реализации клиентского приложения (Web UI / Admin Panel).

Модуль Integrations отвечает за управление подключениями к внешним сервисам (Telegram, Google Classroom, Moodle, Discord, WhatsApp, 1C) и привязку учётных записей пользователей к их аккаунтам во внешних системах.

---

## 1. Базовые соглашения

- **Base URL**: `/api`
- **Формат запроса/ответа**: JSON
- **Идентификация организации**: все ресурсы принадлежат организации, идентификатор передаётся в пути (`:orgId`)
- **Авторизация**: все эндпоинты требуют JWT-токен в заголовке `Authorization: Bearer <token>`
- **Валидация**: ошибки валидации возвращаются с HTTP-статусом `400 Bad Request` и телом:
  ```json
  { "message": ["property cannot be empty"], "error": "Bad Request", "statusCode": 400 }
  ```

---

## 2. ER-диаграмма модуля

```
Organization (организация)
  │
  ├── OrgIntegrationConfig (1..N) — настройки подключения внешнего сервиса
  │     └── provider: TELEGRAM | GOOGLE_CLASSROOM | MOODLE | DISCORD | WHATSAPP | ONE_C
  │     └── config: Json (webhooks, course mappings)
  │     └── secrets: зашифрованные токены
  │     └── isActive: boolean
  │
  User (глобальная учётная запись)
  │
  └── MemberExternalIdentity (0..N) — связка User ↔ ВнешнийАккаунт
        └── provider: string (например "TELEGRAM")
        └── externalId: string (например telegram_id)
        └── meta: Json? (username, avatar URL)
```

### Ключевые ограничения (бизнес-правила):
1. **Организация — Провайдер = уникально**: Нельзя создать две конфигурации TELEGRAM для одной организации
2. **Организация — Провайдер — ExternalId = уникально**: Нельзя привязать один Telegram ID к двум разным пользователям в одной организации

---

## 3. REST API эндпоинты

### 3.1 Управление конфигурациями интеграций (`/integrations`)

#### POST /api/organizations/:orgId/integrations
Создать новую или обновить существующую конфигурацию интеграции.

**HTTP-статус**: `201 Created`

**Request Body:**
```json
{
  "provider": "TELEGRAM",
  "config": {
    "webhookUrl": "https://example.com/telegram-webhook",
    "allowedUpdates": ["message", "callback_query"]
  },
  "secrets": "bot_token_12345",
  "isActive": true
}
```

**Поля:**

| Поле | Тип | Обязательное | Описание |
|---|---|---|---|
| `provider` | string | да | Один из: `TELEGRAM`, `GOOGLE_CLASSROOM`, `MOODLE`, `DISCORD`, `WHATSAPP`, `ONE_C` |
| `config` | object | да | Произвольные настройки (webhooks, сопоставления курсов, и т.д.) |
| `secrets` | string | нет | Зашифрованные токены и ключи API (не возвращаются в GET-запросах) |
| `isActive` | boolean | нет | Активна ли интеграция. По умолчанию `true` |

**Response 201 Created:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "organizationId": "660e8400-e29b-41d4-a716-446655440001",
  "provider": "TELEGRAM",
  "isActive": true,
  "createdAt": "2025-06-01T10:00:00.000Z",
  "updatedAt": "2025-06-01T10:00:00.000Z"
}
```

**Логика на сервере:**
- Если конфигурация для `provider` + `organizationId` уже существует — она **обновляется** (upsert)
- Если нет — создаётся новая

**Ошибки:**
- `400 Bad Request` — неверный провайдер, пустые поля
- `409 Conflict` — (невозможно, т.к. сервер обновляет существующую)

---

#### GET /api/organizations/:orgId/integrations
Получить список всех конфигураций интеграций организации.

**HTTP-статус**: `200 OK`

**Response 200 OK:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "organizationId": "660e8400-e29b-41d4-a716-446655440001",
    "provider": "TELEGRAM",
    "isActive": true,
    "createdAt": "2025-06-01T10:00:00.000Z",
    "updatedAt": "2025-06-01T12:00:00.000Z"
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "organizationId": "660e8400-e29b-41d4-a716-446655440001",
    "provider": "GOOGLE_CLASSROOM",
    "isActive": false,
    "createdAt": "2025-06-02T10:00:00.000Z",
    "updatedAt": "2025-06-02T10:00:00.000Z"
  }
]
```

**Примечание**: Поле `secrets` не возвращается в ответе GET — это конфиденциальные данные.

---

#### DELETE /api/organizations/:orgId/integrations/:id
Удалить конфигурацию интеграции.

**HTTP-статус**: `204 No Content`

**Ошибки:**
- `404 Not Found` — конфигурация с указанным ID не существует

---

### 3.2 Управление внешними идентификаторами (`/identities`)

#### POST /api/organizations/:orgId/identities
Привязать внешний аккаунт пользователя к его учётной записи в системе.

**HTTP-статус**: `201 Created`

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "provider": "TELEGRAM",
  "externalId": "123456789",
  "meta": {
    "username": "ivan_bot",
    "firstName": "Иван",
    "lastName": "Петров"
  }
}
```

**Поля:**

| Поле | Тип | Обязательное | Описание |
|---|---|---|---|
| `userId` | UUID | да | ID существующего пользователя в системе |
| `provider` | string | да | Провайдер (`TELEGRAM`, `GOOGLE_CLASSROOM`, и т.д.) |
| `externalId` | string | да | Идентификатор пользователя во внешней системе |
| `meta` | object | нет | Произвольные мета-данные (username, аватар, и т.д.) |

**Response 201 Created:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "organizationId": "660e8400-e29b-41d4-a716-446655440001",
  "provider": "TELEGRAM",
  "externalId": "123456789",
  "meta": {
    "username": "ivan_bot",
    "firstName": "Иван",
    "lastName": "Петров"
  },
  "createdAt": "2025-06-01T10:00:00.000Z"
}
```

**Логика на сервере:**
- Проверка, что данный `externalId` + `provider` + `organizationId` ещё не заняты
- Если пользователь уже привязан к этому провайдеру в организации — обновляется `externalId`

**Ошибки:**
- `400 Bad Request` — неверный провайдер, пустой externalId
- `409 Conflict` — данный `externalId` уже привязан к другому пользователю в этой организации

---

#### DELETE /api/organizations/:orgId/identities/:id
Отвязать внешний аккаунт.

**HTTP-статус**: `204 No Content`

**Ошибки:**
- `404 Not Found` — запись с указанным ID не существует

---

## 4. Поиск студента по ExternalId (кросс-модульный эндпоинт)

Этот эндпоинт находится в **модуле Student**, но использует данные из **Integrations** для поиска.

#### GET /api/organizations/:orgId/students/by-external-id?provider=TELEGRAM&externalId=123456789

**Query Parameters:**

| Параметр | Тип | Описание |
|---|---|---|
| `provider` | string | Провайдер: `TELEGRAM`, `GOOGLE_CLASSROOM`, `MOODLE`, `DISCORD`, `WHATSAPP`, `ONE_C` |
| `externalId` | string | Идентификатор пользователя во внешней системе |

**Алгоритм поиска:**
1. Сервер ищет `MemberExternalIdentity` по `organizationId + provider + externalId`
2. Если найдена — получает `userId`
3. Ищет `Student` по `organizationId + userId`
4. Возвращает найденного студента или `null`

**Response 200 OK (найден):**
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

**Response 200 OK (не найден):**
```json
null
```

---

## 5. Полный список эндпоинтов (сводная таблица)

### Integrations (5 эндпоинтов)

| Метод | Путь | Описание | Статус ответа |
|---|---|---|---|
| `POST` | `/api/organizations/:orgId/integrations` | Создать/обновить конфигурацию | `201` |
| `GET` | `/api/organizations/:orgId/integrations` | Список интеграций организации | `200` |
| `DELETE` | `/api/organizations/:orgId/integrations/:id` | Удалить интеграцию | `204` |
| `POST` | `/api/organizations/:orgId/identities` | Привязать внешний аккаунт | `201` |
| `DELETE` | `/api/organizations/:orgId/identities/:id` | Отвязать внешний аккаунт | `204` |

### Student (связанный, 1 эндпоинт)

| Метод | Путь | Описание | Статус ответа |
|---|---|---|---|
| `GET` | `/api/organizations/:orgId/students/by-external-id` | Найти студента по externalId | `200` |

---

## 6. Типы данных для клиента (TypeScript)

```typescript
// ───── Integration Config ─────

/** Допустимые провайдеры */
type IntegrationProvider =
  | 'TELEGRAM'
  | 'GOOGLE_CLASSROOM'
  | 'MOODLE'
  | 'DISCORD'
  | 'WHATSAPP'
  | 'ONE_C';

/** Конфигурация интеграции (ответ сервера) */
interface IntegrationConfig {
  id: string;
  organizationId: string;
  provider: IntegrationProvider;
  isActive: boolean;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}

/** Запрос на создание/обновление конфигурации */
interface SaveIntegrationConfigRequest {
  provider: IntegrationProvider;
  config: Record<string, unknown>;
  secrets?: string;
  isActive?: boolean;
}

// ───── External Identity ─────

/** Внешняя идентификация пользователя (ответ сервера) */
interface ExternalIdentity {
  id: string;
  userId: string;
  organizationId: string;
  provider: string;
  externalId: string;
  meta: Record<string, unknown> | null;
  createdAt: string;  // ISO 8601
}

/** Запрос на привязку внешнего аккаунта */
interface BindExternalIdentityRequest {
  userId: string;
  provider: string;
  externalId: string;
  meta?: Record<string, unknown>;
}

// ───── Student (связанный) ─────

/** Ответ поиска студента по externalId */
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
  enrolledAt: string;  // ISO 8601
}
```

---

## 7. Сценарии использования (client-side)

### Сценарий 1: Подключение Telegram бота к организации

```
1. POST /api/organizations/:orgId/integrations
   Body: { provider: "TELEGRAM", config: { webhookUrl: "..." }, secrets: "token" }

2. GET /api/organizations/:orgId/integrations
   → проверяем, что TELEGRAM появился в списке
   → isActive: true
```

### Сценарий 2: Привязка Telegram ID к студенту

```
1. POST /api/organizations/:orgId/identities
   Body: { userId: "...", provider: "TELEGRAM", externalId: "12345" }

2. GET /api/organizations/:orgId/students/by-external-id?provider=TELEGRAM&externalId=12345
   → получаем данные студента
```

### Сценарий 3: Обработка дубликатов

```
1. POST /api/organizations/:orgId/identities
   Body: { ..., externalId: "12345" }
   → 201 Created (успех)

2. POST /api/organizations/:orgId/identities
   Body: { ..., externalId: "12345" }  // тот же externalId, другой userId
   → 409 Conflict (externalId уже занят)
```

---

## 8. Важные архитектурные заметки для клиента

1. **Организации изолированы**: Одна организация не видит интеграции другой. Все запросы идут с `:orgId`.
2. **ExternalId уникален строго в пределах организации + провайдера**: В разных организациях можно использовать один Telegram ID для разных пользователей.
3. **Один User может иметь несколько ExternalId**: Один пользователь может быть привязан к Telegram, Google Classroom и Discord одновременно в рамках одной организации.
4. **Один User в разных организациях**: У одного глобального `User` могут быть разные привязки в разных организациях (разные Telegram боты).
5. **`secrets` не возвращаются в GET**: Токены и ключи API отправляются только при создании/обновлении конфигурации.
6. **Порядок действий при создании студента**: Сначала создаётся `User`, затем `Student`, и только потом, если нужно, привязывается `ExternalIdentity`.

Для `integrations` UX лучше делать не как “технические настройки API”, а как **центр подключений организации**: админ видит доступные сервисы, статус подключения, что именно синхронизируется, и может безопасно подключить/отключить сервис.

**Роли**
- `SUPERADMIN`: может видеть/настраивать интеграции любых организаций.
- `ADMIN` организации: управляет интеграциями своей организации.
- `TEACHER/MANAGER`: скорее только видит статус или использует уже привязанные аккаунты.
- `STUDENT`: обычно не управляет интеграциями, но может привязать свой внешний аккаунт, если это нужно.

**Основной UX**
Экран: `Organization Settings -> Integrations`.

На экране список карточек/строк:
- Telegram
- Google Classroom
- Moodle
- Discord
- WhatsApp
- 1C

У каждой интеграции:
- статус: `Not connected`, `Connected`, `Inactive`, `Error`
- кнопка `Connect` / `Configure` / `Disable`
- дата последнего обновления
- короткое описание, что дает интеграция
- предупреждение, если не хватает секретов или настройка невалидна

Для подключенной интеграции нужен экран настройки:
- публичные параметры: webhook URL, course mappings, allowed updates, sync options;
- секреты: token/API key/password, скрытые по умолчанию;
- переключатель `Active`;
- кнопки `Save`, `Test connection`, `Delete integration`.

Отдельный UX для внешних аккаунтов:
- в карточке пользователя или студента показывать блок “Linked external accounts”;
- список привязок: Telegram ID, Classroom ID и т.д.;
- действия: `Link`, `Edit`, `Unlink`;
- при конфликте показывать понятную ошибку: “Этот Telegram аккаунт уже привязан к другому пользователю в этой организации”.

**User Stories**

1. Как админ организации, я хочу видеть список доступных интеграций, чтобы понимать, какие сервисы можно подключить.

2. Как админ организации, я хочу подключить Telegram, указав bot token и настройки webhook, чтобы организация могла получать события из Telegram.

3. Как админ организации, я хочу включать и выключать интеграцию без удаления настроек, чтобы временно остановить обмен данными.

4. Как админ организации, я хочу редактировать настройки существующей интеграции, чтобы менять webhook, mappings или параметры синхронизации.

5. Как админ организации, я хочу удалить интеграцию, чтобы полностью отключить внешний сервис от организации.

6. Как админ организации, я хочу протестировать подключение перед сохранением, чтобы сразу понять, что токен/API-ключ работает.

7. Как админ организации, я хочу видеть, что секретные данные скрыты, чтобы случайно не раскрыть токены другим людям на экране.

8. Как админ или менеджер, я хочу привязать Telegram/Google Classroom/Moodle аккаунт к пользователю, чтобы система могла сопоставлять внешние события с внутренним пользователем.

9. Как админ, я хочу увидеть ошибку при попытке привязать внешний аккаунт, который уже занят, чтобы не создать неправильную связь.

10. Как админ, я хочу отвязать внешний аккаунт от пользователя, чтобы исправить ошибочную привязку.

11. Как преподаватель, я хочу найти студента по внешнему ID, чтобы быстро понять, кому принадлежит сообщение или событие из Telegram/Classroom.

12. Как пользователь, я хочу видеть свои привязанные внешние аккаунты, чтобы понимать, какие сервисы связаны с моим профилем.

13. Как пользователь, я хочу самостоятельно подтвердить привязку внешнего аккаунта, чтобы админ не мог случайно привязать чужой аккаунт без проверки.

14. Как superadmin, я хочу видеть интеграции по всем организациям, чтобы помогать с настройкой и диагностикой.

15. Как админ, я хочу видеть статус ошибки интеграции, чтобы понимать, почему синхронизация не работает.

**Минимальный хороший MVP**
- экран списка интеграций организации;
- создать/редактировать/удалить интеграцию;
- активировать/деактивировать интеграцию;
- скрывать секреты;
- список внешних аккаунтов у пользователя/студента;
- привязать/отвязать external identity;
- понятные ошибки конфликтов.

**Что лучше добавить следующим этапом**
- `Test connection`;
- журнал последних ошибок/событий;
- OAuth flow для Google Classroom вместо ручного ввода;
- подтверждение привязки пользователем;
- permissions/guards на endpoints;
- audit log: кто изменил интеграцию и когда.