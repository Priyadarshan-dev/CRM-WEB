# Project Architecture Guide

Welcome to the LeadCRM project! This codebase is organized using a **Feature-Based Clean Architecture**. This structure is designed to make it very easy for you to know exactly where to find the code you need to work on.

Instead of hunting through giant `components` or `pages` folders, our code is split up based on *what it does* and *who sees it*.

## Folder Structure Overview

Everything you need to care about is inside this `src/` folder. It is split into two main sections: `core` and `features`.

### 1. `core/` (The Global Stuff)
This folder contains the plumbing of the application that affects everything globally. You will rarely need to build new UI features here.
- **`context/`**: Global state and security (e.g., AuthContext for logging in, RoleGate for security).
- **`services/`**: Everything related to the database, network, and APIs (e.g., `mockApi.js`).

### 2. `features/` (The UI & Screens)
This is where you will spend 95% of your time! This folder is split entirely by the different roles in our app. If you are tasked with building a screen or component, check who uses it first.
- **`admin/`**: Screens and logic that ONLY the Admin role can see (e.g., AdminDashboard, Managers list).
- **`manager/`**: Screens and logic that ONLY the Manager role can see (e.g., ManagerDashboard, Teams list).
- **`executive/`**: Screens and logic that ONLY the Executive role can see (e.g., Daily Tasks).
- **`shared/`**: Reusable pieces of the UI that stretch across multiple roles (e.g., Sidebar, NotificationBell, Layouts).

## Golden Rules
1. **Never import across roles:** A component in `features/manager` should never directly import a component from `features/admin`. If they both need the exact same thing, that thing belongs in `features/shared`.
2. **Global Logic goes to `core`:** If you are writing a function that fetches data or checks user permissions across the whole app, it belongs in `core/`, not in a specific feature.

Happy coding!
