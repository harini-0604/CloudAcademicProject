from fastapi import (
    FastAPI,
    Depends,
    UploadFile,
    File,
    HTTPException
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from io import BytesIO
from docx import Document
from pypdf import PdfReader

from database import SessionLocal
from models import Project, PlagiarismReport


app = FastAPI(
    title="Cloud-Based Academic Project Management and Plagiarism Checker",
    description="Academic project management and plagiarism detection system",
    version="1.0.0"
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# DATABASE
# =========================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================
# PROJECT MODEL
# =========================

class ProjectCreate(BaseModel):
    title: str
    domain: str
    abstract: str
    team_members: str = ""
    guide: str = ""
    department: str
    academic_year: str


# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {
        "message": "Cloud Academic Project Management API is running"
    }


# =========================
# HEALTH CHECK
# =========================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# =========================
# CREATE PROJECT
# =========================

@app.post("/projects")
def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db)
):
    project = Project(
        title=project_data.title,
        domain=project_data.domain,
        abstract=project_data.abstract,
        team_members=project_data.team_members,
        guide=project_data.guide,
        department=project_data.department,
        academic_year=project_data.academic_year
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return {
        "message": "Project created successfully",
        "project_id": project.id
    }


# =========================
# GET ALL PROJECTS
# =========================

@app.get("/projects")
def get_projects(
    db: Session = Depends(get_db)
):
    projects = db.query(Project).all()

    return [
        {
            "id": project.id,
            "title": project.title,
            "domain": project.domain,
            "abstract": project.abstract,
            "team_members": project.team_members,
            "guide": project.guide,
            "department": project.department,
            "academic_year": project.academic_year,
            "status": project.status,
            "submission_status": project.submission_status
        }
        for project in projects
    ]


# =========================
# UPDATE PROJECT STATUS
# =========================

@app.put("/projects/{project_id}/status")
def update_project_status(
    project_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if not project:
        return {
            "message": "Project not found"
        }

    if status not in [
        "Approved",
        "Rejected",
        "Pending"
    ]:
        return {
            "message": "Invalid status"
        }

    project.status = status

    db.commit()
    db.refresh(project)

    return {
        "message": "Project status updated successfully",
        "project_id": project.id,
        "status": project.status
    }


# =========================
# SUBMIT PROJECT
# =========================

@app.put("/projects/{project_id}/submit")
def submit_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if not project:
        return {
            "message": "Project not found"
        }

    project.submission_status = "Submitted"

    db.commit()
    db.refresh(project)

    return {
        "message": "Project submitted successfully",
        "project_id": project.id,
        "submission_status": project.submission_status
    }


# =========================
# TEXT EXTRACTION
# =========================

def extract_text(file_content, file_extension):

    # PDF
    if file_extension == ".pdf":

        reader = PdfReader(
            BytesIO(file_content)
        )

        text = ""

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text


    # DOCX
    elif file_extension == ".docx":

        document = Document(
            BytesIO(file_content)
        )

        text = "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )

        return text


    return ""


# =========================
# PLAGIARISM FILE UPLOAD
# =========================

@app.post("/plagiarism/upload/{project_id}")
async def upload_plagiarism_file(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # Check whether project exists
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )


    # Check supported file types
    allowed_types = [
        ".pdf",
        ".docx"
    ]

    file_name = file.filename or ""

    file_extension = (
        "." +
        file_name.split(".")[-1].lower()
    )


    if file_extension not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )


    # =========================
    # READ UPLOADED FILE
    # =========================

    file_content = await file.read()


    # =========================
    # EXTRACT TEXT
    # =========================

    text = extract_text(
        file_content,
        file_extension
    )


    if not text.strip():

        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the document."
        )


    # =========================
    # GET EXISTING REPORTS
    # =========================

    existing_reports = db.query(
        PlagiarismReport
    ).filter(
        PlagiarismReport.project_id == project_id,
        PlagiarismReport.extracted_text.isnot(None)
    ).all()


    similarity_percentage = 0.0


    # =========================
    # CALCULATE SIMILARITY
    # =========================

    documents = [
        report.extracted_text
        for report in existing_reports
        if report.extracted_text
    ]


    if documents:

        documents.append(text)

        vectorizer = TfidfVectorizer(
            stop_words="english"
        )

        tfidf_matrix = vectorizer.fit_transform(
            documents
        )

        similarities = cosine_similarity(
            tfidf_matrix[-1],
            tfidf_matrix[:-1]
        )


        if similarities.size > 0:

            similarity_percentage = (
                float(similarities.max()) * 100
            )


    # =========================
    # DETERMINE RESULT
    # =========================

    if similarity_percentage >= 70:

        result = "High Similarity"

    elif similarity_percentage >= 40:

        result = "Moderate Similarity"

    else:

        result = "Low Similarity"


    # =========================
    # CREATE PLAGIARISM REPORT
    # =========================

    report = PlagiarismReport(
        project_id=project_id,
        file_name=file_name,
        extracted_text=text,
        similarity_percentage=round(
            similarity_percentage,
            2
        ),
        result=result
    )


    db.add(report)
    db.commit()
    db.refresh(report)


    # =========================
    # RESPONSE
    # =========================

    return {
        "message": "File uploaded and similarity checked successfully",
        "report_id": report.id,
        "project_id": project_id,
        "file_name": file_name,
        "similarity_percentage": round(
            similarity_percentage,
            2
        ),
        "result": result,
        "text_length": len(text)
    }

# =========================
# GET PLAGIARISM REPORTS
# =========================

@app.get("/plagiarism/reports")
def get_plagiarism_reports(
    db: Session = Depends(get_db)
):
    reports = db.query(PlagiarismReport).all()

    return [
        {
            "id": report.id,
            "project_id": report.project_id,
            "file_name": report.file_name,
            "similarity_percentage": report.similarity_percentage,
            "result": report.result
        }
        for report in reports
    ]