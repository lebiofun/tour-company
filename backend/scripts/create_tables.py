from app.database import Base, engine
from app.models import User
def create_tables():
    print("Создание таблиц в базе данных...")
    Base.metadata.create_all(bind=engine)
    print("Таблицы созданы успешно!")

if __name__ == "__main__":
    create_tables()
