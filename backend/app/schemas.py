from datetime import datetime
from pydantic import BaseModel, Field, validator
from typing import Optional, List

class TourBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="Price must be greater than zero")
    country_id: int
    start_date: datetime = Field(default_faФctory=datetime.utcnow)
    end_date: Optional[datetime] = None
    @validator('end_date')
    def validate_end_date(cls, end_date, values):
        if end_date and 'start_date' in values and end_date < values['start_date']:
            raise ValueError('Дата окончания не может быть раньше даты начала')
        return end_date
class TourCreate(TourBase):
    pass
class TourResponse(TourBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True




class CountryBase(BaseModel):
    name: str
    description: str
    currency: str
    code: str
class CountryResponse(BaseModel):
    id: int
    name: str
    description: str
    currency: str
    code: Optional[str] = None

    class Config:
        from_attributes = True
class CountryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    currency: Optional[str] = None
    code: Optional[str] = None
class CountryCreate(CountryBase):
    pass
class Country(CountryBase):
    id: int
    class Config:
        from_attributes = True
class CountryList(BaseModel):
    items: List[Country]




class ClientBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
class ClientCreate(ClientBase):
    pass
class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True
class ClientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str = "user"
class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str]
    password: Optional[str]
    role: Optional[str]