
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ChartNoAxesCombined,
  Database,
  Search,
  Bell,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  UserRound,
  Plus,
  ChevronDown,
  ArrowUpRight,
  Menu,
  X,
  BookOpen,
  CalendarDays,
  Download,
  RefreshCw,
  Trash2,
  Activity,
  Sun,
  Moon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getDashboard,
  getStudents,
  getAnalytics,
  checkDatabase,
  createStudent,
  removeStudent,
} from "./api";
import "./App.css";

const gradeColors = ["#e7a35c", "#6d8ef0", "#41b69a", "#8a76db"];

const studyLabels = {
  1: "<2 hrs",
  2: "2–5 hrs",
  3: "5–10 hrs",
  4: ">10 hrs",
};

function normalizeStudent(student) {
  return {
    ...student,
    student_id: String(
      student.studentId ?? student.student_id ?? student._id ?? "Unknown"
    ),
    name: student.name ?? "Student",
    school: student.school ?? "—",
    age: Number(student.age ?? 0),
    studytime: Number(student.studyTime ?? student.studytime ?? 0),
    studytimeLabel:
      student.studyTimeLabel ??
      student.studytimeLabel ??
      studyLabels[Number(student.studyTime ?? student.studytime)] ??
      "—",
    absences: Number(student.absences ?? 0),
    G3: Number(student.finalGrade ?? student.G3 ?? 0),
    status:
      student.status ??
      (Number(student.finalGrade ?? student.G3 ?? 0) < 10
        ? "At risk"
        : Number(student.finalGrade ?? student.G3 ?? 0) < 14
          ? "Developing"
          : "Good"),
    source: student.source ?? "",
  };
}

function App() {
  const [page, setPage] = useState("Dashboard");
  const [students, setStudents] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState("Checking...");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [darkMode, setDarkMode] = useState(
  () => localStorage.getItem("eduinsight-theme") === "dark"
);

useEffect(() => {
  document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  localStorage.setItem("eduinsight-theme", darkMode ? "dark" : "light");
}, [darkMode]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [studentData, dashboardData, analyticsData, healthData] =
        await Promise.all([
          getStudents(),
          getDashboard(),
          getAnalytics(),
          checkDatabase(),
        ]);

      setStudents(studentData.map(normalizeStudent));
      setDashboard(dashboardData);
      setAnalytics(analyticsData);
      setDatabaseStatus(healthData.status ?? "Connected");
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the backend. Check that FastAPI is running."
      );
      setDatabaseStatus("Disconnected");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const average =
    dashboard?.averageGrade ??
    (students.length
      ? students.reduce((sum, student) => sum + student.G3, 0) /
        students.length
      : 0);

  const belowTen =
    dashboard?.atRisk ??
    students.filter((student) => student.G3 < 10).length;

  const averageAbsences =
    dashboard?.averageAbsences ??
    (students.length
      ? students.reduce((sum, student) => sum + student.absences, 0) /
        students.length
      : 0);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch = [
        student.student_id,
        student.name,
        student.school,
      ].some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus =
        gradeFilter === "All" ||
        (gradeFilter === "At risk" && student.G3 < 10) ||
        (gradeFilter === "Developing" &&
          student.G3 >= 10 &&
          student.G3 < 14) ||
        (gradeFilter === "Good" && student.G3 >= 14);

      return matchesSearch && matchesStatus;
    });
  }, [students, search, gradeFilter]);

  const gradeDistribution = useMemo(() => {
    if (analytics?.gradeDistribution?.length) {
      return analytics.gradeDistribution.map((item) => ({
        name: item.name ?? item.range ?? item.gradeRange ?? "Other",
        count: Number(item.count ?? item.students ?? item.total ?? 0),
      }));
    }

    return [
      { name: "0–9", count: students.filter((s) => s.G3 < 10).length },
      {
        name: "10–13",
        count: students.filter((s) => s.G3 >= 10 && s.G3 < 14).length,
      },
      {
        name: "14–17",
        count: students.filter((s) => s.G3 >= 14 && s.G3 < 18).length,
      },
      { name: "18–20", count: students.filter((s) => s.G3 >= 18).length },
    ];
  }, [analytics, students]);

  const studyData = useMemo(() => {
    if (analytics?.studyPerformance?.length) {
      return analytics.studyPerformance.map((item) => ({
        name:
          item.name ??
          item.studyTimeLabel ??
          studyLabels[Number(item.studyTime ?? item.studytime)] ??
          "Study group",
        average: Number(
          item.average ?? item.averageGrade ?? item.avgGrade ?? 0
        ),
      }));
    }

    return [1, 2, 3, 4].map((time) => {
      const group = students.filter((s) => s.studytime === time);
      return {
        name: studyLabels[time],
        average: group.length
          ? Number(
              (
                group.reduce((sum, student) => sum + student.G3, 0) /
                group.length
              ).toFixed(1)
            )
          : 0,
      };
    });
  }, [analytics, students]);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Student Records", icon: Users },
    { label: "Analytics", icon: ChartNoAxesCombined },
    { label: "Database", icon: Database },
  ];

  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  async function addStudent(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const student = {
      name: String(form.get("name") ?? "").trim(),
      school: String(form.get("school") ?? "GP"),
      age: Number(form.get("age")),
      studyTime: Number(form.get("studyTime")),
      absences: Number(form.get("absences")),
      finalGrade: Number(form.get("finalGrade")),
    };

    if (!student.name) {
      notify("Please enter the student's name.");
      return;
    }

    setSaving(true);

    try {
      await createStudent(student);
      formElement.reset();
      setShowForm(false);
      await loadData();
      setPage("Student Records");
      notify("Student record saved to MongoDB successfully.");
    } catch (err) {
      notify(`Could not add student: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(student) {
    if (
      !window.confirm(
        `Delete ${student.name} (${student.student_id})? Only eligible faculty-created records can be deleted.`
      )
    ) {
      return;
    }

    try {
      await removeStudent(student.student_id);
      await loadData();
      notify("Student record deleted.");
    } catch (err) {
      notify(`Could not delete record: ${err.message}`);
    }
  }

  function exportCsv() {
    const columns = [
      ["studentId", "student_id"],
      ["name", "name"],
      ["school", "school"],
      ["age", "age"],
      ["studyTime", "studytime"],
      ["absences", "absences"],
      ["finalGrade", "G3"],
      ["status", "status"],
    ];

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      columns.map(([heading]) => heading).join(","),
      ...filteredStudents.map((student) =>
        columns.map(([, key]) => escapeCsv(student[key])).join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "eduinsight-students.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const attentionStudents = students
    .filter((student) => student.G3 < 10)
    .slice(0, 5);

  return (
    <div className={`app-shell ${darkMode ? "dark-mode" : "light-mode"}`}>
      {mobileMenu && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <GraduationCap size={25} />
          </div>
          <div>
            <div className="brand-name">eduinsight</div>
            <div className="brand-caption">ACADEMIC ANALYTICS</div>
          </div>
          <button
            className="mobile-close"
            aria-label="Close menu"
            onClick={() => setMobileMenu(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${page === label ? "active" : ""}`}
              onClick={() => {
                setPage(label);
                setMobileMenu(false);
              }}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{label}</span>
              {label === "Student Records" && (
                <span className="nav-count">{students.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <BookOpen size={18} />
            </div>
            <strong>Academic insights</strong>
            <p>Make better decisions with data-driven insights.</p>
          </div>
          <div className="profile">
            <div className="avatar">F</div>
            <div className="profile-info">
              <strong>Faculty Portal</strong>
              <span>Academic overview</span>
            </div>
            <ChevronDown size={16} className="profile-chevron" />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={22} />
          </button>
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{page}</strong>
          </div>
          <div className="topbar-actions">
            <button
                className="theme-toggle"
                onClick={() => setDarkMode((current) => !current)}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{darkMode ? "Light mode" : "Dark mode"}</span>
              </button>
            <div className="dataset-status">
              <span
                style={{
                  background:
                    databaseStatus === "Disconnected" ? "#e66b6b" : "#41b69a",
                }}
              />
              {databaseStatus === "connected" ||
              databaseStatus === "Connected"
                ? "MongoDB connected"
                : databaseStatus === "Disconnected"
                  ? "Database offline"
                  : "Database checking"}
            </div>
            <button
              className="icon-button notification-button"
              aria-label="Refresh data"
              onClick={loadData}
              title="Refresh data"
            >
              <RefreshCw size={18} />
            </button>
            <div className="top-avatar">F</div>
          </div>
        </header>

        <div className="page-content">
          {notice && <div className="notice">{notice}</div>}

          {error && (
            <div className="notice" role="alert">
              {error}
              <button
                className="text-button"
                onClick={loadData}
                style={{ marginLeft: 12 }}
              >
                Retry
              </button>
            </div>
          )}

          {loading && students.length === 0 && (
            <div className="panel loading-panel">
              <RefreshCw size={20} />
              <span>Loading records from MongoDB...</span>
            </div>
          )}

          {page === "Dashboard" && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">
                    <CalendarDays size={14} /> ACADEMIC OVERVIEW
                  </div>
                  <h1>
                    Good morning, Faculty <span>✦</span>
                  </h1>
                  <p>
                    Here&apos;s what&apos;s happening with your student
                    performance.
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    setPage("Student Records");
                    setShowForm(true);
                  }}
                >
                  <Plus size={17} /> Add student
                </button>
              </section>

              <section className="metric-grid">
                <MetricCard
                  title="Total students"
                  value={dashboard?.totalStudents ?? students.length}
                  icon={Users}
                  color="blue"
                  detail="Records in MongoDB"
                />
                <MetricCard
                  title="Average final grade"
                  value={`${Number(average).toFixed(1)}/20`}
                  icon={TrendingUp}
                  color="green"
                  detail="Across all student records"
                />
                <MetricCard
                  title="Below grade 10"
                  value={belowTen}
                  icon={TrendingDown}
                  color="orange"
                  detail="May need additional support"
                />
                <MetricCard
                  title="Average absences"
                  value={Number(averageAbsences).toFixed(1)}
                  icon={CalendarDays}
                  color="purple"
                  detail="Absences per student"
                />
              </section>

              <section className="chart-grid">
                <div className="panel grade-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Grade distribution</h2>
                      <p>Students grouped by final grade</p>
                    </div>
                    <span className="chart-badge">G3 · /20</span>
                  </div>
                  <div className="chart-area">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={gradeDistribution}
                        barSize={35}
                        margin={{ top: 12, right: 8, left: -22, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#edf0f5"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#858da0", fontSize: 12 }}
                          dy={9}
                        />
                        <YAxis
                          allowDecimals={false}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#858da0", fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{ fill: "#f5f7fc" }}
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #edf0f5",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          name="Students"
                          fill="#5578ed"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-footnote">
                    <span className="legend-dot" />
                    Number of students in each grade range
                  </div>
                </div>

                <div className="panel study-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Study time vs performance</h2>
                      <p>Average final grade by weekly study time</p>
                    </div>
                    <span className="soft-icon">
                      <ChartNoAxesCombined size={18} />
                    </span>
                  </div>
                  <div className="chart-area">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={studyData}
                        barSize={30}
                        margin={{ top: 12, right: 8, left: -22, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#edf0f5"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#858da0", fontSize: 11 }}
                          dy={9}
                        />
                        <YAxis
                          domain={[0, 20]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#858da0", fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #edf0f5",
                          }}
                        />
                        <Bar
                          dataKey="average"
                          name="Average grade"
                          fill="#40b89a"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-footnote">
                    <span className="legend-dot green-dot" />
                    Average grade on a 20-point scale
                  </div>
                </div>
              </section>

              <section className="panel recent-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Students requiring attention</h2>
                    <p>Students with a final grade below 10</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => {
                      setPage("Student Records");
                      setGradeFilter("At risk");
                    }}
                  >
                    View all <ArrowUpRight size={15} />
                  </button>
                </div>
                <StudentTable students={attentionStudents} />
                {belowTen === 0 && (
                  <div className="empty-state">
                    No students currently meet this criterion.
                  </div>
                )}
              </section>
            </>
          )}

          {page === "Student Records" && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">DATA MANAGEMENT</div>
                  <h1>Student records</h1>
                  <p>Search, filter and review academic records.</p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setShowForm(!showForm)}
                >
                  <Plus size={17} /> Add student
                </button>
              </section>

              {showForm && (
                <form className="panel student-form" onSubmit={addStudent}>
                  <div className="panel-heading">
                    <div>
                      <h2>New student record</h2>
                      <p>
                        Enter the student&apos;s details to save them in
                        MongoDB.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Close form"
                      onClick={() => setShowForm(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="form-grid">
                    <label>
                      Student name
                      <input
                        name="name"
                        type="text"
                        placeholder="Enter full name"
                        maxLength={100}
                        required
                      />
                    </label>
                    <label>
                      School
                      <select name="school" defaultValue="GP">
                        <option value="GP">GP</option>
                        <option value="MS">MS</option>
                      </select>
                    </label>
                    <label>
                      Age
                      <input
                        name="age"
                        type="number"
                        min="15"
                        max="25"
                        defaultValue="18"
                        required
                      />
                    </label>
                    <label>
                      Study time
                      <select name="studyTime" defaultValue="2">
                        <option value="1">Less than 2 hours</option>
                        <option value="2">2–5 hours</option>
                        <option value="3">5–10 hours</option>
                        <option value="4">More than 10 hours</option>
                      </select>
                    </label>
                    <label>
                      Absences
                      <input
                        name="absences"
                        type="number"
                        min="0"
                        defaultValue="0"
                        required
                      />
                    </label>
                    <label>
                      Final grade (0–20)
                      <input
                        name="finalGrade"
                        type="number"
                        min="0"
                        max="20"
                        step="1"
                        defaultValue="10"
                        required
                      />
                    </label>
                  </div>
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save record"}
                  </button>
                </form>
              )}

              <section className="panel records-panel">
                <div className="records-toolbar">
                  <div className="search-box">
                    <Search size={17} />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search student ID, name or school..."
                    />
                  </div>
                  <select
                    className="filter-select"
                    value={gradeFilter}
                    onChange={(event) => setGradeFilter(event.target.value)}
                    aria-label="Filter by performance"
                  >
                    <option>All</option>
                    <option>At risk</option>
                    <option>Developing</option>
                    <option>Good</option>
                  </select>
                  <button className="secondary-button" onClick={exportCsv}>
                    <Download size={16} /> Export CSV
                  </button>
                </div>
                <div className="records-summary">
                  Showing <strong>{filteredStudents.length}</strong> of{" "}
                  {students.length} records
                </div>
                <StudentTable
                  students={filteredStudents}
                  onDelete={deleteStudent}
                />
              </section>
            </>
          )}

          {page === "Analytics" && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">PERFORMANCE REPORTS</div>
                  <h1>Academic analytics</h1>
                  <p>
                    Explore grade patterns using the live student dataset.
                  </p>
                </div>
              </section>

              <section className="metric-grid">
                <MetricCard
                  title="Highest grade"
                  value={
                    students.length
                      ? Math.max(...students.map((s) => s.G3))
                      : "—"
                  }
                  icon={TrendingUp}
                  color="green"
                  detail="Maximum final grade"
                />
                <MetricCard
                  title="Lowest grade"
                  value={
                    students.length
                      ? Math.min(...students.map((s) => s.G3))
                      : "—"
                  }
                  icon={TrendingDown}
                  color="orange"
                  detail="Minimum final grade"
                />
                <MetricCard
                  title="Students assessed"
                  value={dashboard?.totalStudents ?? students.length}
                  icon={Users}
                  color="blue"
                  detail="Available records"
                />
                <MetricCard
                  title="Pass threshold"
                  value="10/20"
                  icon={GraduationCap}
                  color="purple"
                  detail="Project-defined threshold"
                />
              </section>

              <section className="chart-grid">
                <div className="panel grade-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Grade distribution</h2>
                      <p>Student count by grade band</p>
                    </div>
                  </div>
                  <div className="chart-area tall-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gradeDistribution}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={55}
                          paddingAngle={4}
                        >
                          {gradeDistribution.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={gradeColors[index % gradeColors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="pie-legend">
                    {gradeDistribution.map((grade, index) => (
                      <span key={grade.name}>
                        <i
                          style={{
                            background:
                              gradeColors[index % gradeColors.length],
                          }}
                        />
                        {grade.name}: {grade.count}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="panel study-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Study time comparison</h2>
                      <p>Average grade by study category</p>
                    </div>
                  </div>
                  <div className="chart-area tall-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={studyData}
                        margin={{ top: 16, right: 8, left: -18, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#edf0f5"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#858da0", fontSize: 11 }}
                        />
                        <YAxis
                          domain={[0, 20]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#858da0", fontSize: 12 }}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="average"
                          name="Average grade"
                          fill="#5578ed"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            </>
          )}

          {page === "Database" && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">DATABASE MANAGEMENT</div>
                  <h1>Database overview</h1>
                  <p>Inspect the project database and collection.</p>
                </div>
                <button className="secondary-button" onClick={loadData}>
                  <RefreshCw size={16} /> Refresh
                </button>
              </section>

              <section className="metric-grid">
                <MetricCard
                  title="Database"
                  value="eduinsight"
                  icon={Database}
                  color="blue"
                  detail="MongoDB database name"
                />
                <MetricCard
                  title="Collection"
                  value="students"
                  icon={Users}
                  color="green"
                  detail="Primary collection"
                />
                <MetricCard
                  title="Documents"
                  value={dashboard?.totalStudents ?? students.length}
                  icon={BookOpen}
                  color="purple"
                  detail="Student records"
                />
                <MetricCard
                  title="Connection"
                  value={
                    databaseStatus === "connected" ||
                    databaseStatus === "Connected"
                      ? "Online"
                      : databaseStatus === "Disconnected"
                        ? "Offline"
                        : databaseStatus
                  }
                  icon={Activity}
                  color={
                    databaseStatus === "Disconnected" ? "orange" : "green"
                  }
                  detail="Backend health check"
                />
              </section>

              <section className="panel database-info">
                <div className="panel-heading">
                  <div>
                    <h2>Database features</h2>
                    <p>Operations available in EduInsight</p>
                  </div>
                </div>
                {[
                  [
                    "Document storage",
                    "Student records are stored as MongoDB documents.",
                  ],
                  [
                    "Read and filtering",
                    "Search student IDs, names and schools, then filter by performance.",
                  ],
                  [
                    "Aggregation",
                    "Calculate grade averages and summarize academic performance.",
                  ],
                  [
                    "Create records",
                    "Add student records through the web interface.",
                  ],
                  [
                    "Delete records",
                    "Delete eligible faculty-created records through the API.",
                  ],
                ].map(([title, description]) => (
                  <div className="db-feature" key={title}>
                    <div className="db-feature-icon">
                      <Database size={18} />
                    </div>
                    <div>
                      <strong>{title}</strong>
                      <p>{description}</p>
                    </div>
                    <span className="feature-status">Implemented</span>
                  </div>
                ))}
                <p className="db-disclaimer">
                  Connection status is checked against the live backend.
                </p>
              </section>
            </>
          )}

          <footer className="footer">
            <span>© 2026 EduInsight</span>
            <span>
              <span className="footer-dot" /> Academic Performance Analytics
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, detail }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <div className={`metric-icon ${color}`}>
          <Icon size={19} />
        </div>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
    </div>
  );
}

function StudentTable({ students, onDelete }) {
  if (!students.length) {
    return (
      <div className="empty-state">
        No matching student records found.
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="student-table">
        <thead>
          <tr>
            <th>STUDENT</th>
            <th>SCHOOL</th>
            <th>AGE</th>
            <th>STUDY TIME</th>
            <th>ABSENCES</th>
            <th>FINAL GRADE</th>
            <th>STATUS</th>
            {onDelete && <th>ACTION</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const statusClass =
              student.G3 < 10
                ? "risk"
                : student.G3 < 14
                  ? "developing"
                  : "good";

            return (
              <tr key={student.student_id}>
                <td>
                  <div className="student-cell">
                    <div className="student-avatar">
                      <UserRound size={16} />
                    </div>
                    <div>
                      <strong>{student.name}</strong>
                      <div className="student-id">
                        {student.student_id}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{student.school}</td>
                <td>{student.age || "—"}</td>
                <td>{student.studytimeLabel}</td>
                <td>{student.absences}</td>
                <td>
                  <strong className="grade-number">{student.G3}/20</strong>
                </td>
                <td>
                  <span className={`status-pill ${statusClass}`}>
                    {student.G3 < 10
                      ? "At risk"
                      : student.G3 < 14
                        ? "Developing"
                        : "Good"}
                  </span>
                </td>
                {onDelete && (
                  <td>
                    <button
                      type="button"
                      className="icon-button"
                      title="Delete eligible faculty-created record"
                      aria-label={`Delete ${student.student_id}`}
                      onClick={() => onDelete(student)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
