
import os
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(Path(__file__).resolve().parent / ".env")

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI is missing from backend/.env")

CSV_PATH = BASE_DIR / "student-mat.csv"

client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
client.admin.command("ping")

db = client["eduinsight"]
students = db["students"]

df = pd.read_csv(CSV_PATH, sep=";")

def study_time_label(value):
    return {
        1: "<2 hrs",
        2: "2–5 hrs",
        3: "5–10 hrs",
        4: ">10 hrs"
    }.get(int(value), "Unknown")

def student_status(grade):
    if grade < 10:
        return "At risk"
    if grade < 14:
        return "Developing"
    return "Good"

records = []

for index, row in df.iterrows():
    grade = int(row["G3"])

    records.append({
        "studentId": f"STU{index + 1:04d}",
        "name": f"Student {index + 1:04d}",
        "school": str(row["school"]),
        "sex": str(row["sex"]),
        "age": int(row["age"]),
        "address": str(row["address"]),
        "studyTime": int(row["studytime"]),
        "studyTimeLabel": study_time_label(row["studytime"]),
        "absences": int(row["absences"]),
        "failures": int(row["failures"]),
        "G1": int(row["G1"]),
        "G2": int(row["G2"]),
        "finalGrade": grade,
        "status": student_status(grade),
        "source": "UCI Student Performance - Mathematics"
    })

students.create_index([("studentId", ASCENDING)], unique=True)

students.delete_many({"source": "UCI Student Performance - Mathematics"})

if records:
    students.insert_many(records)

print(f"Successfully imported {len(records)} student records.")
print(f"MongoDB database: {db.name}")
print(f"Collection: {students.name}")

client.close()
