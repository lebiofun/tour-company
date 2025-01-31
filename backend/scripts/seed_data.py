from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from passlib.hash import bcrypt

# Добавление тестовых данных
def seed_data():
    db: Session = SessionLocal()

    try:
        # Добавляем администратора
        admin = User(
            username="admin",
            password_hash=bcrypt.hash("admin123"),
            role="admin"
        )
        db.add(admin)
        db.commit()
        print("Тестовые данные добавлены успешно!")
    except Exception as e:
        db.rollback()
        print("Ошибка при добавлении тестовых данных:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
