
# SleeperSwift | Premium Bus Booking System

A high-fidelity web application for the Ahmedabad ↔ Mumbai sleeper bus route, featuring integrated meal booking and an AI-driven confirmation probability engine.

## 1. Project Overview
This project satisfies the AI/ML Software Engineer assignment. It demonstrates a seamless booking flow, a robust administrative backend (simulated via LocalStorage and architectural blueprints for MongoDB), and a predictive model for booking stability.

**Public Prototype Link:** [https://sleeper-swift.example.com](https://sleeper-swift.example.com) *(This application serves as the functional prototype)*

## 2. Defined Core Features
1.  **Multi-Deck Seat Selection:** Interactive visualizer for Upper and Lower berths with real-time occupancy tracking.
2.  **Integrated Meal Marketplace:** Gourmet meal selection (Veg/Non-Veg/Jain) with authentic dish imagery.
3.  **AI Confirmation Predictor:** Real-time ML-driven probability score (percentage) based on lead time, demand, and occupancy.
4.  **Admin Command Center:** Secure dashboard for fleet management, inventory overrides, and revenue analytics.
5.  **Smart Routing:** Support for intermediate stations (Vadodara, Surat, Vapi) with dynamic timing offsets.
6.  **Gemini-Powered Concierge:** An AI travel assistant providing contextual advice.
7.  **Unified Travel Dashboard:** User portal for ticket management and one-click cancellations.

## 3. Test Cases

### Functional Test Cases
- **F-01: Pricing Logic Accuracy:** Verify that selecting a seat and a meal (e.g., L5 + Thali) correctly sums to ₹1450.
- **F-02: Real-time Availability:** Ensure a cancelled booking immediately marks the seat as "Available" in the fleet view.
- **F-03: Route Validation:** Confirm stations display the correct time-offsets (e.g., Surat at T+300 mins).

### AI/ML Validation
- **M-01: Scarcity Impact:** Increasing occupancy from 10% to 90% should increase confirmation probability by ~8%.
- **M-02: Recency Bias:** A booking made for tomorrow should show >90% probability, while one for 30 days later should be closer to 75%.

## 4. Source Code & Backend Implementation
The current implementation utilizes a `busService.ts` layer that acts as an abstraction for data operations. 
- **Current State:** LocalStorage-based persistence for full offline functionality.
- **Backend Blueprint:** See `services/mongodb_setup.ts` for the production-ready Mongoose schema and connection logic.

## 5. Setup & Installation
1. Clone the repository.
2. Run `npm install`.
3. Ensure `process.env.API_KEY` is set for Gemini AI functionality.
4. Launch via `npm start`.

---
*Developed for the AI/ML Software Engineer Assignment.*
