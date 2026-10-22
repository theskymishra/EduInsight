const API_URL = "http://localhost:8000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json();
}

export async function getDashboard() {
  return request("/dashboard");
}

export async function getStudents(search = "", status = "All") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status !== "All") params.set("status", status);

  const result = await request(`/students?${params.toString()}`);
  return result.students ?? result;
}

export async function getAnalytics() {
  return request("/analytics");
}

export async function checkDatabase() {
  return request("/health");
}

export async function createStudent(student) {
  return request("/students", {
    method: "POST",
    body: JSON.stringify(student),
  });
}

export async function removeStudent(studentId) {
  return request(`/students/${encodeURIComponent(studentId)}`, {
    method: "DELETE",
  });
}