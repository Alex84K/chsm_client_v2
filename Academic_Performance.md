# Проектирование (Design): Модуль Успеваемости (Enrollments, Grades, Gradebook)

Данный документ описывает архитектуру, интерфейсы и план миграции функционала успеваемости из старой системы в новый проект (`chsm_client`), с учетом требований `CLIENT_IMPLEMENTATION_GUIDE_ST2.md`.

## 1. Архитектура и навигация (Routing & Flow)

Основываясь на предоставленных компонентах (`StudentProfilePage`, `EnrollmentDetailPage`) и скриншоте, навигационный флоу будет следующим:

1. **Таблица студентов (`/components/StudentList.tsx`)**
   - Добавляется колонка "Действия" с иконкой "Открыть профиль" (как на скриншоте).
   - При клике происходит переход на `/admin/students/:id`.
2. **Профиль студента (`StudentProfilePage`)**
   - Отображает личные данные, статистику и список текущих/завершенных зачислений (Enrollments) на учебные потоки.
   - Включает кнопку "Зачислить в сессию" (`SessionsRunsModal`).
   - Клик по кнопке "Зачётка" в карточке активного зачисления переводит на страницу детализации: `/admin/enrollments/:enrollmentId`.
3. **Электронная зачетка (`EnrollmentDetailPage`)**
   - Индивидуальный вид успеваемости студента на конкретном потоке.
   - Отображает сетку предметов, текущие оценки, расчет итогового статуса (pass/fail).
   - Управляет жизненным циклом (DRAFT -> SUBMITTED -> APPROVED).
   - Предоставляет интерфейс для изменения оценок (через модалку или инлайн).

## 2. Модели данных (TypeScript Types)

Необходимо создать файл `chsm_client/src/types/enrollments.types.d.ts`:

```typescript
export type EnrollmentStatus = 'ENROLLED' | 'COMPLETED' | 'DROPPED';
export type GradebookStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

export interface GradeEntry {
  id: string;
  subjectId: string;
  value: number;
  source: string | null;
  recordedAt: string;
}

export interface Gradebook {
  id: string;
  status: GradebookStatus;
  approvedAt: string | null;
  approvedBy: string | null;
}

export interface Enrollment {
  id: string;
  studentId: string;
  sessionRunId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  teacherName: string | null;
  gradebook: Gradebook;
  grades: GradeEntry[];
}
```

## 3. Интеграция с API (Endpoints)

Создать файл `chsm_client/src/api/enrollments.api.ts`, интегрированный с изоляцией тенантов (`orgId`):

- **Зачисления:**
  - `POST /organizations/:orgId/enrollments` — зачислить студента.
  - `GET /organizations/:orgId/students/:studentId/enrollments` — получить зачисления конкретного студента (для профиля).
  - `GET /organizations/:orgId/enrollments/:id` — получить детальное зачисление (для страницы зачетки).
  - `PATCH /organizations/:orgId/enrollments/:id/status` — изменить статус (COMPLETED / DROPPED).
- **Оценки (Grades):**
  - `POST /organizations/:orgId/enrollments/:id/grades` — выставить оценку.
  - `PATCH /organizations/:orgId/enrollments/:id/grades/:gradeId` — изменить оценку.
- **Жизненный цикл (Gradebook Workflow):**
  - `POST /organizations/:orgId/enrollments/:id/gradebook/submit` — отправить на проверку.
  - `POST /organizations/:orgId/enrollments/:id/gradebook/approve` — утвердить.
  - `POST /organizations/:orgId/enrollments/:id/gradebook/reject` — вернуть на доработку (опционально, если бэкенд поддерживает).

## 4. UI/UX Сценарии и Компоненты

На основе старого кода компоненты будут адаптированы под MUI v5 и React Router v6:

### 4.1. `StudentProfilePage.tsx`
- Переиспользование карточки студента (Avatar, данные).
- Использование хуков `useStudent(orgId, studentId)` и `useEnrollmentsByStudent(orgId, studentId)`.
- Цветовое кодирование статусов (зеленый для ENROLLED, синий для COMPLETED).

### 4.2. `EnrollmentDetailPage.tsx`
- **Отображение предметов:** Карточки предметов адаптируются под текущую тему приложения. Сетка (`Grid`) выводит предметы потока. Оценки берутся из `enrollment.grades`.
- **Логика блокировки (Read-Only):**
  - Кнопка "Установить оценки вручную" и модалка `ManualGradesModal` блокируются/скрываются, если `enrollment.gradebook.status !== 'DRAFT'`.
  - Заглушки на карточках информируют: *"Оценки заблокированы (ведомость отправлена/утверждена)"*.
- **Управление статусом (Жизненный цикл):**
  - Заменяет старую логику на прямые вызовы к `/submit` и `/approve`.
  - Компонент `<Stepper activeStep={...} />` визуализирует текущий шаг ведомости.

### 4.3. Вспомогательные утилиты
- Перенос логики `calculateGradeResultV2` (из старого кода) в `chsm_client/src/utils/gradeCalculations.ts` для подсчета среднего балла, проверки профильных предметов и статусов прохождения.

## 5. План реализации (Implementation Steps)

1. **Слой данных:**
   - Создать `src/types/enrollments.types.d.ts`.
   - Реализовать `src/api/enrollments.api.ts`.
   - Создать хуки React Query в `src/hooks/useEnrollments.ts` (инкапсулировать `orgId`).
2. **Утилиты:**
   - Создать `src/utils/gradeCalculations.ts` для расчета баллов на клиенте.
3. **Модальные окна:**
   - Создать `SessionsRunsModal` (для зачисления студента из профиля).
   - Создать `ManualGradesModal` (для выставления оценок в зачетке).
4. **Страницы и роутинг:**
   - Добавить пути `/admin/students/:id` и `/admin/enrollments/:id` в настройки маршрутизатора (например, в `App.tsx` или `AdminPanel.tsx`).
   - Имплементировать `StudentProfilePage.tsx`.
   - Имплементировать `EnrollmentDetailPage.tsx`.
5. **Доработка существующих компонентов:**
   - Внедрить колонку с кнопкой перехода в профиль в компонент `chsm_client/src/components/StudentList.tsx`.
