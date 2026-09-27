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

---

## 📂 Project Directory Structure

```text
type-speed/
├── package.json                   # Root workspace scripts
├── .gitignore                     # Git ignore rules
│
├── client/                        # React Frontend (Vite)
│   ├── index.html                 # App shell with Google Fonts & favicon
│   ├── package.json               # Client dependencies
│   ├── tailwind.config.js         # Theme palettes and keyframe animations
│   ├── postcss.config.js          # PostCSS configuration
│   └── src/
│       ├── main.jsx               # React entrypoint
│       ├── App.jsx                # Router configuration & providers
│       ├── index.css              # Theme CSS variables & glassmorphism
│       ├── components/
│       │   ├── Navbar.jsx         # Responsive top navigation & user drawer
│       │   ├── Footer.jsx         # Modern platform footer
│       │   ├── Keyboard.jsx       # Interactive visual on-screen keyboard
│       │   ├── ProtectedRoute.jsx # User authentication route guard
│       │   └── DeveloperRoute.jsx # Developer role route guard
│       ├── context/
│       │   ├── AuthContext.jsx    # Session & user state manager
│       │   ├── ThemeContext.jsx   # 8 themes, sound & keyboard settings
│       │   └── ToastContext.jsx   # Animated toast alerts
│       ├── pages/
│       │   ├── LandingPage.jsx    # Modern hero, features & ₹1 promo
│       │   ├── LoginPage.jsx      # Normal user login
│       │   ├── RegisterPage.jsx   # User registration with strength meter
│       │   ├── ForgotPage.jsx     # Account recovery & password reset
│       │   ├── DashboardPage.jsx  # User metrics, best WPM & test history
│       │   ├── PracticePage.jsx   # Core typing test interface with sound
│       │   ├── SubscriptionPage.jsx# ₹1 Premium plan details
│       │   ├── PaymentPage.jsx    # UPI ID & dynamic QR code payment
│       │   ├── UserPaymentsPage.jsx# "My Payments" status & refund history
│       │   ├── SettingsPage.jsx   # Appearance, 8 themes & sound customizer
│       │   ├── ProfilePage.jsx    # User profile & account management
│       │   └── developer/
│       │       ├── DeveloperLoginPage.jsx    # Isolated developer sign in
│       │       ├── DeveloperDashboardPage.jsx# Admin metrics overview
│       │       └── DeveloperPaymentsPage.jsx # Approve/Reject/Refund console
│       └── services/
│           ├── api.js             # REST API client
│           └── soundService.js    # Web Audio API sound synthesizer
│
└── server/                        # Express Backend
    ├── package.json               # Server dependencies (ES Module)
    ├── index.js                   # Express server entrypoint & rate limiting
    ├── .env                       # Local environment variables
    ├── .env.example               # Template environment configuration
    ├── config/
    │   └── constants.js           # Enums, statuses, and pricing constants
    ├── models/
    │   └── dbStore.js             # Mongoose schemas + persistent JSON fallback
    ├── middleware/
    │   ├── auth.js                # JWT & Developer role middlewares
    │   └── rateLimiter.js         # API & auth rate limiters
    ├── controllers/
    │   ├── authController.js      # Register, login, dev login, recovery
    │   ├── userController.js      # Profile, preferences, stats
    │   ├── typingController.js    # Passages & score calculations
    │   ├── paymentController.js   # QR config, payment submit, history
    │   └── developerController.js # Approvals, rejections, refunds, users
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── typingRoutes.js
    │   ├── paymentRoutes.js
    │   └── developerRoutes.js
    └── utils/
        ├── passwords.js           # Bcrypt hashing & verification
        ├── tokens.js              # JWT creation & validation
        └── qrGenerator.js         # Dynamic UPI QR generation
```

---

## ⚙️ Installation & Running Locally

### 1. Prerequisites
- **Node.js** (v18 or newer)
- **npm** (v9 or newer)
- *(Optional)* **MongoDB** (Local mongod or MongoDB Atlas URI). If MongoDB is not running, the application automatically uses its built-in persistent JSON database so you can test everything immediately without installing MongoDB!

### 2. Clone / Open Directory
```bash
cd type-speed
```

### 3. Server Configuration
Navigate to the `server/` directory:
```bash
cd server
cp .env.example .env
npm install
```

Configure your `.env` settings as needed:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/type-speed
JWT_SECRET=typespeed_jwt_super_secure_production_secret_key_change_me_in_prod
DEVELOPER_EMAIL=girish@gmail.com
DEVELOPER_PASSWORD=1234567890
DEVELOPER_NAME=Girish
DEVELOPER_SECRET_KEY=DEV_ADMIN_SECRET_2025
UPI_ID=typespeed@upi
UPI_MERCHANT_NAME=TYPE SPEED
APP_ORIGIN=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
# Server will run at http://localhost:5000
```

### 4. Client Setup & Launch
In a new terminal window:
```bash
cd client
npm install
npm run dev
# Frontend will be live at http://localhost:5173
```

---

## 🔐 Developer / Admin Credentials

The backend automatically seeds the configured developer administrator account on initial startup:

- **Developer Sign In URL**: `http://localhost:5173/developer/login`
- **Developer Registration URL**: `http://localhost:5173/developer/register`
- **Email**: `girish@gmail.com`
- **Password**: `1234567890`
- **Master Developer Secret**: `DEV_ADMIN_SECRET_2025`

> [!NOTE]
> Developer credentials and the Master Developer Secret are never exposed to the client bundle. They are authenticated server-side against protected JWT and role-based middlewares.

---

## 💳 ₹1 Payment & Refund Flow Explained

1. **User Subscription**:
   - The user visits `/subscription` and clicks **SUBSCRIBE FOR ₹1**.
   - Navigates to `/payment` where they can copy the merchant UPI ID (`typespeed@upi`) or scan the dynamic QR Code.
   - The user submits their 12-digit UTR / Transaction ID (e.g. `UTR_492817293812`).
   - The payment is stored in `Pending` status. User subscription is set to `pending`.

2. **Developer Approval**:
   - The developer logs into `/developer/login` &rarr; `/developer/payments`.
   - The transaction appears in the **Pending** tab.
   - Clicking **APPROVE** marks the payment as `Approved` and sets the user's subscription to `active`.
   - The user immediately receives their Pro badge and unlocked features.

3. **Rejection & Audited Refund**:
   - If a payment is invalid, the developer clicks **REJECT**.
   - Payment status becomes `Rejected` and `refundStatus` transitions to `Initiated`.
   - The developer can then click **REFUND** to update the status to `Completed` with the bank refund reference ID.
   - The user sees the clear status and refund reference in their **My Payments** (`/payments`) history.

---

## 🧪 Testing the Integration

You can run the automated end-to-end integration test anytime to verify all 14 backend flows:
```bash
node server/index.js
# In another terminal:
node ../scratch/test-flow.js
```

---

## 📄 License
MIT &copy; TYPE SPEED Engineering. All rights reserved.
