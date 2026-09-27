# CONECTA Web

Office and management client for **CONECTA**, an operations and institutional communications platform. It is the place where a team reads the inbox, moves work across states, keeps the document library, tracks paperwork deadlines, and administers work groups. The API decides which transitions are legal. This app decides which of those actions a manager sees, and how messages, documents, and groups are organized on screen.

## Who uses it

| Role | In the app |
| --- | --- |
| **ADMIN** and **SUPERVISOR** | Managers. Home opens on a Kanban board. They can drag or select a new state, and they see Configuration, Groups, and Analytics in the navigation. |
| **OPERARIO** | Follows and answers messages. Home is a list. State changes are hidden on the list and on the Kanban. Configuration, Groups, and Analytics are not in the navigation, and Analytics redirects them away. On Groups they can only update their own WhatsApp number. |

The message detail screen still shows a status control without the same manager check used on the list. The API only accepts a manual state change from an admin or a supervisor.

Signing in stores a JWT used by the app and by the route guard. A rejected session returns the user to login. There is no self-service registration screen.

## Messages

The home inbox is the main workspace. A message is active, or it is historical when its state is closed or it has been archived. Managers can switch between list and Kanban. The Kanban hides closed and archived items.

Creating a message requires a title, a category, and a starting workflow state. The app prefers the state named `NUEVO` and composes the title as `Category — Subcategory` from the catalog. It also attaches the browser's location when the user allows it.

Each message can be a **new topic** or a **continuation** of an earlier one. The list marks that distinction.

The header search follows the user's preference: semantic (the default) or literal.

A message detail shows the description, comments, versioned documents, status history, and a formal PDF. Documents uploaded anywhere in the app are always attached to a message. A new file with the same name becomes a new version; older versions stay visible under the latest one.

## Living document

Chat, files, history, and an AI summary of the thread update live. Video uploads are limited to 50 MB. This is the same collaboration surface used when a map marker is opened.

## Paperwork, calendar, and map

The Paperwork section is a filtered view of messages: category Documentation, message type paperwork, or a title that mentions paperwork. It shows type, sender, recipient, state, deadline, file, and last response.

The calendar uses those same messages. It counts how many are overdue and how many fall due in the next seven days.

A separate paperwork API still exists in the client (`/tramites`, including a create form and its own detail page). The primary Paperwork navigation does not use that API. Day-to-day paperwork is the filtered message inbox. The standalone create form is not wired to the live user directory.

The map plots messages that have coordinates. The default center is Lima. A marker opens the living document.

## Documents and groups

The repository is the library of files already attached to messages. Users search and filter it, and managers can export it. A new upload still has to name the message it belongs to.

**Groups** are how work is scoped. Managers create a group, set the active group, manage members, and assign which catalog topics that group uses. They can also send the pending-work email digest. Every user can store a WhatsApp number in international format for alerts.

**Configuration** holds personal preferences for everyone who can open it: default inbox, search mode, and which notification channels they want. Managers additionally edit team branding, categories, subcategories, and folders. The mobile app reads that catalog; it does not edit it.

## Analytics

Managers get counts for new, in progress, completed, overdue, closed, and cancelled work, plus new topics versus continuations and average response time. Charts break the same data down by category, message type, sender, recipient, location, and priority, and show created versus closed over seven days. Operators cannot open this page.

## What the web app assumes about workflow

States come from the API. The screens rely on these names: `NUEVO`, in progress, `COMPLETADO`, `CERRADO`, and `CANCELADO`.

A reply on the server moves a message to completed, and a reply that means "ok fin" closes it. The web app does not reimplement that rule; it displays the state the API returns. Closing archives the message, which is why closed work leaves the Kanban and appears in history.

Creating a message can be queued in the browser and sent when the connection returns. Other actions are online only.

## Stack

Next.js (App Router) and React, with TypeScript, TanStack Query, Axios, and Zod. Tailwind for UI, a Kanban board, Recharts for analytics, Leaflet for the map, jsPDF for a client-side formal PDF, Dexie for the offline create queue, and a Socket.IO client for the living document. It is built as a progressive web app.
