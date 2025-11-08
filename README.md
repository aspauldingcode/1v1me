# 1v1me

ci: trigger deploy run

A full-stack application for 1v1 challenges and competitions.

## Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/docs)** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Utility-first CSS framework

### Backend
- **[Java Spring Boot](https://spring.io/projects/spring-boot)** - Enterprise Java framework
- **Spring Data JPA** - Data persistence
- **H2 Database** - In-memory database for development
- **Maven** - Dependency management

## Documentation Links

- 📚 [Next.js Documentation](https://nextjs.org/docs)
- 🎨 [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- 🍃 [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- 🚀 [Vercel CLI Documentation](https://vercel.com/docs/cli)

## Project Structure

```
1v1me/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app directory
│   ├── public/       # Static assets
│   └── package.json
├── backend/          # Spring Boot backend API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Java 17+
- Maven 3.6+

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Run the Spring Boot application:
```bash
./mvnw spring-boot:run
# or on Windows
mvnw.cmd spring-boot:run
```

The backend API will be available at [http://localhost:8080](http://localhost:8080)

You can access the H2 console at [http://localhost:8080/h2-console](http://localhost:8080/h2-console)

### Running Both Services

For development, you'll need to run both services in separate terminal windows:

**Terminal 1 (Frontend):**
```bash
cd frontend && npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend && ./mvnw spring-boot:run
```

## API Documentation

The backend exposes a REST API at `/api`:

- `GET /api/health` - Health check endpoint

## Environment Variables

### Frontend
Create a `.env.local` file in the `frontend` directory:
```
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Backend
Configuration is in `backend/src/main/resources/application.properties`

## Deployment

### Step 1: Deploy to GitHub

First, initialize Git and push to your GitHub repository:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Next.js + Spring Boot setup"

# Rename branch to master
git branch -M master

# Add remote repository
git remote add origin git@github.com:aspauldingcode/1v1me.git

# Push to GitHub
git push -u origin master
```

### Step 2: Deploy Frontend to Vercel (CLI Method)

#### Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

#### Deploy with Vercel CLI

```bash
# Login to Vercel (opens browser for authentication)
vercel login

# Navigate to project root
cd /Users/alex/1v1me

# Deploy to Vercel (this will connect your GitHub repo)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - What's your project's name? 1v1me
# - In which directory is your code located? ./frontend
# - Want to override the settings? No (or Yes if you need to customize)

# For production deployment
vercel --prod
```

**🔄 Automatic Deployments:** Once connected, Vercel automatically deploys on every `git push` to your GitHub repository!
- Push to `master` → Production deployment
- Create pull request → Preview deployment

#### Alternative: Deploy via Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository: `aspauldingcode/1v1me`
3. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
4. Click "Deploy"

**🔄 After initial setup:** Every `git push` automatically triggers a new deployment!

### Step 3: Deploy Backend

The Spring Boot backend can be deployed to:

#### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up
```

#### Option 2: Render
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Set root directory to `backend`
5. Build command: `./mvnw clean install`
6. Start command: `java -jar target/backend-0.0.1-SNAPSHOT.jar`

#### Other Options:
- **Heroku** - [Guide](https://devcenter.heroku.com/articles/deploying-spring-boot-apps-to-heroku)
- **AWS Elastic Beanstalk** - [Guide](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/java-se-platform.html)
- **Google Cloud Platform** - [Guide](https://cloud.google.com/appengine/docs/standard/java-gen2/runtime)
- **Azure App Service** - [Guide](https://learn.microsoft.com/en-us/azure/app-service/quickstart-java)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private.
