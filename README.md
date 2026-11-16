# Path-Nexus

### Learn. Build. Grow.

Path Nexus is a full-stack educational learning platform built to connect students and teachers through an organized digital learning experience. It provides a platform where teachers can create and manage courses, students can explore and enroll in published courses, and administrators can manage users and oversee platform activities.

## Features

- **User Authentication:** User registration and login.
- **Role Management:** Separate roles for students, teachers, and administrators.
- **Student Profiles:** Student profiles with personal bios.
- **Teacher Profiles:** Teacher bios, qualifications, and verification status.
- **Course Management:** Teachers can create, update, and manage their courses.
- **Course Approval:** Administrators can approve or reject submitted courses.
- **Course Enrollment:** Students can enroll in published courses.
- **Learning Progress:** Students can track their learning progress.
- **Payment Integration:** M-Pesa Daraja API integration.
- **Admin Dashboard:** Platform management for users, courses, enrollments, and payments.

## Technologies Used

- Python
- Django
- Django REST Framework
- React
- Vite
- Tailwind CSS
- PostgreSQL
- Simple JWT
- Postman
- M-Pesa Daraja API (Sandbox)

## Course Workflow

1. A teacher creates a course with `DRAFT` status.
2. The teacher submits the course for approval.
3. The course changes to `PENDING`.
4. An administrator reviews the submitted course.
5. The administrator approves or rejects the course.
6. Approved courses become `PUBLISHED`.
7. Students can enroll in published courses according to the enrollment rules.

## Project Structure

```text
Path-Nexus/
│
├── backend/
│   ├── nexus/
│   ├── users/
│   ├── students/
│   ├── teachers/
│   ├── courses/
│   ├── payments/
│   ├── path/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

## Future Improvements

- Complete M-Pesa payment integration.
- Improve API documentation.
- Expand automated test coverage.
- Enhance student and teacher profile functionality.
- Improve payment verification and enrollment tracking.

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL

## Author

**Nimo Ali**

Software Engineering Student
