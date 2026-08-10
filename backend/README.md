# AI-Driven Voice Ordering & Calling Platform - API Documentation

Welcome to the AI-Driven Voice Ordering & Calling Platform. This backend provides a multi-tenant architecture for managing AI voice agents, customer orders, and subscription billing.

---

## 🚀 Table of Contents
1. [Authentication](#authentication)
2. [Business Owner API](#business-owner-api)
   - [Auth](#business-auth)
   - [Dashboard](#dashboard)
   - [AI Agent (Training)](#ai-agent)
   - [Orders](#orders)
   - [Call Summaries](#call-summaries)
   - [Subscription & Payment](#subscription-payment)
   - [Settings](#business-settings)
3. [System Owner API](#system-owner-api)
   - [Auth](#system-auth)
   - [Tenants Management](#tenants)
   - [Subscription Management](#system-subscription)
   - [Settings](#system-settings)
4. [Webhook Integration](#webhooks)

---

## 🔐 Authentication
Most endpoints require a Bearer Token in the Authorization header.
`Authorization: Bearer <your_jwt_token>`

---

<a name="business-owner-api"></a>
## 🏢 Business Owner API

<a name="business-auth"></a>
### 1. Auth (`/api/business-owner/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/signup` | Register a new business owner account |
| POST | `/login` | Login and receive access/refresh tokens |
| POST | `/send-otp` | Send verification OTP to email |
| POST | `/verify-otp` | Verify email with OTP |
| POST | `/forgot-password` | Request password reset OTP |
| POST | `/change-password` | Change password (authenticated) |

<a name="dashboard"></a>
### 2. Dashboard (`/api/business-owner/dashboard`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Get business overview metrics (total calls, orders, etc.) |

<a name="ai-agent"></a>
### 3. AI Agent Training (`/api/agent`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/create` | Create/Train a new AI Agent with PDF rules & menu |
| GET | `/` | Get list of all trained agents for the business |
| DELETE | `/:id` | Delete an AI Agent |

<a name="orders"></a>
### 4. Orders (`/api/business-owner/order`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Get all orders processed by AI agents |
| GET | `/:id` | Get specific order details |
| GET | `/download/:id` | Generate and download order receipt (PDF) |

<a name="call-summaries"></a>
### 5. Call Summaries (`/api/business-owner/call-summary`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Get all call transcripts and AI summaries |
| GET | `/:id` | Get specific call summary |

<a name="subscription-payment"></a>
### 6. Subscription & Payment (`/api/business-owner/subscription` & `/payment`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/subscription/` | View current subscription status and plan |
| POST | `/payment/create-checkout-session` | Create Stripe checkout session for a plan |
| GET | `/payment/invoices` | View billing history and invoices |

<a name="business-settings"></a>
### 7. Settings (`/api/business-owner/settings`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Get business profile and general settings |
| PATCH | `/` | Update business name, address, or branding |

---

<a name="system-owner-api"></a>
## 👑 System Owner API (Super Admin)

<a name="system-auth"></a>
### 1. Auth (`/api/system-owner/auth`)
- Similar to Business Owner Auth but restricted to the `SYSTEM_OWNER` role.

<a name="tenants"></a>
### 2. Tenants (`/api/system-owner/tenants`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | List all businesses (tenants) on the platform |
| PATCH | `/:id` | Approve, suspend, or update tenant status |
| DELETE | `/:id` | Remove a tenant from the platform |

<a name="system-subscription"></a>
### 3. Subscription Management (`/api/system-owner/subscription-billing`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | View global revenue and billing overview |
| POST | `/plans` | Create new subscription plans (Starter, Pro, etc.) |

---

<a name="webhooks"></a>
## 🪝 Webhook Integration (`/api/webhook`)

### Vapi Webhook
**Endpoint**: `POST /api/webhook/vapi`

This endpoint is used by **Vapi.ai** to sync call data automatically.
- Processes `end-of-call-report`.
- Automatically extracts and saves **Orders** to the database.
- Saves **Call Summaries** and **Transcripts**.
- Supports **Direct Order** tool calls during live conversations.

---

## 🛠️ Technology Stack
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis
- **Authentication**: JWT & Bcrypt
- **Payments**: Stripe Integration
- **AI Connectivity**: Vapi.ai API
