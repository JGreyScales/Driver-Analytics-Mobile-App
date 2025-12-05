# Driver Analytics Mobile App

This is a  project created in fall of 2025 where we were tasked with creating a mobile application that tracks drivers data for insurance tracking purposes. This program is designed to have reduced network usage while still maintaining secured resources and best pratices for production code. Our primary objective was storing telementary data about peoples driving habits that can be sold or integrated into automobible insurance companies to allow them to create dynamic pricing options. This aims to replace or replicate what physical hardware does but easier to use and cheaper to maintain

---

## Outline
1. **Goals**
2. **Tech Stack**
3. **Front-end screenshot demos**
4. **Developer side screenshot demos**

## 🚀 Goals
High-level objectives of the project.

- [x] **Implement core features**
  - [x] User sign in authentication
  - [x] User sign up authentication
    - [x] password hashing using MD5 encryption
  - [x] User session authentication
    - [x] encrypted tokens with expirey
  - [x] Real-sensor monitoring from hardware
    - [x] Starting journeys
    - [x] Stopping journeys
      - [x] Automatic detection of when the user stops driving
  - [x] Account & data deletion requests
  - [x] Viewing trip history
  - [x] Externally hosted Database
    - [x] less than 1mb of storage per user
  - [x] Externally hosted API
  - [x] Historical data tracking and display
- [x] **Improve UI/UX**
  - [x] User experience testing
  - [x] Neumorphism UI design
  - [x] Mobile focused design for easy usage with thumbs
- [x] **Optimize performance**
  - [x] under light load API responds in <200ms on all endpoints
  - [x] caching using session manager for network data
  - [x] preloading screens for fast load times

---

## 🧱 Stack
Technologies used in the project:

**Frontend:** React-Native-Expo JavaScript, JEST testing  
**Backend:** Node.js Express API Javascript, JEST testimg  
**Database:** MYSQL 8.0.44 Ubuntu build  
**Hosting:** Ubuntu linux VPS  

---

## 🎨 UI Preview / Screenshots


**Sign In Screen**  
<img src="https://raw.githubusercontent.com/JGreyScales/DriveMotion/258de3021270004afe3cb18827d5190377d19147/demo-images/signin.png" alt="Signin image">

**Sign Up Screen**  
<img src="https://raw.githubusercontent.com/JGreyScales/DriveMotion/258de3021270004afe3cb18827d5190377d19147/demo-images/signup.png" alt="Signup image">

**Homepage Screen**  
<img src="https://raw.githubusercontent.com/JGreyScales/DriveMotion/258de3021270004afe3cb18827d5190377d19147/demo-images/Homepage.png" alt="Homepage image">

**Settings Screen**  
<img src="https://raw.githubusercontent.com/JGreyScales/DriveMotion/258de3021270004afe3cb18827d5190377d19147/demo-images/Settings.png" alt="Settings image">

**Peformance Screen**  
<img src="https://raw.githubusercontent.com/JGreyScales/DriveMotion/258de3021270004afe3cb18827d5190377d19147/demo-images/yourPeformance.png" alt="yourPerformance image">

**Journey Tracking Screen**  
<img src="https://raw.githubusercontent.com/JGreyScales/DriveMotion/258de3021270004afe3cb18827d5190377d19147/demo-images/JourneyTracking.png" alt="JourneyTracking image">

## Consoles / Backend Info


**Server Console as SystemCTL Service**  
<img src="https://raw.githubusercontent.com/JGreyScales/DriveMotion/258de3021270004afe3cb18827d5190377d19147/demo-images/linux_systemctl_service.png" alt="linux systemctl service image">

**Mobile App Console**  
<img src="https://raw.githubusercontent.com/JGreyScales/DriveMotion/258de3021270004afe3cb18827d5190377d19147/demo-images/front-end-console.png" alt="front-end console image">

**Users table**  
Showcasing the password hashing (No plaintext passwords stored)  
<img src="https://raw.githubusercontent.com/JGreyScales/DriveMotion/92ecd8fdafbb7e53f46a1763deb522bbb6865edc/demo-images/mysql_users_table.png" alt="sql users table">

