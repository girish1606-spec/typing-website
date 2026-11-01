# ⚡ TYPE SPEED — Production-Ready Typing Practice Platform

> **Master Your Typing Speed.** Practice smarter. Type faster. Improve your accuracy.

**TYPE SPEED** is a modern, commercial-grade full-stack typing practice web application designed for typists, software engineers, students, and competitive keyboard enthusiasts. It combines real-time WPM metrics, keystroke accuracy analysis, realistic synthesized mechanical switch acoustics, an interactive tactile on-screen keyboard, dark/light themes, and a secure ₹1 UPI/QR subscription workflow with developer approvals and audited refunds.

---

## 🚀 Key Features

### 1. Website Branding & Modern UX
- **Branding**: Clean, minimal keyboard and velocity-inspired typography with speed accents.
- **Visuals**: Glassmorphism styling, ambient radial glows, micro-interactions, and responsive layout across mobile, tablet, laptop, and desktop.
- **8 Custom Themes**: Midnight, Ocean, Forest, Sunset, Cyber, Neon, Classic, and Minimal with instant live preview.

### 2. Typing Practice Engine
- **Accurate WPM Calculation**: Real-time net words-per-minute calculated based on standardized character chunks `(correctChars / 5) / (elapsedMinutes)`.
- **Character-Level Feedback**: Distinct visual cues for correct keystrokes, typos, and active target characters with blinking cursor.
- **Multiple Challenge Modes**:
  - **Quick Sprint** (15 seconds)
  - **1 Minute Challenge** (60 seconds)
  - **3 Minutes Endurance** (180 seconds)
  - **5 Minutes Marathon** (300 seconds)
  - **Practice Mode** (Unlimited typing flow with manual finish)
- **Detailed Result Modal**: Final WPM, Accuracy %, Errors, Correct characters, Time taken, and custom skill badges (*Typing Grandmaster, Lightning Demon, Pro Typist*).
- **Celebratory Effects**: Web Audio fanfare chimes and particle confetti for milestones.

### 3. Real Typing Sounds (Web Audio API)
- Zero-latency synthesized audio profiles without external audio file loading delays:
  - **Mechanical Thock**: Deep tactile acoustic actuation with resonance.
  - **Soft Dome**: Cushioned quiet membrane keystrokes.
  - **Tactile Click**: Snappy, crisp high-frequency switch.
  - **Typewriter**: Vintage mechanical metal strike.
  - **Minimal Tap**: Modern subtle digital blip.
  - **Retro 8-Bit**: Arcade chip audio feedback.
  - **Silent**: Muted typing.
- Independent volume control slider, keypress error buzzers, and a dedicated **TEST SOUND** button.

### 4. Interactive Tactile On-Screen Keyboard
- Visual QWERTY keyboard including number row, function modifiers, and spacebar.
- Real-time active keypress reaction with 3D tactile push animations.
- Smart target-key highlighting guiding fingers for touch-typing muscle memory.
- Customizable keycap shapes (*rounded, pill, sharp*), sizes (*compact, standard, large*), and spacing.

### 5. Authentication & Account Recovery
- **User Registration**: Password visibility toggle, live password strength meter (Weak/Medium/Strong), and field validation.
- **User Sign In**: Secure login with JWT authentication and bcrypt password hashing.
- **Account Recovery Flow**:
  - **Forgot Password**: Generates secure recovery tokens to reset passwords.
  - **Forgot Email**: Masked account recovery lookup preserving account privacy.
  - **Create New Account**: Fresh registration fallback without exposing or modifying previous accounts.

### 6. Dedicated Developer Sign In & Admin Console
- **Separate Developer Portal** (`/developer/login`): Completely isolated from normal user login.
- Protected by backend role verification and environment credentials (`DEVELOPER_EMAIL`, `DEVELOPER_PASSWORD`).
- **Developer Metrics Dashboard** (`/developer/dashboard`):
  - Total Payments, Pending Approvals, Total Revenue, Approved Subscriptions, Registered Users, Global Typing Tests.
- **Developer Payment Console** (`/developer/payments`):
  - Search and filter by status: *All, Pending, Approved, Rejected, Refunded*.
  - **APPROVE** button: Activates the user's ₹1 Premium subscription instantly.
  - **REJECT** button: Flags unverified payments and initiates the refund workflow.
  - **PROCESS REFUND** button: Records genuine bank/UPI refund state (*Initiated, Completed, Failed*) with refund reference IDs and audit notes.

### 7. ₹1 Subscription & Payment Processing
- **₹1 Lifetime Premium Pass**: Transparent pricing with complete benefit breakdown.
- **Dual Payment Options**:
  - **UPI ID**: Official copyable merchant UPI ID (`typespeed@upi`).
  - **Dynamic QR Code**: High-resolution generated QR code with `SCAN & PAY` badge.
- **Transaction Submission**: User submits their 12-digit UTR / Transaction ID.
- **State Machine Verification**:
  - `Pending` &rarr; `Approved` &rarr; `Active Subscription`
  - `Pending` &rarr; `Rejected` &rarr; `Refund Initiated` &rarr; `Refund Completed`
- Payment status is always validated and controlled by backend developer approvals, never auto-approved on client button click.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS, Framer Motion, Lucide React, React Router DOM v7 |
| **Audio Engine** | Web Audio API (Synthesized oscillators, noise buffers, and biquad filters) |
| **Backend** | Node.js, Express.js, Helmet, Express Rate Limit, CORS, Dotenv |
| **Security** | JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Role-Based Access Control |
| **Database** | MongoDB / Mongoose + Embedded Persistent JSON Engine Fallback |
