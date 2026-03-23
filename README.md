# 🤖 Automated Office Assistant

**A Zero-Map, Vision-Based Indoor Navigation System for Comma Body v2.**

Built for **comma_hack 6**, this project transforms the Comma Body v2 into an intelligent office companion. By leveraging the **Comma Four**'s triple-camera setup and offloading heavy VLM (Vision Language Model) reasoning to an **eGPU**, the assistant can navigate complex office environments without pre-built maps or LIDAR.

---

## 🚀 How It Works

The system operates on a hybrid architecture that splits high-level reasoning from low-level control:

1.  **Vision-Based Navigation (VLM)**: Instead of traditional SLAM, the robot uses a Vision Language Model (like Moondream2 or Llama-3-Vision) running on an eGPU. It "looks" at the camera feed and identifies landmarks (e.g., "Coffee Machine," "Pizza Box," "Judge") in natural language.
2.  **PID Control Loop**: Once a landmark is identified, a Python service on the Comma Four calculates the lateral error and uses a PID controller to steer the Body towards the target.
3.  **Autonomous Search**: If a landmark is lost, the robot initiates a slow 360-degree rotation ("Search Mode") until the VLM re-acquires the target.
4.  **Gemini Scene Analysis**: High-level scene understanding is provided by Gemini, allowing the robot to describe its surroundings, identify obstacles, and report on environmental conditions.
5.  **Voice Interaction**: The robot uses Text-to-Speech (TTS) to announce its missions and share its "thoughts" with humans in the office.

---

## 🛠️ Tech Stack

-   **Languages**: Python (Robot Control), TypeScript (Web Dashboard), JavaScript (Server).
-   **Hardware**: Comma Four, Comma Body v2, External GPU (eGPU).
-   **Frameworks**: React, Vite, Express, Tailwind CSS.
-   **Robotics**: Cereal (Messaging), BodyJim (Body Interface).
-   **AI**: Gemini API (Scene Analysis), VLM (Zero-shot Detection).

---

## 📦 Installation

### 1. Robot Setup (Comma Four)

Ensure you have `bodyjim` and `cereal` installed on your Comma Four (running AGNOS):

```bash
# SSH into your Comma Four
pip install bodyjim
```

Run the assistant script:

```bash
python3 scripts/office_assistant.py
```

### 2. Dashboard Setup (Web UI)

The dashboard provides a mission selector and real-time monitoring.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

---

## 🖥️ Dashboard Features

-   **Mission Selector**: Trigger specific tasks (e.g., "Find Judge").
-   **Live AI Logs**: Watch the VLM's reasoning process in real-time.
-   **Scene Analysis**: Click the CPU icon to get a natural language description of the office via Gemini.
-   **Voice Mode**: Toggle robotic speech feedback.
-   **Hardware Telemetry**: Monitor battery, balancing state, and camera health.

---

## 🤝 Contributing

We welcome contributions to improve the VLM accuracy, PID tuning, or dashboard UI! 

If you wish to contribute or have any questions, please reach out:

**Email**: [celestin.np@gmail.com](mailto:celestin.np@gmail.com)

---

*Built with ❤️ for the Comma.ai community.*
