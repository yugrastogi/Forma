# Forma

### One canvas. Many minds.

**Forma is a collaborative visual workspace designed to bring ideas, creativity, and teamwork into one shared space.**

Forma aims to make brainstorming and visual collaboration easier by providing teams with an interactive environment where they can sketch, draw, create diagrams, organize thoughts, and work together.

Inspired by [Excalidraw](https://excalidraw.com/), Forma brings the concept of a visual whiteboard into a structured collaborative workspace. The goal is to give teams a common place to communicate ideas, explore concepts, and develop their thoughts visually.

Whether it is brainstorming a product, designing system architecture, mapping workflows, or organizing project ideas, Forma is designed to make the creative process more connected and intuitive.

---

## About Forma

Teams often use separate applications for brainstorming, diagramming, planning, and collaboration. Switching between these tools can make it difficult to maintain context and keep ideas organized.

Forma is designed to bring these activities together through three fundamental concepts:

- **Workspaces** — Dedicated environments for organizing projects and managing collaboration.
- **Boards** — Individual visual spaces within workspaces for different ideas and activities.
- **Canvas** — An interactive drawing environment where users can sketch, diagram, and visually organize their thoughts.

Together, these concepts form the foundation of Forma: an organized workspace with a flexible visual canvas at its center.

## Core Features

### 1. Authentication & Account Management

Forma provides user authentication to establish individual identities and secure access to the application.

The authentication system includes:

- User registration and login.
- Secure password hashing using bcrypt.
- JWT-based authentication.
- HttpOnly cookie-based session management.
- Session restoration after page refreshes.
- Protected frontend routes.
- Server-side authentication middleware.
- Request validation using Zod.

Authentication also provides the foundation for future workspace membership and resource-level permissions.

### 2. Workspaces

Workspaces are intended to provide an organized environment for projects and collaborative activities.

Each workspace can serve as a central location for related boards and team members.

Planned capabilities include:

- Creating and managing workspaces.
- Organizing boards within workspaces.
- Managing workspace members.
- Collaborating within dedicated project environments.
- Managing access to workspace resources.

### 3. Boards

Boards represent individual spaces for working on specific ideas, diagrams, or projects.

A workspace can contain multiple boards, allowing teams to organize different activities without losing the overall project structure.

Planned capabilities include:

- Creating and managing boards.
- Viewing and accessing existing boards.
- Renaming and deleting boards.
- Organizing boards within workspaces.
- Sharing boards with collaborators.

### 4. Interactive Canvas

The canvas is the central creative environment of Forma.

The planned editor will use the Excalidraw React ecosystem to provide an intuitive visual drawing experience.

Planned capabilities include:

- Freehand drawing.
- Shapes and geometric elements.
- Text and annotations.
- Connectors and arrows.
- Diagrams and flowcharts.
- Moving, resizing, and arranging elements.
- Saving and reopening canvas documents.
- Persistent board content.

The objective is to provide a flexible environment where users can express ideas visually without requiring specialized design software.

### 5. Real-Time Collaboration

Collaboration is a central part of Forma.

The application is designed to allow multiple users to work within the same board and see relevant changes as they happen.

Planned capabilities include:

- Shared collaborative board sessions.
- Live collaborator presence.
- Real-time cursor movement.
- Synchronized canvas updates.
- Joining and leaving collaborative sessions.
- Connection and reconnection handling.
- Permission-aware collaborative access.

Socket.IO is planned as the real-time communication layer between connected clients and the backend.

### 6. Sharing & Access Management

Forma is designed to make collaboration easier by allowing users to share their workspaces and boards with others.

Planned capabilities include:

- Inviting collaborators.
- Managing board access.
- Workspace membership.
- Controlled access to shared resources.
- Authorization based on user permissions.

The application is designed around the principle that users should only access resources they are authorized to view or modify.

---

## Technology Stack

Forma follows a JavaScript-based full-stack architecture.

### Frontend

| Technology       | Purpose                              |
| ---------------- | ------------------------------------ |
| React 19         | Component-based user interface       |
| JavaScript (JSX) | Frontend application logic           |
| Vite             | Development server and build tooling |
| Tailwind CSS 4   | Utility-first styling                |
| React Router 7   | Client-side routing                  |
| Zustand 5        | Client-side state management         |
| Axios            | HTTP communication with backend APIs |

### Backend

| Technology            | Purpose                    |
| --------------------- | -------------------------- |
| Node.js               | JavaScript runtime         |
| Express 5             | Backend HTTP framework     |
| JavaScript (CommonJS) | Backend application logic  |
| PostgreSQL            | Relational database        |
| Prisma 7              | ORM and database access    |
| Zod 4                 | Runtime request validation |
| pg                    | PostgreSQL driver          |

### Authentication & Security

| Technology      | Purpose                                     |
| --------------- | ------------------------------------------- |
| JSON Web Tokens | Authentication and session verification     |
| bcrypt          | Password hashing                            |
| Cookie Parser   | Reading and managing authentication cookies |
| Helmet          | HTTP security headers                       |
| CORS            | Cross-origin request configuration          |
| dotenv          | Environment configuration                   |

### Planned Integrations

| Technology       | Intended purpose                  |
| ---------------- | --------------------------------- |
| Excalidraw React | Interactive canvas editor         |
| Socket.IO        | Real-time collaboration           |
| TanStack Query   | Potential server-state management |
| Lucide React     | Application iconography           |
| shadcn/ui        | Potential reusable UI components  |

---

## System Architecture

Forma follows a client-server architecture with separate frontend and backend applications.

### High-Level Architecture

```text
                    FORMA APPLICATION
                           |
              +------------+------------+
              |                         |
          FRONTEND                    BACKEND
              |                         |
        React + Vite              Node.js + Express
              |                         |
        React Router                REST APIs
              |                         |
          Zustand                  Middleware
              |                         |
           Axios  ----------------> Controllers
                                        |
                                      Zod
                                        |
                                      Prisma
                                        |
                                   PostgreSQL


             PLANNED REAL-TIME LAYER
                         |
                     Socket.IO
                         |
                Collaborative Rooms
                         |
                 Connected Clients
```

### Frontend Architecture

The frontend is responsible for presenting the application and managing user interactions.

Its responsibilities include:

- Rendering application pages and components.
- Managing client-side navigation.
- Handling authentication forms.
- Maintaining application state.
- Communicating with backend APIs.
- Displaying loading, error, and success states.
- Managing authenticated user sessions.

The frontend uses a feature-oriented structure to keep related functionality organized and maintainable.

### Backend Architecture

The backend handles business logic, authentication, validation, and data operations.

Its responsibilities include:

- Exposing REST API endpoints.
- Processing incoming requests.
- Validating request data.
- Managing user authentication.
- Enforcing authorization.
- Executing application logic.
- Interacting with PostgreSQL through Prisma.

The backend separates routes, controllers, middleware, validation, and configuration to keep application responsibilities modular.

### Database Architecture

Forma uses PostgreSQL as its relational database and Prisma as its ORM.

The current database schema defines the `User` entity, which stores:

- Unique user identifier.
- User name.
- Email address.
- Hashed password.
- Account creation timestamp.
- Account update timestamp.

The planned data model will expand to support workspaces, memberships, boards, canvas documents, and invitations as those features are developed.

### Real-Time Architecture

The planned real-time layer will use Socket.IO to support communication between multiple clients working on shared boards.

The backend will be responsible for managing collaborative rooms, validating access, and distributing relevant events to authorized participants.

---

## Repository Structure

Forma maintains separate frontend and backend applications.

```text
Forma/
│
├── frontend/
│   └── src/
│       ├── features/
│       │   ├── auth/
│       │   │   ├── AuthLayout.jsx
│       │   │   ├── Login.jsx
│       │   │   ├── Signup.jsx
│       │   │   ├── PublicRoute.jsx
│       │   │   └── ProtectedRoute.jsx
│       │   │
│       │   └── home/
│       │       └── Home.jsx
│       │
│       ├── services/
│       │   ├── api.js
│       │   └── AuthService.js
│       │
│       ├── stores/
│       │   └── authStore.js
│       │
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js
│   │   │
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   │
│   │   ├── middleware/
│   │   │   └── requireAuth.js
│   │   │
│   │   ├── routes/
│   │   │   └── authRoutes.js
│   │   │
│   │   ├── validators/
│   │   │   └── authSchemas.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── prisma7.config.ts
│   └── package.json
│
└── README.md
```

The structure is organized around application features and responsibilities, allowing the frontend and backend to evolve independently while maintaining clear integration points.

---

## Authentication Architecture

Authentication provides the foundation for user identity and access within Forma.

The application uses JWT-based authentication with HttpOnly cookies.

### Registration Flow

```text
Signup Form
     |
     v
Frontend Request
     |
     v
Express Route
     |
     v
Zod Validation
     |
     v
Existing User Check
     |
     v
Password Hashing (bcrypt)
     |
     v
Prisma User Creation
     |
     v
PostgreSQL
     |
     v
JWT Generation
     |
     v
HttpOnly Cookie
     |
     v
Authenticated User
```

### Login Flow

1. The user submits their email and password.
2. Axios sends the credentials to the backend.
3. Express receives and validates the request.
4. Prisma retrieves the matching user.
5. bcrypt verifies the submitted password against the stored hash.
6. The backend generates a JWT.
7. The token is stored in an HttpOnly cookie.
8. The authenticated user is returned to the frontend.

### Session Restoration

When the frontend application starts, Zustand triggers a request to the `/api/auth/me` endpoint.

The backend verifies the authentication cookie and retrieves the current user.

If the session is valid, the frontend restores the user into its application state.

### Logout

The backend clears the authentication cookie, and the frontend resets the authenticated user state.

---

## Team

Forma is developed by a team of four, with responsibilities divided across the major application modules.

| Team Member | Responsibility                  | Primary Focus                                        |
| ----------- | ------------------------------- | ---------------------------------------------------- |
| Person 1    | Authentication & Account Pages  | User identity, authentication, and protected access  |
| Person 2    | Dashboard, Workspaces & Backend | Dashboard experience, workspace management, and APIs |
| Person 3    | Canvas Editor                   | Canvas integration and visual editing                |
| Person 4    | Collaboration & Sharing         | Real-time communication, presence, and sharing       |

### Shared Responsibilities

All team members coordinate on:

- Application architecture and integration.
- API contract definitions.
- Database schema design.
- Authentication and authorization requirements.
- Feature testing.
- Code reviews.
- Error handling and reliability.
- Maintaining consistency across the application.

The division of responsibilities allows each member to focus on a specific product area while contributing to one integrated application.

---

## Design Philosophy

Forma is designed around the idea that the interface should support creativity rather than distract from it.

The design direction focuses on:

- **Simplicity** — Keep the interface clear and easy to navigate.
- **Clarity** — Make tools and actions understandable.
- **Consistency** — Maintain a coherent visual language.
- **Collaboration** — Make shared work feel natural.
- **Organization** — Keep workspaces and boards structured.
- **Reliability** — Preserve user work and provide predictable interactions.

The visual identity uses a monochromatic foundation with subtle coral accents, restrained styling, clean typography, and an uncluttered layout.

---

## Vision

Forma aims to bring the visual thinking process into one collaborative environment.

From creating a workspace to sketching an idea, developing a diagram, and collaborating with teammates, the goal is to keep the entire creative process connected.

Forma is not simply intended to be another drawing tool. It is designed to become a shared environment where teams can think visually, communicate clearly, organize their work, and turn ideas into something meaningful.

---

**Forma**
