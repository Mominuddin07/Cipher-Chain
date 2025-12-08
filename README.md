# Cipher Chain

**Enterprise Crypto Intelligence & User Management Platform**  
_CMPE-272 – Enterprise Software Platform (Fall 2025)_

By **Mohammed Mominuddin**, **Shreram Palanisamy**

---

## Abstract

**Cipher Chain** is an enterprise-grade FinTech platform that combines secure multi-user authentication, role-based access control (RBAC), audit logging, and real-time crypto market intelligence.

The platform is designed for:

- Financial institutions  
- Crypto exchanges  
- Investment firms  
- Internal enterprise teams  

These stakeholders require secure access governance and transparent operational visibility.

End users such as traders, analysts, and investors use Cipher Chain to view dashboards, technical charts, and market insights. Administrators use a dedicated admin console to manage user accounts, permissions, and activity monitoring.

The system is implemented as a **single-page application (SPA)** using **React** and **Tailwind CSS**, with **Firebase** providing authentication, Firestore database, and serverless infrastructure. **TradingView** is used to embed professional-grade financial charts.

This project demonstrates how enterprise software engineering principles—such as **security-by-design**, **scalability**, and **observability**—can be applied to build a production-ready FinTech platform suitable for real-world deployment.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the App](#running-the-app)
- [Core Workflows](#core-workflows)
- [Security & Compliance](#security--compliance)
- [Project Documentation](#project-documentation)
- [Contributors](#contributors)
- [License](#license)

---

## Features

### 1. Enterprise User Management

- Multi-user authentication using **Firebase Authentication**
- Email/password login (extensible to SSO / OAuth providers)
- Protected routes to prevent unauthenticated access

### 2. Role-Based Access Control (RBAC)

- Role separation (e.g., **Admin**, **Trader/Analyst**, **Read-only**)
- Role-aware navigation and conditional rendering of UI components
- Admin-only management screens for users and configuration

### 3. Crypto Intelligence Dashboard

- Real-time crypto market monitoring
- Embedded **TradingView** charts and widgets
- Technical analysis support (indicators, timeframes, etc.)

### 4. Admin Console

- View and manage user accounts
- Assign, update, and revoke roles
- Monitor user activity and platform usage

### 5. Audit Logging & Observability

- Logging of sensitive events:
  - Logins / logouts
  - Role changes
  - Critical admin actions
- Logs stored in **Firestore** for traceability
- Basis for integration with SIEM and observability tools

---

## Architecture

Cipher Chain follows a modern, cloud-centric architecture:

- **Frontend**
  - React SPA
  - Tailwind CSS for styling
  - TradingView embedded for charts and market data

- **Backend / Cloud Services**
  - Firebase Authentication for identity and session management
  - Cloud Firestore for user metadata, RBAC, and audit logs
  - Firebase Hosting (and optionally Functions) for deployment and serverless logic

### High-Level Flow

1. User signs in via Firebase Authentication.
2. The frontend loads the user profile and role from Firestore.
3. RBAC is applied to determine:
   - Which routes the user can access
   - Which UI actions are enabled
4. Sensitive operations (e.g., role updates) are validated and written to an audit log.
5. TradingView components render charts and market insights for authorized users.

---

## Tech Stack

**Frontend**

- React  
- Tailwind CSS  
- TradingView widgets

**Backend / Cloud**

- Firebase Authentication  
- Cloud Firestore  
- Firebase Hosting  
- (Optional) Firebase Functions / Node utilities

**Tooling**

- Node.js & npm  
- PostCSS & Tailwind build pipeline  

---

## Folder Structure

A high-level view of the project structure:

- `backend/` – Backend / helper utilities (e.g., for serverless or admin tooling)  
- `functions/` – Firebase Functions-related code (if used in this project)  
- `public/` – Static assets and base HTML template  
- `scripts/` – Helper or deployment scripts  
- `src/` – React SPA source (components, pages, routing, hooks, utilities)  
- `firestore.rules` – Firestore security rules  
- `FIREBASE_SETUP.md` – Firebase setup and configuration guide  
- `FIX_AUDIT_LOGGING.md` – Notes and fixes related to audit logging and route protection  
- `PROJECT_PRESENTATION.md` – Written version of the project presentation  
- `Cipher-Chain MAIN.pptx` – Slide deck for the project presentation  
- `package.json` / `package-lock.json` – Project metadata and dependencies  
- `postcss.config.js` – PostCSS configuration  
- `tailwind.config.js` – Tailwind CSS configuration  

---

## Getting Started

All commands below assume you are using a terminal on macOS (e.g. **Terminal** or **iTerm2**).

### Prerequisites

- **Node.js** (LTS, e.g. 18+)  
- **npm**  
- A **Firebase Project** with:
  - Authentication enabled
  - Cloud Firestore enabled
  - (Optional) Hosting and Functions if you want full deployment parity

### Installation

1. **Clone the repository**

        git clone https://github.com/Mominuddin07/Cipher-Chain.git
        cd Cipher-Chain

2. **Install dependencies**

        npm install

### Configuration

1. **Create Firebase project & web app**

   - Go to the Firebase console  
   - Create a new project  
   - Add a Web App and get the Firebase config values

2. **Configure environment variables**

   Create a local environment file (for example, `.env.local`) and add your Firebase config keys.  
   The exact variable names depend on how the code is written, but a typical pattern is:

        VITE_FIREBASE_API_KEY=...
        VITE_FIREBASE_AUTH_DOMAIN=...
        VITE_FIREBASE_PROJECT_ID=...
        VITE_FIREBASE_STORAGE_BUCKET=...
        VITE_FIREBASE_MESSAGING_SENDER_ID=...
        VITE_FIREBASE_APP_ID=...

3. **Apply Firestore security rules**

   Use the provided `firestore.rules` file as your Firestore ruleset (or as a starting point) to enforce RBAC and least-privilege access.

4. **Follow project-specific setup**

   Refer to `FIREBASE_SETUP.md` in the repo for any additional project-specific steps (service accounts, emulators, hosting configuration, etc.).

### Running the App

In most React + Vite / CRA setups, you’ll use one of the following commands from the project root:

- Development server (try this first):

        npm run dev

- Alternate (if the project uses Create React App style scripts):

        npm start

After starting the dev server, open the URL printed in the terminal (commonly):

- `http://localhost:5173` (Vite) or  
- `http://localhost:3000` (Create React App)

If the project includes Firebase Functions or a separate backend under `backend/` or `functions/`, follow any additional instructions inside those directories (for example, using `firebase emulators:start` or custom npm scripts).

---

## Core Workflows

### User Authentication

1. User navigates to the Cipher Chain login page.
2. Authenticates via Firebase Authentication.
3. On successful login, the SPA loads:
   - User profile info
   - User role and permissions
4. User is redirected to:
   - Trader/Analyst dashboard (for market intelligence), or  
   - Admin console (for administrators).

### Role & User Management (Admin)

- View a list of all registered users.  
- Modify user roles (promote/demote to admin, assign read-only, etc.).  
- Deactivate or restrict user accounts.  
- All sensitive changes are written to the audit log for later review.

### Market Intelligence Dashboard

- Access live crypto charts and market data via TradingView.  
- Perform technical analysis using charting tools and indicators.  
- Use the dashboard to support trading and risk decision-making.

### Audit Logging

- Capture key events:
  - Login / logout
  - Role changes
  - High-impact operations
- Persist logs in Firestore with timestamps and user identifiers.  
- See `FIX_AUDIT_LOGGING.md` for details on known issues and fixes related to logging and route protection.

---

## Security & Compliance

Cipher Chain incorporates several security-by-design principles:

### Authentication & Authorization

- Identity handled by **Firebase Authentication**  
- RBAC enforced in the frontend (route guards, protected components)  
- Firestore rules designed around user roles and permissions  

### Least Privilege

- Users are granted only the minimum set of permissions required for their role.  
- Admin-only operations are locked down both in UI and backend rules.

### Auditability

- Sensitive actions generate audit log entries.  
- Logs can be used for:
  - Internal audits  
  - Incident investigation  
  - Compliance reporting (if extended)

### Scalability

- Serverless architecture scales with usage.  
- Stateless SPA can be served from a CDN or Firebase Hosting for low latency.

---

## Project Documentation

Additional documentation in the repository includes:

- `FIREBASE_SETUP.md` – Detailed Firebase setup and configuration instructions  
- `FIX_AUDIT_LOGGING.md` – Issues, fixes, and notes related to audit logging and route protection  
- `PROJECT_PRESENTATION.md` – Narrative version of the project presentation  
- `Cipher-Chain MAIN.pptx` – Slide deck for demos / academic presentation  

---

## Contributors

- **Mohammed Mominuddin**  
- **Shreram Palanisamy**

---

## License

No explicit license is currently defined for this repository.  

If you plan to use this project beyond academic or personal experimentation, please contact the authors to clarify licensing and usage permissions.

