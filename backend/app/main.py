from __future__ import annotations

import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
load_dotenv()

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from .ai_service import answer_with_ai, choose_route
from .auth import (
    create_access_token,
    get_current_user,
    hash_password,
    require_roles,
    verify_password,
)
from .database import Base, SessionLocal, engine, get_db
from .models import (
    AcademicSupportRequest,
    ContentCategory,
    ContentItem,
    Event,
    Role,
    StaffMember,
    SupportStatus,
    User,
)
from .schemas import (
    AIChatRequest,
    AIChatResponse,
    ContentCreate,
    ContentOut,
    EventCreate,
    EventOut,
    LoginRequest,
    StaffCreate,
    StaffOut,
    SupportCreate,
    SupportOut,
    SupportUpdate,
    TokenResponse,
    UserOut,
)

app = FastAPI(
    title="UCL Campus Hub API",
    version="1.0.0",
    description="DevDash hackathon backend for a unified UCL campus information hub.",
)
@app.get("/")
def root():
    return {
        "message": "UCL Campus Hub API is running",
        "docs": "/docs",
        "health": "/health"
    }

origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:3000,http://localhost:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def matches_student(model, user: User):
    """Reusable targeting rule for content and events."""
    if user.role != Role.STUDENT.value:
        return True

    return and_(
        or_(model.target_faculty.is_(None), model.target_faculty == user.faculty),
        or_(model.target_programme.is_(None), model.target_programme == user.programme),
        or_(model.target_year.is_(None), model.target_year == user.year),
    )


def content_for_user(db: Session, user: User, category: str):
    stmt = (
        select(ContentItem)
        .where(
            ContentItem.category == category,
            ContentItem.is_published.is_(True),
            matches_student(ContentItem, user),
        )
        .order_by(ContentItem.priority.desc(), ContentItem.created_at.desc())
    )
    return list(db.scalars(stmt).all())


def events_for_user(db: Session, user: User):
    stmt = (
        select(Event)
        .where(matches_student(Event, user))
        .order_by(Event.starts_at.asc())
    )
    return list(db.scalars(stmt).all())


def seed_demo_data():
    db = SessionLocal()
    try:
        if not db.scalar(select(User).limit(1)):
            users = [
                User(
                    email="student@ucl.demo",
                    name="Demo Student",
                    password_hash=hash_password("Student123!"),
                    role=Role.STUDENT.value,
                    faculty="Computing",
                    programme="Software Engineering",
                    year=2,
                ),
                User(
                    email="academic@ucl.demo",
                    name="Demo Academic Staff",
                    password_hash=hash_password("Staff123!"),
                    role=Role.ACADEMIC_STAFF.value,
                    faculty="Computing",
                ),
                User(
                    email="it@ucl.demo",
                    name="Demo IT Staff",
                    password_hash=hash_password("IT123!"),
                    role=Role.IT_STAFF.value,
                ),
                User(
                    email="admin@ucl.demo",
                    name="Demo Administrator",
                    password_hash=hash_password("Admin123!"),
                    role=Role.ADMIN.value,
                ),
            ]
            db.add_all(users)
            db.flush()

        if not db.scalar(select(ContentItem).limit(1)):
            now = datetime.utcnow()
            db.add_all(
                [
                    ContentItem(
                        category=ContentCategory.ANNOUNCEMENT.value,
                        title="Software Engineering Year 2 briefing",
                        body="The programme briefing will be held in Lecture Hall A at 10:00 AM.",
                        priority=4,
                        target_faculty="Computing",
                        target_programme="Software Engineering",
                        target_year=2,
                    ),
                    ContentItem(
                        category=ContentCategory.ANNOUNCEMENT.value,
                        title="Welcome to the UCL Campus Hub",
                        body="This hub brings trusted campus information into one place.",
                        priority=1,
                    ),
                    ContentItem(
                        category=ContentCategory.ACADEMIC_CALENDAR.value,
                        title="Add/drop deadline",
                        body="Final day for module add/drop requests.",
                        starts_at=now + timedelta(days=6),
                        priority=5,
                    ),
                    ContentItem(
                        category=ContentCategory.SCHEDULE_CHANGE.value,
                        title="Room change for SE Year 2",
                        body="Tomorrow's Software Engineering lecture has moved to Room 3A.",
                        starts_at=now + timedelta(days=1),
                        target_programme="Software Engineering",
                        target_year=2,
                        priority=8,
                    ),
                    ContentItem(
                        category=ContentCategory.IT_SUPPORT.value,
                        title="Campus Wi-Fi help",
                        body="For campus Wi-Fi access issues, contact the IT help desk or visit the IT office.",
                        priority=2,
                    ),
                ]
            )

        if not db.scalar(select(Event).limit(1)):
            now = datetime.utcnow()
            db.add_all(
                [
                    Event(
                        title="AI & Software Engineering Workshop",
                        description="A practical student workshop on modern AI-assisted development.",
                        location="Lecture Hall B",
                        starts_at=now + timedelta(days=2, hours=2),
                    ),
                    Event(
                        title="Computing Careers Talk",
                        description="Industry guests discuss internships and early-career paths.",
                        location="Auditorium",
                        starts_at=now + timedelta(days=4),
                        target_faculty="Computing",
                    ),
                ]
            )

        if not db.scalar(select(StaffMember).limit(1)):
            db.add_all(
                [
                    StaffMember(
                        name="Dr. Maya Perera",
                        title="Programme Lead",
                        department="Computing",
                        email="maya.perera@ucl.demo",
                        office="Academic Office",
                    ),
                    StaffMember(
                        name="Nimal Fernando",
                        title="IT Support Officer",
                        department="IT",
                        email="it.support@ucl.demo",
                        office="IT Help Desk",
                    ),
                    StaffMember(
                        name="Ayesha Silva",
                        title="Student Services Officer",
                        department="Student Services",
                        email="student.services@ucl.demo",
                        office="Student Services",
                    ),
                ]
            )

        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    seed_demo_data()


@app.get("/health")
def health():
    return {"status": "ok", "service": "ucl-campus-hub-api"}


@app.post("/auth/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenResponse(access_token=create_access_token(user))


@app.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@app.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    BR1 Unified Access:
    one request returns the student's trusted campus information.
    """
    announcements = content_for_user(db, user, ContentCategory.ANNOUNCEMENT.value)
    schedule_changes = content_for_user(db, user, ContentCategory.SCHEDULE_CHANGE.value)
    calendar = content_for_user(db, user, ContentCategory.ACADEMIC_CALENDAR.value)
    it_support = content_for_user(db, user, ContentCategory.IT_SUPPORT.value)
    events = events_for_user(db, user)

    staff = list(
        db.scalars(
            select(StaffMember).order_by(StaffMember.department, StaffMember.name).limit(6)
        ).all()
    )

    return {
        "user": UserOut.model_validate(user),
        "announcements": [ContentOut.model_validate(x) for x in announcements],
        "schedule_changes": [ContentOut.model_validate(x) for x in schedule_changes],
        "academic_calendar": [ContentOut.model_validate(x) for x in calendar],
        "events": [EventOut.model_validate(x) for x in events],
        "it_support": [ContentOut.model_validate(x) for x in it_support],
        "staff_directory_preview": [StaffOut.model_validate(x) for x in staff],
    }


def content_routes(category: ContentCategory):
    return category.value


@app.get("/announcements", response_model=list[ContentOut])
def get_announcements(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return content_for_user(db, user, ContentCategory.ANNOUNCEMENT.value)


@app.post("/announcements", response_model=ContentOut, status_code=201)
def create_announcement(
    data: ContentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(
        require_roles(Role.ACADEMIC_STAFF.value, Role.ADMIN.value)
    ),
):
    item = ContentItem(
        category=ContentCategory.ANNOUNCEMENT.value,
        created_by=user.id,
        **data.model_dump(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.get("/schedule-changes", response_model=list[ContentOut])
def get_schedule_changes(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return content_for_user(db, user, ContentCategory.SCHEDULE_CHANGE.value)


@app.post("/schedule-changes", response_model=ContentOut, status_code=201)
def create_schedule_change(
    data: ContentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(
        require_roles(Role.ACADEMIC_STAFF.value, Role.ADMIN.value)
    ),
):
    item = ContentItem(
        category=ContentCategory.SCHEDULE_CHANGE.value,
        created_by=user.id,
        **data.model_dump(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.get("/calendar", response_model=list[ContentOut])
def get_calendar(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return content_for_user(db, user, ContentCategory.ACADEMIC_CALENDAR.value)


@app.post("/calendar", response_model=ContentOut, status_code=201)
def create_calendar_entry(
    data: ContentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(
        require_roles(Role.ACADEMIC_STAFF.value, Role.ADMIN.value)
    ),
):
    item = ContentItem(
        category=ContentCategory.ACADEMIC_CALENDAR.value,
        created_by=user.id,
        **data.model_dump(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.get("/it-support", response_model=list[ContentOut])
def get_it_support(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return content_for_user(db, user, ContentCategory.IT_SUPPORT.value)


@app.post("/it-support", response_model=ContentOut, status_code=201)
def create_it_support(
    data: ContentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(Role.IT_STAFF.value, Role.ADMIN.value)),
):
    item = ContentItem(
        category=ContentCategory.IT_SUPPORT.value,
        created_by=user.id,
        **data.model_dump(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.get("/events", response_model=list[EventOut])
def get_events(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return events_for_user(db, user)


@app.post("/events", response_model=EventOut, status_code=201)
def create_event(
    data: EventCreate,
    db: Session = Depends(get_db),
    user: User = Depends(
        require_roles(Role.ACADEMIC_STAFF.value, Role.ADMIN.value)
    ),
):
    event = Event(created_by=user.id, **data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@app.post("/academic-support", response_model=SupportOut, status_code=201)
def request_academic_support(
    data: SupportCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(Role.STUDENT.value)),
):
    request = AcademicSupportRequest(student_id=user.id, **data.model_dump())
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


@app.get("/academic-support/mine", response_model=list[SupportOut])
def my_support_requests(
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(Role.STUDENT.value)),
):
    stmt = (
        select(AcademicSupportRequest)
        .where(AcademicSupportRequest.student_id == user.id)
        .order_by(AcademicSupportRequest.created_at.desc())
    )
    return list(db.scalars(stmt).all())


@app.get("/academic-support/all", response_model=list[SupportOut])
def all_support_requests(
    db: Session = Depends(get_db),
    user: User = Depends(
        require_roles(Role.ACADEMIC_STAFF.value, Role.ADMIN.value)
    ),
):
    stmt = select(AcademicSupportRequest).order_by(
        AcademicSupportRequest.created_at.desc()
    )
    return list(db.scalars(stmt).all())


@app.patch("/academic-support/{request_id}", response_model=SupportOut)
def update_support_request(
    request_id: int,
    data: SupportUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(
        require_roles(Role.ACADEMIC_STAFF.value, Role.ADMIN.value)
    ),
):
    request = db.get(AcademicSupportRequest, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Support request not found")

    allowed = {
        SupportStatus.OPEN.value,
        SupportStatus.IN_PROGRESS.value,
        SupportStatus.RESOLVED.value,
    }
    if data.status not in allowed:
        raise HTTPException(status_code=422, detail=f"status must be one of {sorted(allowed)}")

    request.status = data.status
    request.assigned_to = data.assigned_to or user.id
    db.commit()
    db.refresh(request)
    return request


@app.get("/staff", response_model=list[StaffOut])
def staff_directory(
    department: str | None = Query(default=None),
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    stmt = select(StaffMember)

    if department:
        stmt = stmt.where(StaffMember.department.ilike(f"%{department}%"))

    if q:
        term = f"%{q}%"
        stmt = stmt.where(
            or_(
                StaffMember.name.ilike(term),
                StaffMember.title.ilike(term),
                StaffMember.department.ilike(term),
            )
        )

    stmt = stmt.order_by(StaffMember.department, StaffMember.name)
    return list(db.scalars(stmt).all())


@app.post("/staff", response_model=StaffOut, status_code=201)
def add_staff_member(
    data: StaffCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles(Role.ADMIN.value)),
):
    staff = StaffMember(**data.model_dump())
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff


@app.post("/ai/chat", response_model=AIChatResponse)
def ai_chat(
    data: AIChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    BR33 AI Assistant:
    grounded in data the logged-in student is allowed to see.
    """
    announcements = content_for_user(db, user, ContentCategory.ANNOUNCEMENT.value)
    changes = content_for_user(db, user, ContentCategory.SCHEDULE_CHANGE.value)
    calendar = content_for_user(db, user, ContentCategory.ACADEMIC_CALENDAR.value)
    it_help = content_for_user(db, user, ContentCategory.IT_SUPPORT.value)
    events = events_for_user(db, user)
    staff = list(db.scalars(select(StaffMember).order_by(StaffMember.department)).all())

    context = {
        "student": {
            "name": user.name,
            "faculty": user.faculty,
            "programme": user.programme,
            "year": user.year,
        },
        "announcements": [
            {"title": x.title, "body": x.body, "starts_at": x.starts_at}
            for x in announcements[:12]
        ],
        "schedule_changes": [
            {"title": x.title, "body": x.body, "starts_at": x.starts_at}
            for x in changes[:12]
        ],
        "academic_calendar": [
            {"title": x.title, "body": x.body, "starts_at": x.starts_at}
            for x in calendar[:15]
        ],
        "events": [
            {
                "title": x.title,
                "description": x.description,
                "location": x.location,
                "starts_at": x.starts_at,
            }
            for x in events[:15]
        ],
        "it_support": [
            {"title": x.title, "body": x.body}
            for x in it_help[:10]
        ],
        "staff_directory": [
            {
                "name": x.name,
                "title": x.title,
                "department": x.department,
                "email": x.email,
                "office": x.office,
            }
            for x in staff[:20]
        ],
    }

    answer = answer_with_ai(data.message, context)
    route = choose_route(data.message)

    return AIChatResponse(
        message=answer,
        suggested_route=route,
        grounded_on=[
            "targeted announcements",
            "schedule changes",
            "academic calendar",
            "events",
            "IT support",
            "staff directory",
        ],
    )

