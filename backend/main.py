
import os
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pymongo import MongoClient, ASCENDING, DESCENDING

load_dotenv(Path(__file__).resolve().parent / ".env")

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI is missing from backend/.env")

client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=10000)
db = client["eduinsight"]
students = db["students"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    client.admin.command("ping")
    yield
    client.close()


app = FastAPI(
    title="EduInsight API",
    description="Student performance analytics backed by MongoDB",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://eduinsight-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize(student):
    student["_id"] = str(student["_id"])
    return student


def status_for_grade(grade):
    if grade < 10:
        return "At risk"
    if grade < 14:
        return "Developing"
    return "Good"


class StudentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    school: str = Field(default="GP", pattern="^(GP|MS)$")
    age: int = Field(ge=15, le=25)
    studyTime: int = Field(ge=1, le=4)
    absences: int = Field(ge=0, le=100)
    finalGrade: int = Field(ge=0, le=20)


@app.get("/")
def home():
    return {"message": "EduInsight API is running"}


@app.get("/api/health")
def health():
    client.admin.command("ping")
    return {"status": "connected", "database": "eduinsight"}


@app.get("/api/dashboard")
def dashboard():
    pipeline = [
        {
            "$group": {
                "_id": None,
                "totalStudents": {"$sum": 1},
                "averageGrade": {"$avg": "$finalGrade"},
                "averageAbsences": {"$avg": "$absences"},
                "atRisk": {
                    "$sum": {
                        "$cond": [{"$lt": ["$finalGrade", 10]}, 1, 0]
                    }
                }
            }
        }
    ]

    result = list(students.aggregate(pipeline))
    if not result:
        return {
            "totalStudents": 0,
            "averageGrade": 0,
            "averageAbsences": 0,
            "atRisk": 0
        }

    data = result[0]
    return {
        "totalStudents": data["totalStudents"],
        "averageGrade": round(data["averageGrade"] or 0, 2),
        "averageAbsences": round(data["averageAbsences"] or 0, 2),
        "atRisk": data["atRisk"]
    }


@app.get("/api/students")
def get_students(
    search: str = Query(default="", max_length=100),
    status: str = Query(default="All"),
    limit: int = Query(default=100, ge=1, le=500),
    skip: int = Query(default=0, ge=0)
):
    query = {}

    if search:
        query["$or"] = [
            {"studentId": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}},
            {"school": {"$regex": search, "$options": "i"}}
        ]

    if status != "All":
        if status not in ["At risk", "Developing", "Good"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        if status == "At risk":
            query["finalGrade"] = {"$lt": 10}
        elif status == "Developing":
            query["finalGrade"] = {"$gte": 10, "$lt": 14}
        else:
            query["finalGrade"] = {"$gte": 14}

    total = students.count_documents(query)
    results = students.find(query).sort("studentId", ASCENDING).skip(skip).limit(limit)

    return {
        "total": total,
        "students": [serialize(student) for student in results]
    }


@app.get("/api/analytics")
def analytics():
    grade_distribution = list(students.aggregate([
        {
            "$bucket": {
                "groupBy": "$finalGrade",
                "boundaries": [0, 10, 14, 18, 21],
                "default": "Other",
                "output": {"count": {"$sum": 1}}
            }
        }
    ]))

    study_performance = list(students.aggregate([
        {
            "$group": {
                "_id": "$studyTime",
                "averageGrade": {"$avg": "$finalGrade"},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]))

    return {
        "gradeDistribution": [
            {
                "range": {
                    0: "0–9",
                    10: "10–13",
                    14: "14–17",
                    18: "18–20"
                }.get(item["_id"], "Other"),
                "count": item["count"]
            }
            for item in grade_distribution
        ],
        "studyPerformance": [
            {
                "studyTime": item["_id"],
                "studyTimeLabel": {
                    1: "<2 hrs",
                    2: "2–5 hrs",
                    3: "5–10 hrs",
                    4: ">10 hrs"
                }.get(item["_id"], "Unknown"),
                "averageGrade": round(item["averageGrade"] or 0, 2),
                "count": item["count"]
            }
            for item in study_performance
        ]
    }


@app.post("/api/students", status_code=201)
def add_student(student: StudentCreate):
    count = students.count_documents({
        "studentId": {"$regex": "^NEW"}
    }) + 1

    study_labels = {
        1: "<2 hrs",
        2: "2–5 hrs",
        3: "5–10 hrs",
        4: ">10 hrs"
    }

    record = student.model_dump()
    record.update({
        "studentId": f"NEW{count:04d}",
        "studyTimeLabel": study_labels[student.studyTime],
        "status": status_for_grade(student.finalGrade),
        "source": "Faculty-created record"
    })

    students.insert_one(record)
    return serialize(students.find_one({"studentId": record["studentId"]}))


@app.delete("/api/students/{student_id}")
def delete_student(student_id: str):
    result = students.delete_one({
        "studentId": student_id,
        "source": "Faculty-created record"
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Student not found or dataset records cannot be deleted"
        )

    return {"message": "Student deleted", "studentId": student_id}
