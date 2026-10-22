# EduInsight — Academic Performance Analytics

EduInsight is a web-based student performance analytics system that helps faculty explore academic records, monitor student performance, and identify students who may need additional academic support. It uses React for the frontend, FastAPI for the backend, and MongoDB Atlas for data storage.

## Project Objectives

- Store and manage student academic records.
- Display student statistics through an interactive dashboard.
- Analyze final grades and study-time patterns.
- Search and filter students based on their records and performance.
- Support student record creation and eligible record deletion.
- Export student records to CSV.

## Features

- **Interactive Dashboard:** Displays total students, average final grade, students below the grade threshold, and average absences.
- **Student Records:** View, search, and filter student records.
- **Academic Analytics:** Visualize grade distributions and study-time performance.
- **Database Integration:** Connect to MongoDB Atlas to store and retrieve records.
- **Student Management:** Add student records and delete eligible faculty-created records.
- **CSV Export:** Export the displayed student records.
- **Theme Toggle:** Switch between light and dark modes.
- **Responsive Interface:** Provides a sidebar-based dashboard interface.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React |
| Frontend tooling | Vite |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Python, FastAPI |
| Database | MongoDB Atlas |
| API communication | HTTP/JSON |

## Project Structure

```text
eduinsight/
├── README.md
├── backend/
│   ├── main.py
│   ├── import_data.py
│   ├── .env
│   └── .venv/
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   ├── api.js
    │   └── main.jsx
    ├── package.json
    └── index.html
```

## Database Design

EduInsight uses MongoDB Atlas with the database `eduinsight` and the collection `students`.

Student documents include fields such as:

| Field | Description |
|---|---|
| `studentId` | Student identifier |
| `name` | Student name |
| `school` | School identifier |
| `age` | Student age |
| `studyTime` | Study-time category |
| `absences` | Number of absences |
| `G1` | First-period grade, when available |
| `G2` | Second-period grade, when available |
| `finalGrade` | Final grade |
| `status` | Academic performance category |
| `source` | Record source |

The collection supports student retrieval, filtering, creation, and eligible deletion. Aggregation operations are used to calculate dashboard statistics and summarize academic performance.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend welcome response |
| GET | `/api/health` | Check database connectivity |
| GET | `/api/dashboard` | Retrieve dashboard statistics |
| GET | `/api/students` | Retrieve and filter student records |
| GET | `/api/analytics` | Retrieve academic analytics |
| POST | `/api/students` | Create a student record |
| DELETE | `/api/students/{student_id}` | Delete eligible faculty-created records |

## Installation and Setup

### Prerequisites

- Python installed
- Node.js and npm installed
- A MongoDB Atlas account and configured database connection

### 1. Configure the backend

Open Terminal and navigate to the backend:

```bash
cd ~/eduinsight/backend
```

Activate the virtual environment:

```bash
source .venv/bin/activate
```

Ensure your `.env` file contains your MongoDB connection string:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
```

Replace the placeholder with your actual connection string. Do not commit `.env` or expose database credentials publicly.

### 2. Start the backend

```bash
uvicorn main:app --reload --port 8000
```

The backend runs at:

`http://localhost:8000`

Interactive API documentation is available at:

`http://localhost:8000/docs`

### 3. Start the frontend

Open a second Terminal window:

```bash
cd ~/eduinsight/frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

### 4. Import the dataset

If the database has not yet been populated, follow the project's dataset import procedure:

```bash
cd ~/eduinsight/backend
source .venv/bin/activate
python import_data.py
```

Run the import only when necessary and follow the script's behavior to avoid duplicate records.

## How to Use EduInsight

1. Open the dashboard to review student statistics.
2. Navigate to Student Records to browse, search, and filter records.
3. Add a student using the student creation form.
4. Export filtered records using the CSV export option.
5. Open Analytics to explore grade distributions and study-time performance.
6. Open Database to review the database connection status and supported operations.
7. Use the theme toggle to switch between light and dark modes.

## Dataset

The project uses the UCI Student Performance dataset, which contains student demographic, study-related, and academic performance attributes. The mathematics dataset contains 395 records.

Dataset reference: https://archive.ics.uci.edu/dataset/320/student+performance

## Future Enhancements

- User authentication and role-based access control.
- More advanced student performance reports.
- Additional visualizations and downloadable reports.
- Improved input validation and automated testing.
- Deployment of the frontend and backend to hosted environments.

## Author

Developed as a Database Systems academic project.

## License

This project is intended for educational and academic use.
