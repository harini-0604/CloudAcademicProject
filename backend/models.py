from sqlalchemy import Column, Integer, String, Text, Float
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=False)
    abstract = Column(Text, nullable=False)
    team_members = Column(Text)
    guide = Column(String(255))
    department = Column(String(100), nullable=False)
    academic_year = Column(String(20), nullable=False)
    user_id = Column(Integer, nullable=True)

    # Project review status
    status = Column(String(20), default="Pending")

    # Project submission status
    submission_status = Column(
        String(20),
        default="Not Submitted"
    )


class PlagiarismReport(Base):
    __tablename__ = "plagiarism_reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False)
    file_name = Column(String(255), nullable=False)
    extracted_text = Column(String(1000000))
    similarity_percentage = Column(Float, default=0.0)
    result = Column(String(50), default="Not Checked")