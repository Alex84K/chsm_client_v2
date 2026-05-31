# Исследование: Модуль "Успеваемость" (Enrollments, Grades, Gradebook)

Данный документ содержит факты и связи в кодовой базе проекта, необходимые для реализации требований из `agentic_docs/CLIENT_IMPLEMENTATION_GUIDE_ST2.md`.

## 1. Доменные типы (TypeScript)

### 1.1. Отсутствующие типы
Специфицированные в руководстве доменные типы и перечисления **не обнаружены** в директории `chsm_client/src/types/`:
- `EnrollmentStatus`
- `GradebookStatus`
- `GradeEntry`
- `Gradebook`
- `Enrollment`

### 1.2. Существующие смежные типы
- **Студенты (`Student`)**
  - Файл: `chsm_client/src/types/student.types.d.ts`
  - Текущий интерфейс `Student` содержит поля `gradebookNumber`, `gradebookIssuedAt`, `enrolledAt`.
- **Потоки и предметы (`SessionRun`, `Subject`)**
  - Файл: `chsm_client/src/types/session.types.d.ts`
  - Тип `SessionRun` определяет структуру учебного потока.
  - Тип `Subject` содержит поля `levelId`, `sessionRunId`, `title`, `teacherName`, `hours` и т.д., что соответствует ссылкам `subjectId` и `sessionRunId` из новой спецификации.

## 2. API Интерфейсы (Endpoints)

### 2.1. Отсутствующие API-модули
Эндпоинты управления зачислениями, выставлением оценок и ведомостями (содержащие путь `/organizations/:orgId/enrollments/*`) **не реализованы** в папке `chsm_client/src/api/`.

### 2.2. Базовая конфигурация и смежные API
- **API Клиент:** `chsm_client/src/api/apiClient.ts`
  - Настроен экземпляр Axios с подстановкой заголовка `Authorization: Bearer <token>` (читается из `sessionStorage`).
- **API Студентов:** `chsm_client/src/api/student.api.ts`
  - Обрабатывает методы для работы со студентами (создание, получение списка).
- **API Учебных потоков и предметов:** `chsm_client/src/api/sessions.api.ts`
  - Содержит запросы к сущностям `SessionRun` и `Subject`, с которыми будут связываться новые сущности `Enrollment`.

## 3. Компоненты интерфейса (UX/UI)

### 3.1. Отсутствующие компоненты
- Интерфейс "Электронный журнал потока" (Grading Matrix) **отсутствует**.
- Панели управления статусами зачетных ведомостей и зачислениями (Gradebook Workflow Controls) **не реализованы**.

### 3.2. Существующие точки интеграции UI
- **Список студентов:** `chsm_client/src/components/StudentList.tsx`
  - Выводит список студентов и включает колонки `Зачётка` (`student.gradebookNumber`) и `Дата зачисления` (`student.enrolledAt`).
- **Список потоков:** `chsm_client/src/components/SessionsList.tsx`
  - Управляет отображением учебных потоков.
- **Хуки для получения данных:** 
  - `chsm_client/src/hooks/useStudents.ts`
  - `chsm_client/src/hooks/useSessions.ts`
- **Модальные окна:** В папке `chsm_client/src/modals/` присутствуют реализованные модалки для смежных сущностей (например, `SubjectModal.tsx`, `SessionRunModal.tsx`).

## 4. Итог
Функционал `Enrollments, Grades, Gradebook` на данный момент не представлен в кодовой базе клиента. Связанные сущности (Студенты, Потоки, Предметы) и инфраструктура запросов (apiClient) уже существуют и могут использоваться в качестве фундамента для имплементации.
