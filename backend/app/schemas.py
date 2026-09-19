from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    role: str
    faculty: Optional[str] = None
    programme: Optional[str] = None
    year: Optional[int] = None


class ContentCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    body: str = Field(min_length=2)
    priority: int = Field(default=0, ge=0, le=10)
    target_faculty: Optional[str] = None
    target_programme: Optional[str] = None
    target_year: Optional[int] = Field(default=None, ge=1, le=10)
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None


class ContentOut(ContentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    is_published: bool
    created_by: Optional[int] = None
    created_at: datetime


class EventCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str
    location: str
    starts_at: datetime
    ends_at: Optional[datetime] = None
    target_faculty: Optional[str] = None
    target_programme: Optional[str] = None
    target_year: Optional[int] = None


class EventOut(EventCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by: Optional[int] = None
    created_at: datetime


class SupportCreate(BaseModel):
    subject: str = Field(min_length=2, max_length=200)
    details: str = Field(min_length=2)


class SupportUpdate(BaseModel):
    status: str
    assigned_to: Optional[int] = None


class SupportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    subject: str
    details: str
    status: str
    assigned_to: Optional[int] = None
    created_at: datetime


class StaffCreate(BaseModel):
    name: str
    title: str
    department: str
    email: EmailStr
    phone: Optional[str] = None
    office: Optional[str] = None


class StaffOut(StaffCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int


class AIChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class AIChatResponse(BaseModel):
    message: str
    suggested_route: Optional[str] = None
    grounded_on: list[str] = []
