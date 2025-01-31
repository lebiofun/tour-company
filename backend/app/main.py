from fastapi import FastAPI
from auth.register import router as auth_router
from routers.clients import router as clients_router
from routers.countries import router as countries_router
from routers.tours import router as tours_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(auth_router)
app.include_router(countries_router)
app.include_router(tours_router)
app.include_router(clients_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)