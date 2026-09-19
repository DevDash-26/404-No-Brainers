from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Role(str, Enum):
    STUDENT = "student"
    ACADEMIC_STAFF = "academic_staff"
    IT_STAFF = "it_staff"
    ADMIN = "admin"


class ContentCategory(str, Enum):
    ANNOUNCEMENT = "announcement"
    ACADEMIC_CALENDAR = "academic_calendar"
    SCHEDULE_CHANGE = "schedule_change"
    IT_SUPPORT = "it_support"


class SupportStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(40), index=True)

    faculty: Mapped[str | None] = mapped_column(String(120), nullable=True)
    programme: Mapped[str | None] = mapped_column(String(120), nullable=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)


class ContentItem(Base):
    """
    One reusable table powers:
    - targeted announcements
    - academic calendar
    - schedule changes
    - IT support information
    """
    __tablename__ = "content_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category: Mapped[str] = mapped_column(String(50), index=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    priority: Mapped[int] = mapped_column(Integer, default=0)

    target_faculty: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    target_programme: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    target_year: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)

    starts_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)

    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    location: Mapped[str] = mapped_column(String(160))
    starts_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    target_faculty: Mapped[str | None] = mapped_column(String(120), nullable=True)
    target_programme: Mapped[str | None] = mapped_column(String(120), nullable=True)
    target_year: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AcademicSupportRequest(Base):
    __tablename__ = "academic_support_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    subject: Mapped[str] = mapped_column(String(200))
    details: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default=SupportStatus.OPEN.value)
    assigned_to: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class StaffMember(Base):
    __tablename__ = "staff_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    title: Mapped[str] = mapped_column(String(120))
    department: Mapped[str] = mapped_column(String(120), index=True)
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(60), nullable=True)
    office: Mapped[str | None] = mapped_column(String(120), nullable=True)
