# 🚆 CorridorMind AI

**Smarter Planning and Zero Conflicts — AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways**

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH%202026-SIH26027-blue.svg)](#)
[![Team](https://img.shields.io/badge/Team-Visionary%20Coders__1%20(ID%3A%20160194)-green.svg)](#)
[![Domain](https://img.shields.io/badge/Theme-Transportation%20%26%20Logistics-orange.svg)](#)

---

## 📋 Overview

**CorridorMind AI** is an end-to-end intelligent railway maintenance block planning system developed for **Smart India Hackathon 2026 (Problem Statement ID: SIH26027)** by **Team Visionary Coders_1 (Team ID: 160194)**

It unifies fragmented maintenance requests across railway departments into a single, conflict-free, safety-validated 7-day master schedule—maximizing track and asset availability while keeping human controllers firmly in control.

---

## ❗ The Problem

In Indian Railways, **Engineering**, **Traction Distribution (TRD)**, and **Signal & Telecommunication (S&T)** departments currently raise maintenance block requests independently without a shared view of corridor demand[cite: 2]. This siloed approach causes:
* Difficulty in prioritizing critical safety repairs
* Missed opportunities for overlapping, coordinated maintenance work
* Underutilized maintenance blocks and idle machinery
* Scheduling clashes, maintenance backlogs, train delays, and reduced operational asset availability

---

## 💡 The Solution

CorridorMind AI transforms fragmented spreadsheet reconciliation into an automated, explainable pipeline

> **UNIFY → PRIORITIZE → COORDINATE → OPTIMIZE → VALIDATE → APPROVE**

1. **Unified Railway Planning Intelligence:** Consolidates departmental maintenance requests, assets, corridor topology, and block availability into a single-window planning view
2. **AI-Driven Priority & Feasible Scheduling:** Uses an **XGBoost** priority engine and constraint-based candidate schedule generation to rank critical work and identify feasible maintenance windows.
3. **Cross-Department Block Optimization:** Uses **LangGraph** coordination/optimization agents alongside **Google OR-Tools CP-SAT** to pair compatible Engineering, TRD, and S&T tasks into shared, high-efficiency blocks.
4. **Safe, Explainable & Human-Controlled Planning:** Runs deterministic safety rule checks and corridor simulations before human approval, backed by a **RAG-based Explainability Agent** and a **WhatsApp approval workflow**.

---

## 🏗️ System Architecture & Technical Pipeline

CorridorMind AI operates across an 11-step, four-layer architecture:

```text
[ TMS / SMMS / TDMS / COA ] 
       │
       ▼ (1-2) Data Foundation & Unified Data Model
[ XGBoost Priority Engine ] ──► Ranks requests across 6 risk & criticality factors
       │
       ▼ (3-4) Candidate Schedule Generation
[ LangGraph Coordination Agent ] ──► Discovers compatible Engineering, TRD & S&T work
       │
       ▼ (5-6) Global Constraint Solving
[ OR-Tools CP-SAT Optimization Agent ] ──► Selects optimal conflict-free schedule
       │
       ▼ (7-9) Trust & Validation
[ Deterministic Safety Validator ] + [ Corridor Simulator ] + [ RAG Explainability Agent ]
       │
       ▼ (10-11) Human-in-the-Loop Control
[ Controller Dashboard & WhatsApp Bot ] ──► Final Review, Modification & Audit-Logged Approval

```

### Pipeline Breakdown

* **Data Foundation (Steps 1–2):** Ingests data from existing railway systems (`TMS`, `TDMS`, `SMMS`, `COA`, and block records) via secure connectors with schema mapping, normalization, validation, and role-based access control.


* **AI Decision Engine (Steps 3–6):**
* **Priority Engine:** Scores maintenance requests using **XGBoost** across six factors: safety risk, criticality, operational impact, severity, urgency, and overdue status.


* **Candidate Generation:** Maps prioritized requests to feasible block and time windows based on corridor location, duration, and operational constraints.


* **Coordination & Optimization Agents:** **LangGraph** agents group compatible cross-departmental activities and pass candidates to **OR-Tools CP-SAT** to compute a globally optimal, conflict-free schedule.




* **Trust & Validation (Steps 7–9):**
* **Independent Safety Validator:** Deterministic rule engine verifying zero overlapping windows, valid assignments, and strict safety-buffer compliance before human review.


* **Corridor Simulation:** Visualizes block occupancy, train movements, and departmental activities to test plan feasibility prior to commitment.


* **Explainability Agent:** **RAG-powered** reasoning layer that retrieves planning rules and context to explain why specific requests were prioritized, merged, or deferred.




* **Human Control & Deployment (Steps 10–11):** Single-screen web dashboard and **WhatsApp Chatbot** enabling officials across Engineering, TRD, and S&T to review, override, and approve plans with an immutable audit trail.



---

## ✨ Key Features

* **Multi-Department Intelligence:** Single source of truth unifying Engineering, TRD, and S&T requests.


* **Shared-Block Discovery:** Automatically merges compatible cross-departmental work into single maintenance windows.


* **Agentic + Constraint Optimization:** Combines LLM agentic workflows (`LangGraph`) with exact mathematical optimization (`OR-Tools CP-SAT`).


* **Safety-First Guardrails:** The optimizer is never the final authority—every schedule passes deterministic safety checks and human approval.


* **Interactive Pre-Approval Simulation:** Visualizes corridor impact and resource utilization before blocks are granted.


* **WhatsApp Chatbot Integration:** Streamlines rapid multi-department review, modifications, and approvals on mobile.


* **CRIS / BDMS Ready:** Built on a locked data contract for seamless integration with existing railway systems and national-level scaling without pipeline redesign.



---

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| **Machine Learning & Scoring** | Python, XGBoost |
| **Agentic Orchestration** | LangGraph |
| **Mathematical Optimization** | Google OR-Tools (CP-SAT Solver) |
| **Explainability & Knowledge** | Retrieval-Augmented Generation (RAG), Vector/Relational Database |
| **Data Integration & Backend** | REST APIs, Locked Data Contracts (`TMS`, `SMMS`, `TDMS`, `COA` schemas) |
| **Frontend & Simulation** | Interactive Planning Dashboard, Corridor Occupancy Simulator |
| **Notifications & Approvals** | WhatsApp Business / Chatbot API |

---

## 📊 Impact & Benefits

* **Unified 7-Day Master Schedule:** Eliminates siloed requests and manual spreadsheet reconciliation across departments.


* **Proactive Conflict Resolution:** Catches corridor and safety-buffer clashes prior to block execution.


* **Maximized Asset Availability:** Aligns with Indian Railways' **Rolling Block Programme (RBP)** to reduce block refusals, increase asset earning hours, and minimize machine idle time.


* **Economic & Operational Value:** Helps curb train delays (estimated to cost ₹14,800–19,900 crore annually in lost passenger time; even a 10% delay reduction saves ₹1,500–2,000 crore/year).


* **Immutable Accountability:** Logs every approval, rejection, and manual override for full auditability and safety governance.


## 👥 Team — Visionary Coders_1

* **Smart India Hackathon 2026** | **Team ID:** `160194` | **Problem Statement:** `SIH26027`

```
