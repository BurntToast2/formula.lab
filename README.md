# Formula Lab

Formula Lab is a web-based team and task management platform built for SETU Formula Student. It gives student engineering teams a shared workspace to organise tasks, assign responsibilities, track progress, and onboard new members.

## Features

- Email and password authentication
- Invitation-based account creation restricted to SETU email addresses
- Team-based user organisation
- Task creation with descriptions, priorities, deadlines, and assignees
- Task status tracking: to do, in progress, completed, and cancelled
- Role-aware task editing for team leaders and task creators
- Team-grouped task overview
- Email invitations with secure, expiring tokens
- Server-side validation and authenticated server actions
- Relational data model for users, teams, tasks, assignments, invitations, and sessions

## Technology

- Next.js 16
- React 19
- TypeScript
- PostgreSQL hosted on Neon
- Drizzle ORM
- Better Auth
- Zod
- Resend
- Tailwind CSS

## Project Purpose

Formula Lab supports the collaborative workflow of a university Formula Student team. The platform centralises task ownership and progress tracking so members can coordinate engineering work across teams such as Suspension, Chassis, Drivetrain, Electronics, and Brakes.

The project demonstrates full-stack application development with secure authentication, database-backed workflows, server-side authorisation, form validation, transactional task assignment, and email-based onboarding.
