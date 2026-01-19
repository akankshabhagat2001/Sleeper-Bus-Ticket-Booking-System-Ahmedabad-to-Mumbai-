
# Prediction Methodology: Booking Confirmation Probability

## 1. Prediction Approach
The system utilizes a **Weighted Feature Scoring Model** (simulating a Logistic Regression classifier). Instead of a binary "Confirmed/Cancelled" output, it calculates a continuous probability score (0-100%) representing the likelihood that a user will actually proceed with and maintain their booking without cancellation.

### Mathematical Formulation
The probability $P$ is calculated as:
$P = \text{Base} + (\omega_1 \cdot \text{LeadTime}) + (\omega_2 \cdot \text{Temporal}) + (\omega_3 \cdot \text{Occupancy})$

Where:
- **Base**: 75% (The historical average "show-up" rate).
- **$\omega_1$ (Lead Time Weight)**: 0.5. Probability increases as the travel date approaches (recency bias).
- **$\omega_2$ (Temporal Weight)**: +5% for weekends (Fri/Sat/Sun), -2% for mid-week.
- **$\omega_3$ (Occupancy Weight)**: +10% max. High occupancy creates a "scarcity effect," reducing the likelihood of cancellation.

## 2. Model Choice
**Logistic Regression (Simulated)**
- **Why**: It is the industry standard for binary classification (Confirmed vs. Cancelled). 
- **Features Used**: 
    - `lead_time_days` (Continuous)
    - `is_weekend` (Boolean)
    - `current_bus_occupancy` (Percentage)

## 3. Mock Training Dataset
The following data was used to "calibrate" the weights of the mock model:

| Lead Time (Days) | Day of Week | Occupancy | Outcome | Predicted Prob |
|------------------|-------------|-----------|-----------|----------------|
| 2                | Saturday    | 85%       | Confirmed | 94%            |
| 15               | Tuesday     | 40%       | Cancelled | 72%            |
| 1                | Monday      | 95%       | Confirmed | 98%            |
| 30               | Wednesday   | 20%       | Cancelled | 55%            |

## 4. Final Prediction Output
The frontend displays this as a real-time "Confirmation Predictor" badge during the seat selection process.
- **High ( > 90%)**: Green (Reliable)
- **Medium (75% - 90%)**: Blue (Stable)
- **Low ( < 75%)**: Amber (Volatile)
