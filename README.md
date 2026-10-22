# EduInsight — Student Performance Analytics System

EduInsight is a web-based student performance analytics application designed to explore student records, analyze academic performance, visualize educational data, and identify students who may be at academic risk.

The application uses React for the frontend, FastAPI for the backend, and MongoDB Atlas for cloud database storage.

## Live Deployment

- **Live Website:** https://eduinsight-frontend.onrender.com
- **Backend API:** https://eduinsight-api.onrender.com
- **API Health Check:** https://eduinsight-api.onrender.com/api/health
- **Interactive API Documentation:** https://eduinsight-api.onrender.com/docs

The frontend and backend are deployed on Render, and student data is stored in MongoDB Atlas.

## Features

- **Dashboard:** Displays key statistics about student performance.
- **Student Records:** View and manage student information.
- **Search and Filtering:** Find student records using available search and filter options.
- **Academic Analytics:** Visualize grade distributions and study-related performance patterns.
- **At-Risk Student Identification:** Identify students who may require additional academic support.
- **Student Management:** Add and delete student records.
- **CSV Export:** Export student records for further analysis.
- **Light and Dark Themes:** Switch between display themes.
- **Database Status:** View the application's database connection status.
- **Cloud Database:** Store student records using MongoDB Atlas.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Python, FastAPI |
| Database | MongoDB Atlas |
| Database Driver | PyMongo |
| Data Processing | Python |
| Dataset | UCI Student Performance Dataset |
| Deployment | Render |
| Version Control | Git, GitHub |

## System Architecture

EduInsight follows a frontend-backend-database architecture.

```text
                  User
                   |
                   v
       React + Vite Frontend
           (Render Static Site)
                   |
                   | HTTP Requests
                   v
          FastAPI Backend
           (Render Web Service)
                   |
                   | PyMongo
                   v
            MongoDB Atlas
             (Cloud Database)
```

### Application Workflow

1. The user opens the deployed website in a browser.
2. The React frontend sends HTTP requests to the FastAPI backend.
3. The backend processes requests and communicates with MongoDB Atlas.
4. The database returns the requested student records or stored data.
5. The backend returns responses to the frontend.
6. The frontend displays dashboard statistics, records, and visual analytics.

## Dataset

The project uses the **UCI Student Performance Dataset**, specifically the Mathematics student performance dataset.

The original dataset contains 395 student records and includes demographic, social, school-related, and academic information.

The application uses student performance data to demonstrate academic analytics, grade distributions, and the identification of students who may need additional support.

**Dataset source:** [UCI Machine Learning Repository — Student Performance](https://archive.ics.uci.edu/dataset/320/student+performance)

Note: The live database may contain additional records created through the application's student management features.

## API Endpoints

The backend exposes REST API endpoints for health checks, dashboard statistics, student records, and analytics.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend and database connectivity |
| GET | `/api/dashboard` | Retrieve dashboard statistics |
| GET | `/api/students` | Retrieve student records |
| POST | `/api/students` | Add a student record |
| DELETE | `/api/students/{student_id}` | Delete a student record |
| GET | `/api/analytics` | Retrieve academic analytics |

### Example Health Check

Open the following URL in a browser:

https://eduinsight-api.onrender.com/api/health

A successful response looks like this:

```json
{
  "status": "connected",
  "database": "eduinsight"
}
```

The response indicates that the backend can connect to the configured MongoDB database.

For request schemas and interactive API testing, visit:

https://eduinsight-api.onrender.com/docs

## Deployment on Render

EduInsight is deployed using two Render services.

### 1. Frontend — Static Site

- **Repository:** `theskymishra/EduInsight`
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

Frontend environment variable:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://eduinsight-api.onrender.com` |

### 2. Backend — Web Service

- **Repository:** `theskymishra/EduInsight`
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

Backend environment variable:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |

Environment variables should be configured through the Render dashboard.

## Local Installation and Setup

Follow these steps to run EduInsight on your local machine.

### Prerequisites

Install the following:

- Python 3.12 or another version compatible with the backend dependencies
- Node.js and npm
- Git
- A MongoDB Atlas account and database

### 1. Clone the Repository

```bash
git clone https://github.com/theskymishra/EduInsight.git
cd EduInsight
```

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a Python virtual environment on macOS or Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
```

Replace the example value with your actual MongoDB Atlas connection string. Ensure the database user has the required permissions and that network access is configured appropriately.

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

The backend will be available at:

http://localhost:8000

API documentation:

http://localhost:8000/docs

### 3. Configure the Frontend

Open a new terminal and navigate to the project directory:

```bash
cd eduinsight/frontend
```

Install frontend dependencies:

```bash
npm install
```

Create a `.env` file inside `frontend`:

```env
VITE_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

http://localhost:5173

### 4. Verify the Application

1. Open the frontend URL in your browser.
2. Confirm that the dashboard statistics and student records load.
3. Verify that the database status indicates a successful connection.
4. Test student creation, deletion, search, and analytics.

Keep both the backend and frontend development servers running while using the local application.

## Environment Variables and Security

- Never commit `.env` files or database credentials to GitHub.
- Keep `MONGODB_URI` configured as a secret environment variable.
- Use `.gitignore` to exclude `.env`, virtual environments, `node_modules`, and build output.
- Configure MongoDB Atlas network access to allow only appropriate connections wherever practical.
- Do not expose database credentials in frontend code.
- Review CORS settings before deploying the application to additional domains.

## Project Repository

GitHub repository:

https://github.com/theskymishra/EduInsight

## Author

**Akash Mishra**

EduInsight was developed as a student performance analytics project to demonstrate the application of web development, database management, REST APIs, and educational data analysis.

## License

No license has been specified for this repository. Unless a license is added, the project should not be assumed to grant permission for unrestricted reuse or redistribution.