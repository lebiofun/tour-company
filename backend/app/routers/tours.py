from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session#SQLAlchemy
from sqlalchemy.exc import IntegrityError#обработка ошибок
from backend.app.models import Tour
from backend.app.schemas import TourCreate, TourResponse, TourBase
from backend.app.dependencies import get_db#для зависимость для получения сессии БД
from typing import Optional#для типизация опциональных параметров
router = APIRouter(prefix="/tours", tags=["Tours"])
@router.post("/", response_model=TourResponse)#создание нового тура
def create_tour(tour: TourCreate, db: Session = Depends(get_db)):
    try:
        db_tour = Tour(**tour.dict())
        db.add(db_tour)
        db.commit()
        db.refresh(db_tour)
        return db_tour
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400,  detail="Ошибка при создании тура. Возможно, указана несуществующая страна.")

@router.get("/{tour_id}", response_model=TourResponse)#получение информации о конкретном туре
def get_tour(tour_id: int, db: Session = Depends(get_db)):
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Тур не найден")
    return tour

@router.get("/", response_model=dict)#получение списка туров с фильтрацией
def list_tours(
        country_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        skip: int = Query(default=0, ge=0, description="Количество пропускаемых записей"),
        limit: Optional[int] = Query(default=None, ge=1, description="Максимальное количество записей"),
        db: Session = Depends(get_db),
):
    query = db.query(Tour)
    if country_id:
        query = query.filter(Tour.country_id == country_id)
    if min_price:
        query = query.filter(Tour.price >= min_price)
    if max_price:
        query = query.filter(Tour.price <= max_price)
    total = query.count()
    if limit is not None:
        tours = query.offset(skip).limit(limit).all()
    else:
        tours = query.all()
    tour_responses = [TourResponse.from_orm(tour) for tour in tours]
    return {"total": total, "items": tour_responses, "skip": skip, "limit": limit}

@router.put("/{tour_id}", response_model=TourResponse)#обновление информации о туре
def update_tour(tour_id: int, tour_data: TourBase, db: Session = Depends(get_db)):
    try:
        tour = db.query(Tour).filter(Tour.id == tour_id).first()
        if not tour:
            raise HTTPException(status_code=404, detail="Тур не найден")

        for key, value in tour_data.dict(exclude_unset=True).items():
            setattr(tour, key, value)

        db.commit()
        db.refresh(tour)
        return tour
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ошибка при обновлении тура. Проверьте корректность данных.")

@router.delete("/{tour_id}")#удаление тура
def delete_tour(tour_id: int, db: Session = Depends(get_db)):
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Тур не найден")

    try:
        db.delete(tour)
        db.commit()
        return {"message": "Тур успешно удален"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Невозможно удалить тур. Возможно, есть связанные бронирования.")