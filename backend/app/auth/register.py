from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from backend.app.dependencies import get_db
from backend.app.models import User
from backend.app.schemas import RegisterRequest, LoginRequest, UserResponse, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    username = data.username
    password = data.password
    role = data.role
    try:
        print(f"Регистрация нового пользователя: {username}, роль: {role}")
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            print("Пользователь с таким именем уже существует.")
            raise HTTPException(status_code=400, detail="Имя пользователя уже занято.")

        hashed_password = bcrypt.hash(password)
        new_user = User(username=username, password_hash=hashed_password, role=role)
        db.add(new_user)
        db.commit()
        print(f"Пользователь {username} успешно зарегистрирован.")
        return {"message": "Пользователь успешно зарегистрирован"}
    except Exception as e:
        print("Ошибка при регистрации:", str(e))
        raise HTTPException(status_code=500, detail="Ошибка регистрации")

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    username = data.username
    password = data.password

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль.")
    if not bcrypt.verify(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль.")
    return {"message": f"Добро пожаловать, {username}!", "role": user.role}

@router.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    for key, value in data.dict(exclude_unset=True).items():
        if key == "password":
            value = bcrypt.hash(value)
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    db.delete(user)
    db.commit()
    return {"message": "Пользователь успешно удален"}
