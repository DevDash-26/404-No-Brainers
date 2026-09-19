# Frontend API Contract

Base URL during local development:

```text
http://127.0.0.1:8000
```

Every endpoint except `/health` and `/auth/login` requires:

```http
Authorization: Bearer <token>
```

## Main student screen

### GET `/dashboard`

This is the frontend's most important endpoint. One request returns:

```json
{
  "user": {},
  "announcements": [],
  "schedule_changes": [],
  "academic_calendar": [],
  "events": [],
  "it_support": [],
  "staff_directory_preview": []
}
```

Use this to build the home/dashboard screen.

## Authentication

### POST `/auth/login`

```json
{
  "email": "student@ucl.demo",
  "password": "Student123!"
}
```

## Announcements

- `GET /announcements`
- `POST /announcements` — academic staff/admin

Create body:

```json
{
  "title": "SE Year 2 timetable update",
  "body": "Tomorrow's lecture starts at 10:30 AM.",
  "priority": 8,
  "target_faculty": "Computing",
  "target_programme": "Software Engineering",
  "target_year": 2
}
```

## Events

- `GET /events`
- `POST /events` — academic staff/admin

## Academic support

- `POST /academic-support` — student
- `GET /academic-support/mine` — student
- `GET /academic-support/all` — academic staff/admin
- `PATCH /academic-support/{id}` — academic staff/admin

## Academic calendar

- `GET /calendar`
- `POST /calendar` — academic staff/admin

## Schedule changes

- `GET /schedule-changes`
- `POST /schedule-changes` — academic staff/admin

## Staff directory

- `GET /staff`
- `GET /staff?q=maya`
- `GET /staff?department=IT`
- `POST /staff` — admin

## IT support

- `GET /it-support`
- `POST /it-support` — IT staff/admin

## AI assistant

### POST `/ai/chat`

```json
{
  "message": "What do I need to know this week?"
}
```

Response:

```json
{
  "message": "There is a Year 2 briefing ...",
  "suggested_route": "/calendar",
  "grounded_on": [
    "targeted announcements",
    "schedule changes",
    "academic calendar",
    "events",
    "IT support",
    "staff directory"
  ]
}
```
