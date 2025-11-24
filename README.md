<div align="center">
  <img src="public/logo.png" alt="Owlet Study Buddy Logo" width="120" height="120" />
  
  # Owlet Study Buddy
  
  **Your Intelligent University Support Companion**
  
  [![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

<br />

## 📋 Overview

**Owlet Study Buddy** is a modern, AI-powered chatbot designed to assist university students with their academic queries. This project aims to support university students by providing free API access via a local server model for their projects. Additionally, this repository features a student support chatbot built using the same local API. Built with a focus on user experience, it features a sleek, responsive interface and real-time interaction capabilities to provide instant support.

## ✨ Features

-   **🤖 AI-Powered Assistance**: Intelligent responses to student queries.
-   **🎨 Modern UI/UX**: A clean, glassmorphism-inspired design with smooth animations.
-   **⚡ Real-time Interaction**: Instant feedback and conversation flow.
-   **📱 Fully Responsive**: Optimized for both desktop and mobile devices.
-   **🎭 Dynamic Interface**: Engaging elements like rolling text and interactive sidebars.

## 🧠 Engineering Highlights

### Hybrid AI Architecture
Owlet implements a sophisticated **model routing system** that allows users to switch seamlessly between:
-   **Local Intelligence**: A cost-effective **Phi-3** model hosted on a custom Azure Virtual Machine for fast, unlimited queries.
-   **Cloud Powerhouse**: The **Llama 3.3 70B** model via Groq for complex reasoning and high-fidelity responses.

### Serverless Security Architecture
To ensure enterprise-grade security, this project uses a **Backend-for-Frontend (BFF)** pattern with Vercel Serverless Functions:
-   **Zero Key Exposure**: Sensitive API keys (Groq, Azure) are stored server-side and never exposed to the client browser.
-   **Secure Proxying**: Custom endpoints (`/api/chat`, `/api/groq`) act as secure gateways, sanitizing requests before forwarding them to upstream AI providers.

### Progressive Web App (PWA)
Engineered to provide a native-app experience on the web:
-   **Installable**: Custom `manifest.json` configuration allows users to install Owlet to their home screen.
-   **Platform-Aware**: A custom `InstallPrompt` component detects the user's device (iOS vs. Android) and serves the appropriate installation instructions.
-   **Mobile Optimization**: Implemented `viewport-fit=cover` and specific touch-event handling to prevent "rubber-banding" and ensure a native feel.

## 🔧 Technical Challenges Solved

### 🔐 Bridging HTTPS and HTTP (Mixed Content)
**The Challenge**: Modern browsers block secure (HTTPS) websites from making requests to insecure (HTTP) APIs. Our Azure VM exposes an HTTP endpoint, while Vercel serves the frontend over HTTPS.
**The Solution**: Built a custom **Vercel Serverless Proxy** that tunnels requests from the secure frontend to the insecure backend. This allows the browser to communicate strictly over HTTPS while the serverless function handles the HTTP handshake, effectively bypassing the Mixed Content limitation securely.

### 📱 Native-Like Mobile UX
**The Challenge**: Web apps often feel "floaty" on mobile due to address bars, rubber-band scrolling, and virtual keyboard shifts.
**The Solution**:
-   **Fixed Viewports**: Locked the body scroll and used `interactive-widget=resizes-content` to handle the virtual keyboard gracefully.
-   **Smart Input**: Modified the "Enter" key behavior on mobile to insert new lines instead of submitting, matching native messaging app patterns.

## 🛠️ Tech Stack

-   **Frontend Framework**: React 18
-   **Build Tool**: Vite
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS & Vanilla CSS
-   **Backend**: Vercel Serverless Functions (Node.js)
-   **AI Infrastructure**: Azure VM (Phi-3), Groq API (Llama 3.3)
-   **PWA**: Web App Manifest, iOS Meta Tags
-   **Icons**: Lucide React
-   **Animations**: Framer Motion

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v16 or higher)
-   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Faisalhakimi22/owlet-study-buddy.git
    cd owlet-study-buddy
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ for Students
</div>
