# PATH NEXUS

Learn. Build. Grow.

PATH NEXUS is a full-stack learning platform with teacher course management, lesson curriculum, student enrollment and progress, administrator tools, password reset, Google sign-in, and M-Pesa payment integration.

## Project layout

```text
Path-Nexus/
├── backend/
│   ├── nexus/
│   ├── users/
│   ├── students/
│   ├── teachers/
│   ├── courses/
│   ├── payments/
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.js
```

## Keep your private environment files

The real `.env` files are intentionally not included in shared ZIP files because they contain database passwords, email credentials, Google client IDs, Cloudinary credentials and M-Pesa keys.

Keep your existing `backend/.env` and `frontend/.env` files when updating this project. They remain on your computer when you extract the updated source files over the same project folder.

Backend environment variable names used by this project include `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, optional `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, the `MPESA_*` settings, the `EMAIL_*` settings, `DEFAULT_FROM_EMAIL`, the `CLOUDINARY_*` settings and `GOOGLE_CLIENT_ID`.

Frontend environment variables are `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`. `VITE_API_URL` must be the backend origin only, for example `https://your-backend-domain`; do not add `/api` to the end. The frontend API service adds `/api/...` to each endpoint.

## Run the backend

From the project root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

Windows PowerShell:
```powershell
.venv\Scripts\Activate.ps1
```

Git Bash:
```bash
source .venv/Scripts/activate
```

Install dependencies and start Django:

```bash
pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Use the PostgreSQL credentials in your existing `backend/.env`. Keep the same database connection if you need to preserve your current users and course data.

## Run the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm ci
npm run dev
```

The local frontend uses `http://localhost:5173`.

## Use Ngrok for Google/M-Pesa callbacks or remote testing

Start Ngrok in a separate terminal:

```bash
ngrok http 8000
```

Copy the HTTPS forwarding origin into `frontend/.env`:

```env
VITE_API_URL=https://your-ngrok-domain.ngrok-free.dev
```

Restart Vite after changing `.env`:

```bash
npm run dev
```

Add the frontend origin (not the backend Ngrok URL) to Django `CORS_ALLOWED_ORIGINS`, for example:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

The backend `CSRF_TRUSTED_ORIGINS` should contain the HTTPS backend origin when required by your deployment and callback flow.

## Google sign-in setup

The Google Identity Services client ID in `frontend/.env` and `GOOGLE_CLIENT_ID` in `backend/.env` must belong to the same OAuth web application.

In Google Cloud Console, add the exact frontend origins under **Authorized JavaScript origins**, including:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- Your deployed frontend origin when deployed

Google's console configuration cannot be changed by the project code itself. If the browser says the origin is not allowed, add it in Google Cloud Console and wait for the change to take effect.

## Admin account password

If an administrator account already exists but its password is unknown, from `backend/` run:

```bash
python manage.py changepassword your_admin_username
```

To create a new Django superuser:

```bash
python manage.py createsuperuser
```

Django superusers are recognized as platform administrators by the API even if their saved role field was originally `student`.

## Important workflow notes

- A teacher must be verified by an administrator before creating or managing courses and lessons.
- A new course is saved as `DRAFT`; the teacher submits it for review.
- Only administrators can approve or reject a course.
- Students can enroll in published free courses. Paid course access is granted after the M-Pesa callback is validated.
- Keep a backup of the PostgreSQL database before applying migrations or testing destructive admin actions.

## Tests

Backend syntax and frontend source changes should be checked before deployment. Run the backend test suite from `backend/`:

```bash
python manage.py test
```

Run frontend checks from `frontend/`:

```bash
npm run lint
npm run build
```

External integrations (Google OAuth, Gmail SMTP, Cloudinary, Safaricom Daraja and the Ngrok tunnel) also require valid account settings and cannot be fully verified without those live services.
