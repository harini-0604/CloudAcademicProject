Cloud-Based Academic Project Management and Plagiarism Checker



«Manage academic projects, submissions, reviews and plagiarism checking in one platform.»



📌 Project Overview



The Cloud-Based Academic Project Management and Plagiarism Checker is a web-based academic platform designed to simplify the management of student projects.



The system provides a centralized platform where students can create and manage projects, submit projects for faculty review, and check submitted documents for plagiarism. Faculty members can review projects, approve or reject submissions, and view plagiarism reports.



✨ Key Features



👩‍🎓 Student



\- Student login

\- Create new academic projects

\- View project details

\- Track project approval status

\- Submit projects

\- Upload project documents

\- Check plagiarism similarity

\- View plagiarism results



👨‍🏫 Faculty



\- Faculty login

\- View student projects

\- Review project details

\- Approve or reject projects

\- View submitted projects

\- View plagiarism reports

\- Monitor similarity percentages



🔍 Plagiarism Checker



The application includes a document-based plagiarism checking module.



Supported document formats:



\- ".pdf"

\- ".docx"



The system extracts text from uploaded documents and compares it with previously submitted documents belonging to the same project.



The similarity percentage is calculated using TF-IDF and Cosine Similarity.



🏗️ System Architecture



Student

&#x20;  │

&#x20;  ▼

React Frontend

&#x20;  │

&#x20;  ▼

FastAPI Backend

&#x20;  │

&#x20;  ├── Project Management

&#x20;  ├── Faculty Review

&#x20;  ├── Project Submission

&#x20;  └── Plagiarism Checker

&#x20;         │

&#x20;         ▼

&#x20;    MariaDB Database



💻 Technologies Used



Frontend



\- React

\- Vite

\- HTML

\- CSS

\- JavaScript



Backend



\- Python

\- FastAPI

\- SQLAlchemy

\- Uvicorn



Database



\- MariaDB



Plagiarism Detection



\- Python

\- Scikit-learn

\- TF-IDF

\- Cosine Similarity

\- PyPDF

\- python-docx



📂 Project Structure



CloudAcademicProject/

│

├── backend/

│   ├── main.py

│   ├── models.py

│   ├── database.py

│   ├── create\_tables.py

│   └── test\_db.py

│

├── frontend/

│   ├── src/

│   │   ├── App.jsx

│   │   ├── App.css

│   │   └── main.jsx

│   ├── package.json

│   └── vite.config.js

│

├── .gitignore

├── LICENSE

└── README.md



⚙️ Local Setup



1\. Clone the repository



git clone https://github.com/harini-0604/CloudAcademicProject.git

cd CloudAcademicProject



2\. Backend Setup



cd backend

python -m venv venv



Activate the virtual environment on Windows:



.\\venv\\Scripts\\Activate.ps1



Install the required packages:



pip install fastapi uvicorn sqlalchemy pymysql python-dotenv python-multipart python-docx pypdf scikit-learn



Create your ".env" file and configure the database connection.



Example:



DATABASE\_URL=mysql+pymysql://root@localhost:3306/academic\_project\_db



Start the backend:



uvicorn main:app --reload



Backend:



http://127.0.0.1:8000



3\. Frontend Setup



Open another terminal:



cd frontend

npm install

npm run dev



Frontend:



http://localhost:5176



🧪 Project Testing



The plagiarism checker was tested using project-specific document comparison.



Example test results:



Test| Result

First document submission| 0% similarity

Same document submitted again| 100% similarity

Same document under another project| 0% similarity

Same document submitted again under that project| 100% similarity



This verifies that plagiarism comparison is performed within the relevant project.



🔐 Security



Sensitive configuration files and local development files are excluded from GitHub using ".gitignore".



Excluded files include:



\- ".env"

\- Python virtual environment

\- "node\_modules"

\- Python cache files



🚀 Future Enhancements



\- Cloud deployment

\- Email notifications

\- Advanced plagiarism detection

\- Project progress tracking

\- Cloud document storage

\- Mobile application

\- Automated faculty notifications

\- Improved similarity reports



👥 Project



Project: Cloud-Based Academic Project Management and Plagiarism Checker



Purpose: To provide a centralized platform for academic project management, submission, faculty review and plagiarism checking.



📄 License



This project is licensed under the MIT License.

