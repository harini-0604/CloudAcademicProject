import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [loginType, setLoginType] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [facultyLoggedIn, setFacultyLoggedIn] = useState(false);

  // Logged-in user information
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState("");

  const [projects, setProjects] = useState([]);
  const [studentProjects, setStudentProjects] = useState([]);
  const [showFacultyProjects, setShowFacultyProjects] = useState(false);
  const [showSubmittedOnly, setShowSubmittedOnly] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  // =========================
  // LOGIN STATES
  // =========================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // =========================
  // PLAGIARISM STATES
  // =========================

  const [selectedFile, setSelectedFile] = useState(null);
  const [plagiarismResult, setPlagiarismResult] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [plagiarismReports, setPlagiarismReports] = useState([]);
  const [showPlagiarismReports, setShowPlagiarismReports] = useState(false);

  // =========================
  // PROJECT FORM
  // =========================

  const [project, setProject] = useState({
    title: "",
    domain: "",
    abstract: "",
    teamMembers: "",
    guide: "",
    department: "",
    academicYear: "",
  });

  // =========================
  // FETCH PROJECTS
  // =========================

  useEffect(() => {
    if (facultyLoggedIn || loggedIn) {
      fetchProjects();
    }
  }, [facultyLoggedIn, loggedIn, currentUserId]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`);

      if (!response.ok) {
        console.error("Projects API error:", response.status);
        return;
      }

      const data = await response.json();

      setProjects(data);

      // Student sees only their own projects
      if (loggedIn && currentUserId !== null) {
        const ownProjects = data.filter(
          (item) =>
            Number(item.user_id) === Number(currentUserId)
        );

        setStudentProjects(ownProjects);
      } else {
        setStudentProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async () => {
    if (!loginType) {
      alert("Please select Student Login or Faculty Login.");
      return;
    }

    if (!username.trim() || !password.trim()) {
      alert("Please enter username and password.");
      return;
    }

    setLoggingIn(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
          role: loginType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUserId(data.user_id);
        setCurrentUsername(data.username);

        if (loginType === "Student") {
          setLoggedIn(true);
          setFacultyLoggedIn(false);
        }

        if (loginType === "Faculty") {
          setFacultyLoggedIn(true);
          setLoggedIn(false);
        }

        setUsername("");
        setPassword("");
      } else {
        const errorMessage =
          typeof data.detail === "string"
            ? data.detail
            : "Invalid username, password, or role.";

        alert(errorMessage);
      }
    } catch (error) {
      console.error("LOGIN CONNECTION ERROR:", error);

      alert(
        "Frontend could not connect to FastAPI.\n\n" +
        "Please make sure FastAPI is running at:\n" +
        API_URL
      );
    } finally {
      setLoggingIn(false);
    }
  };

  // =========================
  // UPDATE PROJECT STATUS
  // =========================

  const updateProjectStatus = async (projectId, status) => {
    try {
      const response = await fetch(
        `${API_URL}/projects/${projectId}/status?status=${encodeURIComponent(
          status
        )}`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchProjects();
      } else {
        alert(
          data.detail ||
            data.message ||
            "Failed to update project status."
        );
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("Unable to connect to backend.");
    }
  };

  // =========================
  // SUBMIT PROJECT
  // =========================

  const submitProject = async (projectId) => {
    try {
      const response = await fetch(
        `${API_URL}/projects/${projectId}/submit`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchProjects();
      } else {
        alert(
          data.detail ||
            data.message ||
            "Failed to submit project."
        );
      }
    } catch (error) {
      console.error("Project submission error:", error);
      alert("Unable to connect to backend.");
    }
  };

  // =========================
  // PLAGIARISM CHECKER
  // =========================

  const handlePlagiarismCheck = async (projectId) => {
    if (!selectedFile) {
      alert("Please select a PDF or DOCX file.");
      return;
    }

    const fileExtension =
      "." +
      selectedFile.name.split(".").pop().toLowerCase();

    if (![".pdf", ".docx"].includes(fileExtension)) {
      alert("Only PDF and DOCX files are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploadingFile(true);
    setPlagiarismResult(null);

    try {
      const response = await fetch(
        `${API_URL}/plagiarism/upload/${projectId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPlagiarismResult(data);
      } else {
        alert(
          data.detail ||
            "Plagiarism check failed."
        );
      }
    } catch (error) {
      console.error("Plagiarism error:", error);
      alert("Unable to connect to backend.");
    } finally {
      setUploadingFile(false);
    }
  };

  // =========================
  // FETCH PLAGIARISM REPORTS
  // =========================

  const fetchPlagiarismReports = async () => {
    try {
      const response = await fetch(
        `${API_URL}/plagiarism/reports`
      );

      const data = await response.json();

      if (response.ok) {
        setPlagiarismReports(data);
        setShowPlagiarismReports(true);
      } else {
        alert(
          data.detail ||
            "Failed to fetch plagiarism reports."
        );
      }
    } catch (error) {
      console.error("Report fetch error:", error);
      alert("Unable to connect to backend.");
    }
  };

  // =========================
  // PROJECT FORM
  // =========================

  const handleProjectChange = (e) => {
    setProject({
      ...project,
      [e.target.name]: e.target.value,
    });
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();

    if (currentUserId === null) {
      alert("User session not found. Please login again.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: project.title,
          domain: project.domain,
          abstract: project.abstract,
          team_members: project.teamMembers,
          guide: project.guide,
          department: project.department,
          academic_year: project.academicYear,
          user_id: currentUserId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `Project created successfully! Project ID: ${data.project_id}`
        );

        setProject({
          title: "",
          domain: "",
          abstract: "",
          teamMembers: "",
          guide: "",
          department: "",
          academicYear: "",
        });

        setShowProjectForm(false);

        await fetchProjects();
      } else {
        alert(
          data.detail ||
            data.message ||
            "Failed to create project."
        );

        console.log("Project creation error:", data);
      }
    } catch (error) {
      console.error("Project creation connection error:", error);

      alert(
        "Unable to connect to the backend.\n\n" +
        "Make sure FastAPI is running at:\n" +
        API_URL
      );
    }
  };

  // =========================
  // STATUS BADGE
  // =========================

  const getStatusClass = (status) => {
    if (status === "Approved") {
      return "status-badge approved";
    }

    if (status === "Rejected") {
      return "status-badge rejected";
    }

    return "status-badge pending";
  };

  // =========================
  // FACULTY DASHBOARD
  // =========================

  if (facultyLoggedIn) {
    const displayedFacultyProjects = showSubmittedOnly
      ? projects.filter(
          (item) =>
            item.submission_status === "Submitted"
        )
      : projects;

    return (
      <div className="app-container">

        <div className="dashboard-header">
          <div>
            <p className="eyebrow">ACADEMIC MANAGEMENT</p>
            <h1>Faculty Dashboard</h1>
            <p className="subtitle">
              Review and manage student academic projects.
            </p>
          </div>
        </div>

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-number">
              {projects.length}
            </div>
            <div className="stat-label">
              Total Projects
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {
                projects.filter(
                  (item) =>
                    item.status === "Pending"
                ).length
              }
            </div>
            <div className="stat-label">
              Pending Reviews
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {
                projects.filter(
                  (item) =>
                    item.status === "Approved"
                ).length
              }
            </div>
            <div className="stat-label">
              Approved Projects
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-number">
              {
                projects.filter(
                  (item) =>
                    item.status === "Rejected"
                ).length
              }
            </div>
            <div className="stat-label">
              Rejected Projects
            </div>
          </div>

        </div>

        <div className="section-card">

          <h2>Faculty Actions</h2>

          <p className="section-description">
            Manage student projects, submissions and
            plagiarism reports.
          </p>

          <div className="button-group">

            <button
              onClick={() => {
                setShowSubmittedOnly(false);
                setShowFacultyProjects(true);
                setShowPlagiarismReports(false);
              }}
            >
              View Student Projects
            </button>

            <button
              onClick={() => {
                setShowSubmittedOnly(true);
                setShowFacultyProjects(true);
                setShowPlagiarismReports(false);
              }}
            >
              View Submitted Projects
            </button>

            <button
              onClick={() => {
                setShowSubmittedOnly(false);
                setShowFacultyProjects(true);
                setShowPlagiarismReports(false);
              }}
            >
              Review Projects
            </button>

            <button
              onClick={() => {
                setShowFacultyProjects(false);
                fetchPlagiarismReports();
              }}
            >
              View Plagiarism Reports
            </button>

          </div>

        </div>

        {showFacultyProjects && (
          <div className="section-card">

            <h2>
              {showSubmittedOnly
                ? "Submitted Projects"
                : "Student Projects"}
            </h2>

            {displayedFacultyProjects.length === 0 ? (
              <div className="empty-state">
                <h3>No Projects Found</h3>
                <p>
                  {showSubmittedOnly
                    ? "No submitted projects found."
                    : "No student projects found."}
                </p>
              </div>
            ) : (
              displayedFacultyProjects.map((item) => (
                <div
                  key={item.id}
                  className="project-card"
                >

                  <div className="project-card-header">
                    <div>
                      <span className="project-id">
                        PROJECT #{item.id}
                      </span>

                      <h3>{item.title}</h3>
                    </div>

                    <span
                      className={getStatusClass(
                        item.status
                      )}
                    >
                      {item.status || "Pending"}
                    </span>
                  </div>

                  <div className="project-details">

                    <p>
                      <strong>Domain</strong>
                      {item.domain}
                    </p>

                    <p>
                      <strong>Department</strong>
                      {item.department}
                    </p>

                    <p>
                      <strong>Academic Year</strong>
                      {item.academic_year}
                    </p>

                    <p>
                      <strong>Guide</strong>
                      {item.guide}
                    </p>

                    <p>
                      <strong>Team Members</strong>
                      {item.team_members}
                    </p>

                  </div>

                  <div className="abstract-box">
                    <strong>Abstract</strong>
                    <p>{item.abstract}</p>
                  </div>

                  <p>
                    <strong>Submission:</strong>{" "}
                    <span className="submission-status">
                      {item.submission_status ||
                        "Not Submitted"}
                    </span>
                  </p>

                  <div className="button-group">

                    <button
                      onClick={() =>
                        updateProjectStatus(
                          item.id,
                          "Approved"
                        )
                      }
                    >
                      Approve
                    </button>

                    <button
                      className="danger-button"
                      onClick={() =>
                        updateProjectStatus(
                          item.id,
                          "Rejected"
                        )
                      }
                    >
                      Reject
                    </button>

                  </div>

                </div>
              ))
            )}

            <button
              className="secondary-button"
              onClick={() =>
                setShowFacultyProjects(false)
              }
            >
              Close Projects
            </button>

          </div>
        )}

        {showPlagiarismReports && (
          <div className="section-card">

            <h2>Plagiarism Reports</h2>

            <p className="section-description">
              Review similarity results from uploaded
              academic documents.
            </p>

            {plagiarismReports.length === 0 ? (
              <div className="empty-state">
                <p>No plagiarism reports found.</p>
              </div>
            ) : (
              plagiarismReports.map((report) => (
                <div
                  key={report.id}
                  className="report-card"
                >

                  <div className="project-card-header">
                    <div>
                      <span className="project-id">
                        REPORT #{report.id}
                      </span>

                      <h3>{report.file_name}</h3>
                    </div>

                    <span className="similarity-badge">
                      {report.similarity_percentage}%
                    </span>
                  </div>

                  <p>
                    <strong>Project ID:</strong>{" "}
                    {report.project_id}
                  </p>

                  <p>
                    <strong>Result:</strong>{" "}
                    {report.result}
                  </p>

                </div>
              ))
            )}

            <button
              className="secondary-button"
              onClick={() =>
                setShowPlagiarismReports(false)
              }
            >
              Close Reports
            </button>

          </div>
        )}

        <button
          className="logout-button"
          onClick={() => {
            setFacultyLoggedIn(false);
            setLoginType("");
            setCurrentUserId(null);
            setCurrentUsername("");
            setShowFacultyProjects(false);
            setShowSubmittedOnly(false);
            setShowPlagiarismReports(false);
            setPlagiarismReports([]);
          }}
        >
          Logout
        </button>

      </div>
    );
  }

  // =========================
  // STUDENT DASHBOARD
  // =========================

  if (loggedIn) {
    return (
      <div className="app-container">

        <div className="dashboard-header">
          <div>
            <p className="eyebrow">STUDENT PORTAL</p>

            <h1>Student Dashboard</h1>

            <p className="subtitle">
              Manage your academic projects and
              plagiarism checks.
            </p>

            {currentUsername && (
              <p className="section-description">
                Logged in as:{" "}
                <strong>{currentUsername}</strong>
              </p>
            )}
          </div>
        </div>

        {!showProjectForm ? (
          <>

            <div className="hero-card">

              <div>
                <p className="eyebrow">
                  ACADEMIC PROJECT
                </p>

                <h2>Create a New Project</h2>

                <p>
                  Add your project details and submit them
                  for faculty review.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowProjectForm(true);
                  setPlagiarismResult(null);
                  setSelectedFile(null);
                }}
              >
                + Create New Academic Project
              </button>

            </div>

            <div className="section-card">

              <div className="section-heading">
                <div>
                  <h2>My Projects</h2>
                  <p className="section-description">
                    View your project status and submit
                    documents for plagiarism checking.
                  </p>
                </div>

                <span className="count-badge">
                  {studentProjects.length} Projects
                </span>
              </div>

              {studentProjects.length === 0 ? (
                <div className="empty-state">

                  <h3>No Projects Yet</h3>

                  <p>
                    Create your first academic project
                    to get started.
                  </p>

                </div>
              ) : (
                <div>

                  {studentProjects.map((item) => (
                    <div
                      key={item.id}
                      className="project-card"
                    >

                      <div className="project-card-header">

                        <div>

                          <span className="project-id">
                            PROJECT #{item.id}
                          </span>

                          <h3>
                            {item.title}
                          </h3>

                        </div>

                        <span
                          className={getStatusClass(
                            item.status
                          )}
                        >
                          {item.status || "Pending"}
                        </span>

                      </div>

                      <p>
                        <strong>Domain:</strong>{" "}
                        {item.domain}
                      </p>

                      <p>
                        <strong>Submission:</strong>{" "}
                        <span className="submission-status">
                          {item.submission_status ||
                            "Not Submitted"}
                        </span>
                      </p>

                      {item.submission_status !==
                        "Submitted" && (
                        <button
                          onClick={() =>
                            submitProject(item.id)
                          }
                        >
                          Submit Project
                        </button>
                      )}

                      <div className="plagiarism-box">

                        <h3>
                          Plagiarism Checker
                        </h3>

                        <p>
                          Upload a PDF or DOCX document
                          to check its similarity with
                          previously uploaded documents.
                        </p>

                        <input
                          type="file"
                          accept=".pdf,.docx"
                          onChange={(e) => {
                            setSelectedFile(
                              e.target.files[0]
                            );
                            setPlagiarismResult(null);
                          }}
                        />

                        <br />

                        <button
                          onClick={() =>
                            handlePlagiarismCheck(
                              item.id
                            )
                          }
                          disabled={uploadingFile}
                        >
                          {uploadingFile
                            ? "Checking..."
                            : "Check Plagiarism"}
                        </button>

                        {plagiarismResult && (
                          <div className="plagiarism-result">

                            <h4>
                              Plagiarism Result
                            </h4>

                            <p>
                              <strong>File:</strong>{" "}
                              {
                                plagiarismResult.file_name
                              }
                            </p>

                            <p>
                              <strong>
                                Similarity:
                              </strong>{" "}
                              {
                                plagiarismResult.similarity_percentage
                              }
                              %
                            </p>

                            <p>
                              <strong>Result:</strong>{" "}
                              {
                                plagiarismResult.result
                              }
                            </p>

                            <p>
                              <strong>
                                Extracted Text:
                              </strong>{" "}
                              {
                                plagiarismResult.text_length
                              }{" "}
                              characters
                            </p>

                          </div>
                        )}

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

            <div className="stats-grid">

              <div className="stat-card">
                <div className="stat-number">
                  {studentProjects.length}
                </div>
                <div className="stat-label">
                  Total Projects
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-number">
                  {
                    studentProjects.filter(
                      (item) =>
                        item.status === "Pending"
                    ).length
                  }
                </div>
                <div className="stat-label">
                  Pending Reviews
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-number">
                  {
                    studentProjects.filter(
                      (item) =>
                        item.status === "Approved"
                    ).length
                  }
                </div>
                <div className="stat-label">
                  Approved Projects
                </div>
              </div>

            </div>

            <button
              className="logout-button"
              onClick={() => {
                setLoggedIn(false);
                setLoginType("");
                setCurrentUserId(null);
                setCurrentUsername("");
                setSelectedFile(null);
                setPlagiarismResult(null);
                setShowProjectForm(false);
                setStudentProjects([]);
              }}
            >
              Logout
            </button>

          </>
        ) : (

          <div className="section-card">

            <p className="eyebrow">
              NEW PROJECT
            </p>

            <h2>Create New Academic Project</h2>

            <p className="section-description">
              Enter your academic project details below.
            </p>

            <form onSubmit={handleProjectSubmit}>

              <div className="form-group">
                <label>Project Title</label>

                <input
                  type="text"
                  name="title"
                  value={project.title}
                  onChange={handleProjectChange}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Project Domain</label>

                <input
                  type="text"
                  name="domain"
                  value={project.domain}
                  onChange={handleProjectChange}
                  placeholder="Example: Artificial Intelligence"
                  required
                />
              </div>

              <div className="form-group">
                <label>Abstract</label>

                <textarea
                  name="abstract"
                  value={project.abstract}
                  onChange={handleProjectChange}
                  placeholder="Enter project abstract"
                  rows="6"
                  required
                />
              </div>

              <div className="form-group">
                <label>Team Members</label>

                <input
                  type="text"
                  name="teamMembers"
                  value={project.teamMembers}
                  onChange={handleProjectChange}
                  placeholder="Enter team member names"
                />
              </div>

              <div className="form-group">
                <label>Guide Name</label>

                <input
                  type="text"
                  name="guide"
                  value={project.guide}
                  onChange={handleProjectChange}
                  placeholder="Enter guide name"
                />
              </div>

              <div className="form-group">
                <label>Department</label>

                <input
                  type="text"
                  name="department"
                  value={project.department}
                  onChange={handleProjectChange}
                  placeholder="Example: ECE"
                  required
                />
              </div>

              <div className="form-group">
                <label>Academic Year</label>

                <input
                  type="text"
                  name="academicYear"
                  value={project.academicYear}
                  onChange={handleProjectChange}
                  placeholder="Example: 2026-2027"
                  required
                />
              </div>

              <div className="button-group">

                <button type="submit">
                  Create Project
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setShowProjectForm(false);

                    setProject({
                      title: "",
                      domain: "",
                      abstract: "",
                      teamMembers: "",
                      guide: "",
                      department: "",
                      academicYear: "",
                    });
                  }}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>
        )}

      </div>
    );
  }

  // =========================
  // HOME / LOGIN PAGE
  // =========================

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="logo-circle">
          🎓
        </div>

        <p className="eyebrow">
          ACADEMIC MANAGEMENT SYSTEM
        </p>

        <h1>
          Cloud-Based Academic
          <br />
          Project Management
        </h1>

        <p className="login-description">
          Manage academic projects, submissions,
          reviews and plagiarism checking in one
          platform.
        </p>

        <div className="login-options">

          <button
            onClick={() => {
              setLoginType("Student");
              setUsername("");
              setPassword("");
            }}
          >
            Student Login
          </button>

          <button
            className="secondary-button"
            onClick={() => {
              setLoginType("Faculty");
              setUsername("");
              setPassword("");
            }}
          >
            Faculty Login
          </button>

        </div>

        {loginType && (
          <div className="login-form">

            <h2>{loginType} Login</h2>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              onClick={handleLogin}
              disabled={loggingIn}
            >
              {loggingIn ? "Logging in..." : "Login"}
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

export default App;