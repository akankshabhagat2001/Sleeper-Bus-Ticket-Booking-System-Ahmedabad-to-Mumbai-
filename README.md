
# SleeperSwift | Premium Bus Booking System

A high-fidelity web application for the Ahmedabad ↔ Mumbai sleeper bus route, featuring integrated meal booking and an AI-driven confirmation probability engine.

## 1. Project Overview
This project satisfies the AI/ML Software Engineer assignment. It demonstrates a seamless booking flow, a robust administrative backend (simulated), and a predictive model for booking stability.

**Public Prototype Link:** [https://sleeper-swift.example.com](https://sleeper-swift.example.com) *(This application serves as the functional prototype)*

## 2. Defined Core Features
1.  **Multi-Deck Seat Selection:** Interactive visualizer for Upper and Lower berths with real-time occupancy tracking.
2.  **Integrated Meal Marketplace:** Gourmet meal selection (Veg/Non-Veg/Jain) embedded directly into the checkout workflow.
3.  **AI Confirmation Predictor:** Real-time ML-driven probability score (percentage) based on lead time, demand, and occupancy.
4.  **Admin Command Center:** Secure dashboard for fleet management, inventory overrides, and revenue analytics.
5.  **Smart Routing:** Support for intermediate stations (Vadodara, Surat, Vapi) with dynamic timing offsets.
6.  **Gemini-Powered Concierge:** An AI travel assistant to provide seat advice and meal recommendations.
7.  **Unified Travel Dashboard:** User portal for managing active tickets and one-click cancellations.

## 3. Test Cases

### Functional Test Cases
- **F-01:** Verify that selecting a seat updates the "Base Fare" in the summary footer.
- **F-02:** Confirm that adding a meal correctly increments the "Total Amount" by the meal's price.
- **F-03:** Ensure a cancelled booking releases the specific seat back to the "Available" pool in real-time.
- **F-04:** Validate that Admin overrides (manual occupancy) prevent users from selecting those seats.

### Edge Cases
- **E-01:** Booking a ticket for "Today" with 95% occupancy (Should trigger max AI confirmation probability).
- **E-02:** Attempting to book a seat that was occupied by another session during the checkout delay (Simulated Race Condition).
- **E-03:** Validating behavior when no meals are selected (Summary should show ₹0 for add-ons).

### UI/UX Validation
- **U-01:** Mobile responsiveness: Ensure the seat grid is navigable on small touchscreens.
- **U-02:** Accessibility: Verify ARIA labels for seat statuses and screen-reader friendliness for the progress stepper.

## 4. Setup & Installation
1. Clone the repository.
2. Run `npm install` (if in a Node environment).
3. Ensure `process.env.API_KEY` is set for Gemini AI functionality.
4. Launch via `npm start`.

---
*Developed for the AI/ML Software Engineer project task.*
