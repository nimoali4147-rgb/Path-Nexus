# Path-Nexus

### Learn. Build. Grow.

Path Nexus is an educational learning platform backend built with Django REST Framework. It connects students and teachers, manages courses, supports student enrollment, and allows administrators to review and approve courses.

## Features

- **User Authentication:** User registration and login using JWT authentication.
- **Role Management:** Separate roles for students, teachers, and administrators.
- **Student Profiles:** Students can have profiles with personal bios.
- **Teacher Profiles:** Teachers can have bios, qualifications, and verification status.
- **Course Management:** Teachers can create, update, view, and manage their courses.
- **Course Approval:** Administrators can approve or reject courses submitted by teachers.
- **Course Enrollment:** Students can enroll in published courses according to enrollment rules.
- **Payment Integration:** M-Pesa Daraja Sandbox integration is under development.

## Technologies Used

- Python
- Django
- Django REST Framework
- PostgreSQL
- Simple JWT
- Postman
- M-Pesa Daraja API (Sandbox)

## Course Workflow

1. A teacher creates a course with `DRAFT` status.
2. The teacher submits the course for approval.
3. The course changes to `PENDING`.
4. An administrator approves or rejects the course.
5. Approved courses become `PUBLISHED`.
6. Students can enroll in published courses, subject to the enrollment rules.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/nimoali4147-rgb/Path-Nexus
cd Path-Nexus/backend
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

### 3. Activate the Virtual Environment

```bash
venv\Scripts\activate
```

**Git Bash:**

```bash
source venv/Scripts/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a `.env` file in the appropriate backend directory and configure your database and secret settings.

Do not upload passwords, secret keys, or M-Pesa credentials to GitHub.

### 6. Apply Migrations

```bash
python manage.py migrate
```

### 7. Start the Development Server

```bash
python manage.py runserver
```

The local development server will be available at:

`http://127.0.0.1:8000/`

## API Testing

Path Nexus APIs can be tested using Postman.

1. Register a user as a student or teacher.
2. Log in to obtain JWT access and refresh tokens.
3. Use the access token as a Bearer Token in Postman.
4. Test course creation and management using a teacher account.
5. Test course approval and rejection using an administrator account.
6. Test student enrollment in published courses.
7. Verify that permissions and enrollment restrictions work correctly.


```
## Project Structure

Path-Nexus/
├── backend/
│   ├── nexus/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── ...
│   ├── users/
│   ├── students/
│   ├── teachers/
│   ├── courses/
│   ├── payments/
│   ├── path/
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
├── README.md
└── .gitignore
```
## Future Improvements

- Complete M-Pesa payment integration.
- Improve API documentation.
- Add more automated tests.
- Expand student and teacher profile functionality.
- Improve payment verification and enrollment tracking.

## Author

**Nimo Ali**

Software Engineering Student

