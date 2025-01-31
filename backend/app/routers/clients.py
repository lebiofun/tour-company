from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.app.models import Client
from backend.app.schemas import ClientCreate, ClientResponse, ClientUpdate
from backend.app.dependencies import get_db
router = APIRouter(prefix="/clients", tags=["Clients"])

@router.post("/", response_model=ClientResponse)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    try:
        db_client = Client(**client.dict())
        db.add(db_client)
        db.commit()
        db.refresh(db_client)
        return db_client
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ошибка при создании клиента. Возможно, email уже существует.")

@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    return client

@router.get("/", response_model=dict)
def get_clients(
        skip: int = Query(default=0, ge=0, description="Количество пропускаемых записей"),
        limit: int = Query(default=10, ge=1, le=100, description="Максимальное количество записей"),
        db: Session = Depends(get_db)
):
    query = db.query(Client)
    total = query.count()
    clients = query.offset(skip).limit(limit).all()
    client_responses = [ClientResponse.from_orm(client) for client in clients]
    return {"total": total, "items": client_responses, "skip": skip, "limit": limit}

@router.put("/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, client_update: ClientUpdate, db: Session = Depends(get_db)):
    try:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Клиент не найден")
        for key, value in client_update.dict(exclude_unset=True).items():
            setattr(client, key, value)
        db.commit()
        db.refresh(client)
        return client
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Ошибка при обновлении клиента. Возможно, email уже существует.")


@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    try:
        db.delete(client)
        db.commit()
        return {"message": "Клиент успешно удален"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Невозможно удалить клиента. Возможно, есть связанные бронирования.")
