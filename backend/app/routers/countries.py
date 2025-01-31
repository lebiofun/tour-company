from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.app.models import Country
from backend.app.schemas import CountryCreate, CountryResponse, CountryUpdate
from backend.app.dependencies import get_db
from typing import Optional
router = APIRouter(prefix="/countries", tags=["Countries"])

@router.post("/", response_model=CountryResponse)
def create_country(country: CountryCreate, db: Session = Depends(get_db)):
    try:
        db_country = Country(**country.dict())
        db.add(db_country)
        db.commit()
        db.refresh(db_country)
        return db_country
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ошибка при создании страны. Возможно, такая страна уже существует.")

@router.get("/{country_id}", response_model=CountryResponse)
def get_country(country_id: int, db: Session = Depends(get_db)):
    country = db.query(Country).filter(Country.id == country_id).first()
    if not country:
        raise HTTPException(status_code=404, detail="Страна не найдена")
    return country

@router.get("/", response_model=dict)
def get_countries(
        skip: int = Query(default=0, ge=0, description="Количество пропускаемых записей"),
        limit: Optional[int] = Query(default=None, ge=1, description="Максимальное количество записей"),
        db: Session = Depends(get_db)
):
    query = db.query(Country)
    total = query.count()
    if limit is not None:
        countries = query.offset(skip).limit(limit).all()
    else:
        countries = query.all()
    country_responses = [CountryResponse.from_orm(country) for country in countries]
    return {"total": total, "items": country_responses, "skip": skip, "limit": limit}

@router.put("/{country_id}", response_model=CountryResponse)
def update_country(country_id: int, country_update: CountryUpdate, db: Session = Depends(get_db)):
    try:
        country = db.query(Country).filter(Country.id == country_id).first()
        if not country:
            raise HTTPException(status_code=404, detail="Страна не найдена")
        for key, value in country_update.dict(exclude_unset=True).items():
            setattr(country, key, value)
        db.commit()
        db.refresh(country)
        return country
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ошибка при обновлении страны. Возможно, такое название уже существует.")

@router.delete("/{country_id}")
def delete_country(country_id: int, db: Session = Depends(get_db)):
    country = db.query(Country).filter(Country.id == country_id).first()
    if not country:
        raise HTTPException(status_code=404, detail="Страна не найдена")
    try:
        db.delete(country)
        db.commit()
        return {"message": "Страна успешно удалена"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Невозможно удалить страну. Возможно, есть связанные туры.")