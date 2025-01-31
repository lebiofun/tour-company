from app.database import Base, engine
def drop_tables():
    print("Удаление таблиц из базы данных...")
    Base.metadata.drop_all(bind=engine)
    print("Таблицы удалены успешно!")

if __name__ == "__main__":
    drop_tables()
