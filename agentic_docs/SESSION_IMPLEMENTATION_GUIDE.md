# Руководство по реализации клиентского приложения (Client Integration Guide)
## Модуль: Учебные периоды (Academic Sessions)

Данный документ представляет собой подробную техническую спецификацию и руководство для Frontend-агента (разработчика), который будет реализовывать интерфейс для управления учебным процессом в **Student Portal SPA** и **Admin Panel SPA**.

---

## 1. Архитектурный контекст и авторизация

### 1.1 Мультитенантность (Multi-tenancy)
Система спроектирована как Multi-tenant SaaS. Все запросы к API учебных периодов должны содержать ID организации (`orgId`) в URL-маршруте:
`https://api.domain.com/organizations/:orgId/...`

*Пример:* `/organizations/4f8e561a-3c12-4d2b-a45e-888912cf73a1/academic-years`

### 1.2 Авторизация
Все эндпоинты защищены с помощью `JwtAuthGuard`. 
*   **Заголовок запроса:** `Authorization: Bearer <JWT_ACCESS_TOKEN>`
*   Токен должен быть получен при авторизации пользователя через модуль Auth.

---

## 2. Спецификация API и модели данных

Ниже приведена структура объектов и эндпоинты для четырех ключевых сущностей: **Учебный год (AcademicYear)**, **Уровень обучения (SessionLevel)**, **Поток (SessionRun)** и **Предмет (Subject)**.

### 2.1 Учебный год (AcademicYear)
Определяет временные рамки учебного периода.

#### Интерфейс TypeScript (Frontend):
```typescript
export interface AcademicYear {
  id: string;             // UUID
  organizationId?: string; // UUID тенанта (опционально на клиенте)
  label: string;          // Название (например, "2026/2027 Singerei Noi")
  startsAt: string;       // ISO Date String
  endsAt: string;         // ISO Date String
  // Дополнительные поля для совместимости в UI
  value?: string;         // Обычно равен id
  startAt?: string;       // Синоним startsAt
  endAt?: string;         // Синоним endsAt
}

export interface CreateAcademicYearDto {
  label: string;
  startsAt: string;
  endsAt: string;
}
```

#### Эндпоинты:
*   **POST** `/academic-years` — Создать учебный год.
*   **GET** `/academic-years` — Список всех годов организации.
*   **PATCH** `/academic-years/:id` — Обновить поля года.
*   **DELETE** `/academic-years/:id` — Удалить год.

---

### 2.2 Уровень обучения (SessionLevel)
Логический шаблон курса (например, "1-й класс", "2-й класс").

#### Интерфейс TypeScript (Frontend):
```typescript
export interface SessionLevels {
  id: string;             // UUID
  organizationId?: string; // UUID тенанта
  number: string;         // Порядковый номер уровня (как строка для UI)
  title: string;          // Название (например, "1 session")
  description: string;
}

export interface CreateSessionLevelDto {
  number: number;
  title: string;
  description?: string;
}
```

#### Эндпоинты:
*   **POST** `/session-levels` — Создать уровень обучения.
*   **GET** `/session-levels` — Список всех уровней организации.
*   **PATCH** `/session-levels/:id` — Обновить уровень.
*   **DELETE** `/session-levels/:id` — Удалить уровень.

---

### 2.3 Поток / Запуск сессии (SessionRun)
Конкретная реализация Уровня Обучения в рамках определенного Учебного Года.

#### Интерфейс TypeScript (Frontend):
```typescript
export type SessionRunStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface SessionRuns {
  id: string;                  // UUID
  organizationId?: string;      // UUID тенанта
  levelId: string;             // UUID связанного уровня обучения
  academicYearId: string;      // UUID связанного учебного года
  status: SessionRunStatus | string;       // Статус потока
  classroomCourseId?: string | null; // ID курса в Google Classroom (если привязан)
  description?: string;
}

export interface CreateSessionRunDto {
  levelId: string;
  academicYearId: string;
  classroomCourseId?: string;
  status: SessionRunStatus;
}
```

#### Эндпоинты:
*   **POST** `/session-runs` — Запустить/Создать поток.
*   **GET** `/session-runs` — Список всех потоков организации.
*   **GET** `/session-runs/:id` — Детали потока по ID.
*   **PATCH** `/session-runs/:id` — Обновить статус или Google Classroom ID.
*   **DELETE** `/session-runs/:id` — Удалить поток.

---

### 2.4 Предмет (Subject)
Учебные дисциплины, закрепленные за конкретными уровнями/потоками.

#### Интерфейс TypeScript (Frontend):
```typescript
export interface Subject {
  id: string;
  levelId: string;
  sessionRunId: string;
  title: string;
  teacherName?: string;
  hours?: number;
  classroomCourseworkId?: string;
  hasClassroom: boolean;
}

export interface CreateSubjectDto {
  levelId: string;
  sessionRunId: string;
  title: string;
  teacherName?: string;
  hours?: number;
  classroomCourseworkId?: string;
  hasClassroom: boolean;
}
```

#### Эндпоинты:
*   **POST** `/subjects` — Создать предмет.
*   **GET** `/subjects` — Список предметов.
*   **PATCH** `/subjects/:id` — Обновить предмет.
*   **DELETE** `/subjects/:id` — Удалить предмет.

---

## 3. Бизнес-логика и правила валидации для Frontend

### 3.1 Валидация Учебного года (AcademicYear Form)
*   **startsAt < endsAt**: Дата окончания должна быть строго позже даты начала. Рекомендуется использовать селекторы дат (например, `@mui/x-date-pickers`) с валидацией `minDate` для `endsAt`.

### 3.2 Валидация Уровня обучения (SessionLevel Form)
*   **Поле number**: Допускаются только целые положительные числа (значение `>= 1`). На бэкенд передавать как `number`, на клиенте хранить как `string` или выполнять преобразование типов.

### 3.3 Правила стейт-машины статусов Потока (SessionRun Lifecycle)
*   Допустимые переходы статусов: `PLANNED` -> `ACTIVE` -> `COMPLETED`.
*   *Запрещено:* переход из `PLANNED` в `COMPLETED` напрямую, или возврат из `COMPLETED` в активные состояния.
*   **Реализация в UI:** В столбце таблицы «Статус» выводится стилизованный выпадающий список (Select/Dropdown) или интерактивный Badge. При изменении статуса отправляется PATCH-запрос. Доступные опции в Dropdown должны фильтроваться на основе текущего статуса сессии.

### 3.4 Безопасное удаление (No-Cascade Handling)
*   При попытке удаления сущностей, имеющих связанные данные (например, уровень или год со связанными потоками), API возвращает `409 Conflict`.
*   **Обработка в UI:** Перехватывать ошибки `409` и выводить диалоговое окно (Dialog) с понятным текстом предупреждения: *«Невозможно удалить элемент, так как он используется в учебных процессах. Сначала удалите связанные потоки/предметы»*.

---

## 4. Дизайн интерфейса (UX/UI Specification)

Интерфейс модуля управления сессиями должен быть интегрирован в панель администратора (**Admin Panel**) в соответствии с предоставленным дизайн-макетом.

### 4.1 Навигация (Sidebar)
*   Модуль должен располагаться на отдельной вкладке левой боковой панели (**SideMenu**).
*   **Элемент меню:**
    *   **Text:** `Sessions` (или "Сессии")
    *   **Icon:** Иконка календаря (`CalendarMonthRoundedIcon` или `AssignmentRoundedIcon`)
    *   **Route Path:** `/admin/sessions`
*   При переходе по пути `/admin/sessions` рендерится страница управления сессиями, содержащая внутренние вкладки (Tabs).

### 4.2 Внутренняя структура (Tabs Layout)
Внутри страницы `/admin/sessions` в верхней части располагается навигационная панель вкладок (компонент `<Tabs>` из Material-UI), переключающая подразделы:
1.  **ЗАПУСКИ СЕССИЙ** (активная вкладка по умолчанию)
2.  **УРОВНИ СЕССИЙ**
3.  **ПРЕДМЕТЫ**
4.  **УЧЕБНЫЕ ГОДЫ**

Под панелью вкладок отображается заголовок текущей вкладки, кнопка **«ДОБАВИТЬ»** (окрашенная в основной синий цвет `#1976d2` или соответствующий теме) и таблица данных.

---

### 4.3 Спецификация вкладок и таблиц

#### Вкладка 1: Запуски сессий (Session Runs)
*   **Заголовок:** Запуски сессий
*   **Кнопка:** `ДОБАВИТЬ` (Открывает модальное окно добавления запуска сессии. Содержит выпадающие списки для выбора **Уровня** и **Учебного года**).
*   **Таблица:**
    *   `Уровень` (Отображает `title` уровня обучения, полученный по связи `levelId`).
    *   `Учебный год` (Отображает `label` учебного года по связи `academicYearId`).
    *   `Course ID` (ID курса в Google Classroom или `0` / `-`, если отсутствует).
    *   `Статус` (Интерактивный выпадающий список-Badge. Значения: `PLANNED` (серый/синий), `ACTIVE` (зелёный), `COMPLETED` (красный/темный)).
    *   `Действия` (Иконка редактирования ✏️ и иконка удаления 🗑️ красного цвета).

#### Вкладка 2: Уровни сессий (Session Levels)
*   **Заголовок:** Уровни сессий
*   **Кнопка:** `ДОБАВИТЬ` (Открывает модальное окно с формой: Номер уровня (число), Название, Описание).
*   **Таблица:**
    *   `Номер`
    *   `Название`
    *   `Описание`
    *   `Действия` (Редактировать, Удалить).

#### Вкладка 3: Предметы (Subjects)
*   **Заголовок:** Список предметов
*   **Кнопка:** `ДОБАВИТЬ` (Открывает форму: Название, Выбор уровня/запуска сессии, Имя преподавателя, Часы, Флаг интеграции с Google Classroom).
*   **Таблица:**
    *   `Название предмета`
    *   `Преподаватель`
    *   `Часы`
    *   `Уровень / Поток`
    *   `Google Classroom` (Статус привязки/синхронизации)
    *   `Действия` (Редактировать, Удалить).

#### Вкладка 4: Учебные годы (Academic Years)
*   **Заголовок:** Учебные годы
*   **Кнопка:** `ДОБАВИТЬ` (Открывает форму: Название учебного года (например, "2026/2027 Singerei Noi"), Дата начала, Дата окончания).
*   **Таблица:**
    *   `Название`
    *   `Дата начала` (Форматирование даты `DD.MM.YYYY`)
    *   `Дата окончания` (Форматирование даты `DD.MM.YYYY`)
    *   `Действия` (Редактировать, Удалить).

---

## 5. Техническая реализация (React Query & API Integration)

Для управления состоянием и взаимодействия с сервером используется библиотека **React Query** (`@tanstack/react-query`) и **Axios**-клиент.

### 5.1 Структура API-запросов и Хуков

Каждая сущность должна иметь свой набор API-методов и React Query хуков, обеспечивающих автоматическое обновление кэша после изменений (invalidation).

#### Реализация для Academic Years (`academicYears.api.ts` & `useAcademicYears.ts`)
*   **Query Key:** `['academic-years']`
*   **Хуки:**
    *   `useAcademicYears()` — получение списка годов.
    *   `useCreateAcademicYear()` — мутация создания. Выполняет `qc.invalidateQueries({ queryKey: ['academic-years'] })` при успехе.
    *   `useUpdateAcademicYear()` — мутация обновления по `id`. Сбрасывает кэш `['academic-years']`.
    *   `useDeleteAcademicYear()` — мутация удаления по `id`. Сбрасывает кэш `['academic-years']`.

#### Реализация для Session Levels (`sessionLevels.api.ts` & `useSessionLevels.ts`)
*   **Query Key:** `['session-levels']`
*   **Хуки:**
    *   `useSessionLevels()` — получение списка уровней.
    *   `useCreateSessionLevel()`, `useUpdateSessionLevel()`, `useDeleteSessionLevel()` — мутации с инвалидацией ключа `['session-levels']`.

#### Реализация для Session Runs (`sessionRuns.api.ts` & `useSessionRuns.ts`)
*   **Query Key:** `['session-runs']`
*   **Хуки:**
    *   `useSessionRuns()` — получение всех потоков.
    *   `useSessionRun(id)` — получение деталей конкретного потока по `id`. Ключ: `['session-runs', id]`.
    *   `useCreateSessionRun()`, `useUpdateSessionRun()`, `useDeleteSessionRun()` — мутации с инвалидацией ключа `['session-runs']`.

#### Реализация для Subjects (`subjects.api.ts` & `useSubjects.ts`)
*   **Query Key:** `['subjects']`
*   **Хуки:**
    *   `useSubjects()` — получение всех предметов.
    *   `useCreateSubject()`, `useUpdateSubject()`, `useDeleteSubject()` — мутации с инвалидацией ключа `['subjects']`.