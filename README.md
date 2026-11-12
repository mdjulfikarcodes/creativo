<div align="center">
  <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200&auto=format&fit=crop" alt="Creativo Logo" width="120" style="border-radius: 20px;" />
  <h1>🎬 Creativo (StudioSpace)</h1>
  <p><strong>A Premium Peer-to-Peer Creative Studio Marketplace</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-Node-green?style=for-the-badge&logo=express)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![BetterAuth](https://img.shields.io/badge/BetterAuth-Authentication-purple?style=for-the-badge)](https://better-auth.com/)
</div>

---

## 📖 Project Overview

**Creativo** is a full-stack, peer-to-peer marketplace designed specifically for the creative industry. It bridges the gap between **Studio Hosts** (who own premium spaces like photography lofts, sound stages, podcast lounges, and music suites) and **Creators** (filmmakers, photographers, podcasters, and musicians) who need to rent them. 

Built with a focus on seamless user experience, secure authentication, and real-time data handling, Creativo eliminates the friction of studio rentals by providing a centralized, highly-responsive, and feature-rich platform.

---

## 🌐 Live Deployments

- **Frontend (Vercel):** [https://creativo-frontend-one.vercel.app](https://creativo-frontend-one.vercel.app)
- **Backend (Render):** [https://creativo-backend.onrender.com](https://creativo-backend.onrender.com) *(Replace with your actual Render link)*
- **Frontend Repository:** [GitHub Link](https://github.com/your-username/creativo-client)
- **Backend Repository:** [GitHub Link](https://github.com/your-username/creativo-server)

---

## ✨ Comprehensive Feature List

### 🏢 For Studio Hosts (Owners)
- **Studio Management (CRUD):** Easily add, update, and delete studio listings. Include detailed specs like title, category, hourly rate, security deposit, max capacity, amenities, and high-res images.
- **Host Dashboard:** A dedicated analytics dashboard showcasing total studios, total bookings, pending approvals, total revenue generated, and total reviews received.
- **Booking Management:** View incoming booking requests, approve (confirm) or decline them, and manage the entire lifecycle of a booking.
- **Read-Only Security:** Auto-populated host details (email/name) tied securely to the verified account credentials.

### 🎨 For Creators (Renters)
- **Explore & Discover:** Browse a beautiful grid of premium studios with advanced filtering options (Search by title/location, filter by category, price range, and capacity).
- **Smart Double-Booking Prevention:** The backend automatically checks for overlapping time slots and prevents double-booking of confirmed reservations.
- **Wishlist System:** Save favorite studios to a personalized wishlist for quick access.
- **PDF Invoice Generation:** Download professional PDF receipts for confirmed bookings using `jsPDF`.
- **My Bookings Hub:** Track the status of all bookings (Pending, Confirmed, Cancelled, Completed) and leave verified reviews.

### 🔐 Authentication & Security
- **BetterAuth Integration:** Robust email/password and Google OAuth login systems.
- **JWT & HTTPOnly Cookies:** Secure session management using JSON Web Tokens (JWT) stored in HTTP-encrypted cookies to prevent XSS attacks.
- **Cross-Domain Session Handling:** Configured with `SameSite=None` and `Secure=true` for seamless session persistence across Vercel (Frontend) and Render (Backend).
- **Route Protection:** Next.js middleware (`proxy.ts`) ensures private routes (Dashboard, Add Studio) are only accessible to authenticated users.

### 🎨 UI/UX & Design
- **Fully Responsive:** Optimized for Mobile, Tablet, and Desktop using Tailwind CSS.
- **Premium Aesthetics:** Features Glassmorphism UI, animated gradient backgrounds, and smooth transitions.
- **Theme Customization:** Seamless Light/Dark mode toggling powered by `next-themes`.
- **Micro-Interactions:** Hover effects, loading skeletons, and animated toasts (Sonner) for enhanced UX.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework:** Next.js 14 (App Router, Server Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`, `useSyncExternalStore`)
- **Form Handling:** React Hook Form + Zod Validation
- **Authentication:** BetterAuth Client

### Backend
- **Framework:** Node.js, Express.js
- **Database:** MongoDB (Native Driver)
- **Authentication:** JWT (via `jose`), JWKS (JSON Web Key Set) verification
- **Middleware:** CORS, CookieParser, Express JSON

---

## 🧠 Key Technical Challenges Solved

1. **Cross-Domain Session Persistence (Vercel ↔ Render):** 
   Solved the issue of session cookies being dropped across different domains by configuring `advanced.defaultCookieAttributes` (`sameSite: "none"`, `secure: true`) in BetterAuth and deploying correct `trustedOrigins`.
2. **Next.js Middleware (Edge Runtime) Limitations:**
   Initially, performing complex session fetches inside `proxy.ts` caused timeouts. Refactored the middleware to perform lightweight cookie checks, moving heavy session validation to client-side React hooks.
3. **MongoDB ObjectId vs String Mismatch:**
   Implemented robust backend logic (`flatMap`, conditional type casting) to ensure studio IDs match correctly across different collections, preventing empty dashboard stats.
4. **Double-Booking Prevention Logic:**
   Engineered a custom MongoDB query to check for overlapping time slots (`startTime < newEndTime && endTime > newStartTime`) before creating a new booking, ensuring data integrity.

---

## 🚀 Local Setup & Installation

Follow these steps to run the project locally.

### 1. Clone the Repositories
```bash
git clone https://github.com/mdjulfikarcodes/creativo-client.git
git clone https://github.com/mdjulfikarcodes/creativo-server.git