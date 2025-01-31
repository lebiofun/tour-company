from passlib.hash import bcrypt

users = [
    ("user1", "user"),
    ("user2", "user"),
    ("user3", "user"),
    ("user4", "user"),
    ("user5", "user"),
    ("user6", "user"),
    ("user7", "user"),
    ("user8", "user"),
    ("admin1", "admin"),
    ("admin2", "admin"),
]

for username, role in users:
    hashed_password = bcrypt.hash(username)
    print(f"('{username}', '{hashed_password}', '{role}', NOW()),")
