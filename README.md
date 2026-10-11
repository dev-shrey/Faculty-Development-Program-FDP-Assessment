# TrainX Faculty Development Program (FDP)
## MERN Stack Technical Assessment

Welcome to the TrainX Faculty Development Program (FDP) MERN Stack Technical Assessment.
All participants must complete the assigned tasks in this repository and submit their work through an individual GitHub Pull Request (PR).

Please read this document carefully before starting the assessment.

---
## 1. Technology Stack

The assessment uses the following technologies:

| Component | Technology |
|---|---|
| Frontend | React |
| Frontend tooling | Vite |
| Backend runtime | Node.js |
| Backend framework | Express.js |
| Database | Local MongoDB Community Server |
| Database ODM | Mongoose |
| API communication | REST APIs and JSON |
| Security middleware | Helmet |
| Cross-origin configuration | CORS |
| Version control | Git and GitHub |

Participants are expected to use the existing project structure and technologies unless a task explicitly permits otherwise.

Do not replace the prescribed technology stack or introduce unnecessary dependencies.

---

## 2. Prerequisites

Before beginning the assessment, ensure that the following tools are installed:

- Node.js 22 LTS
- npm
- Git
- A code editor, preferably Visual Studio Code
- MongoDB Community Server running locally
- `mongosh` (optional, for checking the local database connection)

Verify your installations:

```bash
node --version
npm --version
git --version
```

If any required tool is missing, install and configure it before proceeding.

---

## 3. Repository Structure

The repository follows a standard MERN application structure.

```text
Faculty-Development-Program-FDP-Assessment/
├── client/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── data/
│   │   │   └── assessmentStudents.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── app.js
│   │   └── server.js
│   ├── scripts/
│   │   └── seedStudents.js
│   ├── .env.example
│   └── package.json
├── .gitignore
├── README.md
├── task.md
├── package.json
└── package-lock.json
```

---

## 4. Clone the Repository

Clone the official assessment repository to your local machine.

```bash
git clone https://github.com/GitMohit123/Faculty-Development-Program-FDP-Assessment.git
cd Faculty-Development-Program-FDP-Assessment
```
Do not create your own replacement repository unless explicitly instructed.

---

## 5. Install Dependencies

From the repository root, run:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

Allow all installations to finish successfully before proceeding.
Do not delete or replace dependency lockfiles unnecessarily.

---

## 6. Configure Environment Variables

The application uses environment variables to configure the frontend and backend.

### 6.1 Backend configuration

Create a file named `server/.env` using `server/.env.example` as the template.

Configure the following variables:

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/mern_fdp_assessment
```

This URI connects to a local database named `mern_fdp_assessment`. Change the database name after the final slash if you prefer another local assessment database. A standard local MongoDB Community Server installation does not require a username or password unless you explicitly enabled authentication.

### 6.2 Frontend configuration

Create `client/.env.local` using `client/.env.example` as the template.

Configure:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

### 6.3 Environment variable rules

- Never commit `.env`, `.env.local`, database credentials, or access tokens.
- Never place database credentials or private keys in frontend environment variables.
- Do not modify the shared `.env.example` files to include real credentials.
- Do not share database connection strings in Pull Requests, screenshots, or public issues.
- Each trainer uses their own local database; no MongoDB account or shared credential is required.

## 7. Install and Start Local MongoDB

Each trainer uses their own local MongoDB database. No Atlas account, central database, MongoDB user, or shared database credential is required. Use the official Community Server installation guide for your operating system:

- macOS: [Install MongoDB Community on macOS](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/). With Homebrew, install with `brew tap mongodb/brew && brew install mongodb-community@8.0`, then start with `brew services start mongodb-community@8.0`.
- Windows: [Install MongoDB Community on Windows](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/). If installed as a Windows service, use elevated PowerShell and run `Start-Service MongoDB`, or use `net start MongoDB` in an elevated Command Prompt.
- Ubuntu/Linux: [Install MongoDB Community on Ubuntu](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/). On systemd-based Ubuntu installations, run `sudo systemctl start mongod` and check it with `sudo systemctl status mongod`.

Installation and service names can vary by MongoDB release and platform; follow the linked official guide for your installed version. If `mongosh` is installed, verify a running local server with:

```bash
mongosh "mongodb://127.0.0.1:27017" --eval 'db.adminCommand({ ping: 1 })'
```

The response should include `ok: 1`.

---

## 8. Configure, Seed, and Start the Application

Run these steps from the repository root:

1. Install dependencies as shown in Section 5.
2. Create the private backend environment file from the checked-in example. On macOS/Linux run `cp server/.env.example server/.env`; in PowerShell run `Copy-Item server/.env.example server/.env`.
3. Confirm `server/.env` uses the local `MONGODB_URI` from Section 6. Keep local environment files uncommitted.
4. Start MongoDB Community Server using the instructions for your operating system in Section 7.
5. Seed the local database with fictional starter data:

  ```bash
  npm run seed
  ```

  The script inserts 25 fictional students using the existing Mongoose model. It can be run repeatedly: existing normalized email addresses are skipped, and existing records are never updated or deleted. Seed data supports testing search, filters, editing, and pagination; seeding is setup support, not an assessed task.
6. Start the frontend and backend together:

```bash
npm run dev
```

The application should run at the following addresses. Select **API data** in the interface to load seeded MongoDB records; **Sample preview** is a separate set of fixtures.

| Service | URL |
|---|---|
| React frontend | http://localhost:5173 |
| Express backend | http://localhost:5000 |
| Backend health endpoint | http://localhost:5000/api/health |

Keep the development terminal running while testing the application.

### Verify the backend

Open a separate terminal and execute:

```bash
curl -i http://localhost:5000/api/health
```

The initial health endpoint should return HTTP `200` and a JSON response similar to:

```json
{
  "success": true,
  "message": "MERN FDP API is running"
}
```

This endpoint confirms that the API is responding. Check backend logs for `MongoDB connected successfully`. To verify the seed records are available through the API, run:

```bash
curl -i http://localhost:5000/api/students
```

`GET /api/students` accepts `q` (or `search`) for a case-insensitive name/email search, `status` for a placement status, `page` for the page number, and `pageSize` (or `limit`) for the page size. The page size defaults to 10 and is limited to 100 records. Search and status may be combined:

```text
http://localhost:5000/api/students?q=aditi&status=Applied&page=1&limit=5
```

The response contains `data` records and `pagination` metadata (`page`, `pageSize`, `total`, and `pages`). Invalid query values return HTTP `400` with a JSON error message.

### Troubleshooting

- MongoDB service is not running: start it with the OS-specific service command in Section 7, then retry the connection check.
- The backend reports a missing or failed `MONGODB_URI`: confirm `server/.env` exists, the variable name is exactly `MONGODB_URI`, the URI points to `127.0.0.1:27017`, and MongoDB is running.
- The seed command cannot find its script, Student model, or database configuration: run `npm run seed` from the repository root, confirm backend dependencies were installed with `npm install --prefix server`, and check that the existing `server/src/models/Student.js` and `server/src/config/db.js` files are present. From the backend directory, the equivalent command is also `npm run seed`.
- The seed command fails during validation or index creation: inspect the backend error output and resolve conflicting duplicate email values. Do not drop the database to retry.
- The frontend does not load API data: confirm the backend uses port 5000, `client/.env.local` contains `VITE_API_BASE_URL=http://localhost:5000/api`, `CLIENT_URL` matches the frontend origin (`http://localhost:5173`), and **API data** mode is selected. Restart Vite after changing its environment file.
- A command is run from the wrong directory: run root-level commands such as `npm run seed` and `npm run dev` from the repository root, or use the backend package commands from `server/`.

---

## 9. Understand the Assessment Tasks

Before implementation, read [`task.md`](./task.md) completely.

The assessment consists of five tasks, each with its own requirements, acceptance criteria, and marks allocation.

For every task:

1. Understand the problem statement.
2. Identify the relevant frontend, backend, and database components.
3. Review the existing project structure.
4. Implement the required functionality.
5. Test successful and unsuccessful scenarios.
6. Verify error handling and edge cases.
7. Review your changes before committing them.

Do not assume that a feature is complete simply because the application starts successfully.

Each task will be evaluated against its published requirements and acceptance criteria.

---

## 10. Git and GitHub Workflow

Every participant must submit an individual Pull Request.

Follow the workflow below exactly.

### Step 1: Check your current branch

```bash
git branch --show-current
git status
```

Ensure your working tree is in the expected state before creating your submission branch.

### Step 2: Create your submission branch

Use your GitHub username in the branch name.

```bash
git switch -c submission/<github-username>
```

For example:

```bash
git switch -c submission/rahul-sharma
```

Replace the example username with your own GitHub username.

If the submission branch already exists, switch to that branch instead of creating another one.

### Step 3: Implement the tasks

Make all assessment changes on your submission branch.

Do not push your work directly to `main`.

Keep changes focused on the assigned requirements. Avoid unrelated refactoring, unnecessary dependencies, and modifications to the starter configuration that are not required by the assessment.

### Step 4: Review your changes

Before committing, execute:

```bash
git status
git diff
```

Check that:

- Only relevant files have been changed.
- No credentials or environment files are included.
- No unnecessary generated files or dependencies have been added.
- Your changes satisfy the task requirements.

### Step 5: Run tests, lint, and build

From the repository root, run the available checks:

```bash
npm test
npm run lint --prefix client
npm run build
```

The automated tests should pass, and the frontend production build should complete successfully.

Also verify the backend, database operations, API responses, validation, and error scenarios required by `task.md`.

A successful frontend build does not replace backend or integration testing.

### Step 6: Commit your changes

Use a clear commit message.

```bash
git add .
git commit -m "feat: complete MERN FDP assessment"
```

You may use multiple meaningful commits if appropriate.

Before committing, verify that sensitive environment files are ignored and are not already tracked by Git.

### Step 7: Push your submission branch

```bash
git push -u origin submission/<github-username>
```

Replace `<github-username>` with your actual GitHub username.

### Step 8: Create your Pull Request

Open the official assessment repository on GitHub and create a new Pull Request.

Use the following details:

**Pull Request title**

`FDP MERN Assessment - <Full Name>`

**Base branch**

`main`

**Compare branch**

`submission/<github-username>`

Verify that the PR contains only your intended changes before submitting it.

---

## 12. Final Submission Conditions

All participants must follow these conditions.

### 12.1 Submission method

- Submit your work through a GitHub Pull Request.
- Use your assigned submission branch.
- Target the official `main` branch unless instructed otherwise.
- Submit before the deadline announced by the FDP coordinator.
- Do not merge your own Pull Request.

### 12.2 Code quality

- Write readable, maintainable code.
- Follow the existing project structure and coding conventions.
- Keep routes, controllers, middleware, models, and UI components appropriately organized.
- Handle errors and invalid inputs correctly.
- Avoid unnecessary dependencies and unrelated code changes.
- Remove debugging statements that are not needed in the final submission.

### 12.3 Functionality and testing

- Ensure the application starts using the documented commands.
- Ensure the frontend production build succeeds.
- Verify the functionality required by each task.
- Test relevant success, failure, validation, and edge cases.
- Ensure frontend and backend integration works correctly.
- Verify database operations against the authorized assessment database.

### 12.4 Security

- Never commit database credentials, `.env` files, private keys, or access tokens.
- Do not expose secrets through frontend code or logs.
- Do not bypass validation, CORS requirements, or other security checks specified by the assessment.
- Do not use unauthorized databases or access another participant's data.

### 12.5 Originality and integrity

- Submit your own implementation.
- Do not copy another participant's work.
- Do not submit another person's code as your own.
- Do not modify assessment criteria, remove evaluation checks, or bypass the intended requirements.
- Clearly acknowledge any permitted external code or assistance when required by the FDP coordinator.

### 12.6 Pull Request requirements

- Use the prescribed Pull Request title.
- Include your participant details.
- Summarize the work completed.
- Report tests performed and known limitations.
- Respond to evaluator questions or requested changes within the announced evaluation window.

Failure to follow the submission rules may affect the evaluation, regardless of whether the application appears functional.
