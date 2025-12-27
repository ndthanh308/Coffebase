# Coffee Base - Digital Coffee Commerce Platform

## 📋 Tổng quan

Coffee Base là nền tảng web toàn diện cho việc kinh doanh cà phê hiện đại, bao gồm:
- **Customer Experience Platform**: Đặt hàng online, tùy chỉnh đồ uống, thanh toán và theo dõi đơn hàng
- **Internal Management System**: Quản lý menu, khách hàng, đơn hàng và thống kê doanh thu

## 🏗️ Kiến trúc hệ thống

Hệ thống được thiết kế theo **Multi-layered Architecture** với 4 tầng:

1. **Presentation Layer**: Giao diện người dùng (SPA với HTML/CSS)
2. **Application Layer**: Controllers và Services (Business Logic)
3. **Domain Layer**: Models và DTOs (Data Entities)
4. **Infrastructure Layer**: Database, Payment Gateways, Logger

### Tech Stack

- **Frontend**: HTML/CSS, SPA (Single Page Application)
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL (Supabase)
- **API**: REST API, JSON, HTTPS
- **Security**: JWT/OAuth2

## 📁 Cấu trúc thư mục

```
coffeebase/
├── presentation-layer/     # Frontend (Customer & Admin UI)
│   ├── public/            # Static assets
│   └── src/
│       ├── views/        # User Pages & Admin Pages
│       ├── router/       # Routing & Navigation Guards
│       └── state/        # Cart & Session Management
│
├── application-layer/      # Backend (Controllers & Services)
│   ├── controllers/      # API Endpoints (Auth, Menu, Order, Analytics)
│   ├── services/         # Business Logic
│   └── security/         # JWT & Authentication
│
├── domain-layer/          # Data Models & DTOs
│   ├── models/           # Database Schemas (User, Product, Order)
│   └── dtos/             # Data Transfer Objects
│
└── infrastructure-layer/  # External Integrations
    ├── database/         # Supabase Connection & Migrations
    ├── gateways/         # Payment Gateways (Momo, ZaloPay)
    └── logger/          # Error Handling & Logging
```

## 🚀 Hướng dẫn Setup

### Yêu cầu hệ thống

- Node.js >= 18.x
- npm hoặc yarn
- Tài khoản Supabase (PostgreSQL)

### Cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd Coffebase
```

2. **Setup Backend (Application Layer)**
```bash
cd application-layer
npm install
cp .env.example .env
# Cấu hình các biến môi trường trong .env
npm run dev
```

3. **Setup Frontend (Presentation Layer)**
```bash
cd presentation-layer
npm install
npm run dev
```

### Cấu hình môi trường

Tạo file `.env` trong `application-layer/` với nội dung:

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Payment Gateways
MOMO_API_KEY=your_momo_api_key
MOMO_SECRET_KEY=your_momo_secret
ZALOPAY_API_KEY=your_zalopay_api_key
```

## 📚 Use Cases

### Customer Use Cases
- UCU01: View Menu
- UCU02: Sign Up
- UCU03: Login
- UCU04: Search & Filter
- UCU05: Customize Drink
- UCU06: Add to Cart & Checkout
- UCU07: Order Tracking
- UCU08: Payment
- UCU09: Rate & Review

### Admin Use Cases
- UCA1: Admin Login
- UCA2: Manage Menu (CRUD)
- UCA3: Manage Users
- UCA4: Manage Orders
- UCA5: View Statistics
- UCA6: Manage Reviews
- UCA7: Manage Promotions

## 🔒 Security

- Password encryption (bcrypt)
- JWT authentication
- Session timeout
- HTTPS only
- RBAC (Role-Based Access Control) for Admin

## 📝 License

© Newbie Coder, 2025

