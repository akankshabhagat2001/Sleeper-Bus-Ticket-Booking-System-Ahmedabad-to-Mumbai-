# 🚌 SleeperSwift – Sleeper Bus Ticket Booking System  
**Route:** Ahmedabad → Mumbai  
**Role:** AI/ML Software Engineer Assignment  

---

## 📌 Project Overview

**SleeperSwift** is a web-based Sleeper Bus Ticket Booking System designed for a single premium sleeper coach operating between **Ahmedabad and Mumbai**, including intermediate stations.

The system focuses on:
- Smooth seat booking flow
- Integrated meal selection
- Clean backend APIs
- AI-based booking confirmation probability (mock implementation)

This project is developed as part of an **AI/ML Software Engineer assignment** with emphasis on **UX clarity, backend logic, and analytical thinking**.

---

## ✅ System Assumptions

- Only **one sleeper bus** exists in the system  
- Fixed route: **Ahmedabad → Mumbai**
- Multiple intermediate stations supported
- No payment gateway integration
- No authentication (login/signup)

---

## 🚀 Core Features

1. **Route & Station Selection**
   - Select boarding and dropping stations
   - Date selection for journey

2. **Sleeper Seat Layout & Availability**
   - Upper and Lower sleeper berth layout
   - Real-time seat availability simulation

3. **Seat Booking**
   - Book available sleeper seats
   - Prevents double booking

4. **Meal Booking Integration**
   - Optional meal selection during checkout
   - Meal types: Veg / Jain / Non-Veg

5. **Booking Confirmation**
   - Generates booking ID
   - Displays seat and meal details

6. **Cancel Booking**
   - Allows cancellation
   - Seat becomes available again

7. **AI Booking Confirmation Prediction**
   - Predicts probability (%) of booking confirmation
   - Based on mock historical data

---

## 🧪 Test Cases

### 🔹 Functional Test Cases

| Test ID | Description | Expected Result |
|-------|-------------|----------------|
| FT01 | Fetch seat list | Seats displayed with correct status |
| FT02 | Book available seat | Booking successful |
| FT03 | Book already booked seat | Error message shown |
| FT04 | Add meal during booking | Meal saved with booking |
| FT05 | Cancel booking | Seat marked available |

---

### 🔹 Edge Cases

| Test ID | Description | Expected Result |
|-------|-------------|----------------|
| EC01 | Booking last available seat | Booking allowed |
| EC02 | Cancel invalid booking ID | Graceful error |
| EC03 | Double booking same seat | Prevented |
| EC04 | Invalid station selection | Validation error |

---

### 🔹 UI/UX Validation

| Test ID | Check | Expected Result |
|-------|------|----------------|
| UI01 | Seat color coding | Available / Booked clearly visible |
| UI02 | Meal selection UI | Simple and intuitive |
| UI03 | Error messages | Clear and readable |
| UI04 | Responsive design | Works on desktop & mobile |

---

## 🎨 UI/UX Prototype

**Design Tool:** Figma  

🔗 **Prototype Link:**  
👉 _Add your public Figma link here_  

