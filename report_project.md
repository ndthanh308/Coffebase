# Coffee Base — Project Report

## 1) Cách pull code về máy

### 1.1 Clone repository
```bash
git clone <repository-url>
cd Coffebase
```

### 1.2 Pull cập nhật mới nhất
```bash
git pull
```

> Ghi chú: Tên folder trong workspace hiện tại là `Coffebase`.

---

## 2) Cài môi trường (Environment Setup)

### 2.1 Yêu cầu
- OS: Windows
- Node.js: >= 18
- npm: đi kèm Node.js
- Supabase Project (PostgreSQL)

### 2.2 Cài dependencies
Backend (Application Layer):
```bash
cd application-layer
npm install
```

Frontend (Presentation Layer):
```bash
cd ..\presentation-layer
npm install
```

Infrastructure layer (tuỳ chọn — chỉ để đảm bảo dependencies của modules infra):
```bash
cd ..\infrastructure-layer
npm install
```

---

## 3) Supabase: tạo bảng + schema

### 3.1 Migrations
Schema DB được định nghĩa trong:
- `infrastructure-layer/database/migrations/001_initial_schema.sql`
- `infrastructure-layer/database/migrations/002_about_us.sql`

Cách áp dụng:
1) Vào Supabase Dashboard → SQL Editor
2) Chạy lần lượt nội dung của 2 file migration ở trên

### 3.2 Các bảng đã tạo (đúng theo migrations)

**users**
- id (uuid, PK)
- email (unique)
- password (bcrypt hash)
- role (`customer | admin | super_admin`)
- credit_points
- created_at, updated_at

**products**
- id (uuid, PK)
- name, description
- price (>= 0)
- category (coffee/tea/cake/other)
- image_url
- is_active (soft delete)
- created_at, updated_at

**orders**
- id (uuid, PK)
- user_id (FK -> users)
- items (JSONB)  // array { productId, name, price, quantity, customization }
- delivery_info (JSONB)  // { name, phone, address, pickupLocation }
- total (>= 0)
- payment_method
- status (`ordered | paid | processing | ready | completed | cancelled`)
- transaction_id
- created_at, updated_at

**reviews**
- id (uuid, PK)
- order_id (FK -> orders)
- user_id (FK -> users)
- product_id (FK -> products)
- rating (1..5)
- comment
- is_approved (MVP: hiện set true ngay khi tạo)
- created_at, updated_at

**promotions**
- id (uuid, PK)
- code (unique)
- discount_type (`percentage | fixed`)
- discount_value
- start_date, end_date
- usage_limit, used_count
- is_active
- created_at, updated_at

**about_us** (migration 002)
- id (uuid, PK)
- type (`group | member`)
- name, title, roles (text[]), description, motto, image_url
- sort_order, is_active
- created_at, updated_at
- unique index: (type, name) để upsert

---

## 4) Cấu hình biến môi trường

### 4.1 Backend `.env`
File: `application-layer/.env`

Tối thiểu cần (đúng theo code trong `infrastructure-layer/database/supabase-client.js` và auth middleware):
```env
PORT=3000
NODE_ENV=development

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Optional: CORS allowlist
# CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173

# Optional: Payment keys (chỉ cần nếu test momo/zalopay)
MOMO_API_KEY=...
MOMO_SECRET_KEY=...
MOMO_PARTNER_CODE=...
ZALOPAY_API_KEY=...
ZALOPAY_SECRET_KEY=...
```

### 4.2 Frontend `.env`
File: `presentation-layer/.env`

Frontend gọi API qua `VITE_API_URL` (default code đang fallback `http://127.0.0.1:3001`), nên để chạy local với backend port 3000 cần set:
```env
VITE_API_URL=http://127.0.0.1:3000
```

---

## 5) Cách chạy Backend

### 5.1 Dev mode (nodemon)
```bash
cd application-layer
npm run dev
```

Backend sẽ chạy:
- `http://127.0.0.1:3000` (hoặc port trong `.env`)

Health check:
- `GET /health`

---

## 6) Cách chạy Frontend

```bash
cd presentation-layer
npm run dev
```

Frontend thường chạy:
- `http://localhost:5173`

---

## 7) Seed dữ liệu (tuỳ chọn nhưng nên làm để demo/test)

### 7.1 Seed products
```bash
cd application-layer
npm run seed:products
```
- Đọc file `application-layer/scripts/products.seed.json`
- Insert các product chưa tồn tại (match theo name)

### 7.2 Seed About Us
```bash
cd application-layer
npm run seed:about
```
- Đọc `application-layer/scripts/about.seed.json`
- Upsert vào bảng `about_us` theo khóa `(type, name)`

---

## 8) Những việc đã làm (Implementation Report)

### 8.1 Ổn định backend + cấu hình chạy local
- Backend là ESM; `.env` được load sớm trong `application-layer/server.js` và routes được dynamic import để tránh lỗi env chưa load.
- CORS: allowlist dựa trên `CORS_ORIGIN` hoặc mặc định cho Vite `http://localhost:5173` và `http://127.0.0.1:5173`.
- Có endpoint `GET /health`.

### 8.2 Authentication + RBAC (JWT)
- Backend:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/admin/login` (chỉ cho role admin/super_admin)
  - `GET /api/auth/me` (yêu cầu token)
  - JWT payload: `{ id, role }`
  - Middleware:
    - `authenticateToken` đọc `Authorization: Bearer <token>`
    - `requireAdmin` chặn nếu role không phải admin/super_admin
- Frontend:
  - `StateManager` lưu `user` + `token` vào localStorage
  - Router guard:
    - route `/checkout`, `/orders`, `/profile`, và toàn bộ `/admin*` yêu cầu auth
    - `/admin*` yêu cầu `stateManager.isAdmin()`

### 8.3 About Us (DB + API + UI)
- DB: bảng `about_us` (migration 002)
- API: `GET /api/about`
- UI: route `/about` hiển thị:
  - group intro (từ `type='group'`)
  - danh sách member cards (từ `type='member'`), layout dạng list card (avatar trái, info phải)

---

## 9) Các UCU đã hoàn thiện (Customer Use Cases)

> Ghi chú: Mô tả dưới đây bám theo đúng code hiện tại: view nào gọi endpoint nào và dữ liệu đi/đến bảng nào.

### UCU01 — View Menu
- Frontend: `/menu` (MenuView)
  - gọi `GET /api/menu/search` để lấy danh sách theo query params
- Backend:
  - `GET /api/menu` (cơ bản: category/search)
  - `GET /api/menu/search` (nâng cao)
  - Model: `ProductModel` đọc bảng `products` với `is_active=true`

### UCU02 — Sign Up
- Frontend: `/signup` (SignupView)
  - gọi `POST /api/auth/signup` với `{ email, password, confirmPassword }`
  - lưu token vào localStorage
- Backend:
  - `AuthService.signUp()`
    - validate password (>=8, có số, chữ hoa, chữ thường, ký tự đặc biệt)
    - hash bcrypt
    - insert vào bảng `users`

### UCU03 — Login
- Frontend: `/login` (LoginView)
  - gọi `POST /api/auth/login`
  - sau login nếu `role=admin/super_admin` thì navigate `/admin`, nếu không thì `/`
- Backend:
  - `AuthService.login()` check email/password và sign JWT
  - Có thêm `POST /api/auth/admin/login` để login dạng “admin-only” (không bắt buộc dùng từ UI hiện tại)

### UCU04 — Search & Filter
- Frontend: `/menu` hỗ trợ:
  - search theo tên
  - filter theo category
  - filter minPrice/maxPrice
  - sortBy `name|price`
  - gọi `GET /api/menu/search?q&category&minPrice&maxPrice&sortBy`
- Backend:
  - `MenuService.searchAndFilter()` → `ProductModel.searchAndFilter()` (filter/sort ở query Supabase)

### UCU05 — Customize Drink
- Frontend: `/product/:id` (ProductDetailView)
  - load product: `GET /api/menu/:id`
  - cho chọn size/sugar/ice/topping/quantity
  - tính giá tạm tính ở client:
    - multiplier size S/M/L
    - topping +5.000đ mỗi topping
  - add to cart: lưu vào `StateManager.cart` (localStorage)
- Backend:
  - có hàm `MenuService.calculateCustomizedPrice()` (logic pricing backend, hiện FE đang tự tính)

### UCU06 — Add to Cart & Checkout
- Frontend:
  - Cart: `/cart` (CartView) đọc cart từ localStorage
  - Checkout: `/checkout` (CheckoutView)
    - nếu cart rỗng thì chặn
    - submit gọi `POST /api/orders` với:
      - `items`: array { productId, name, price, quantity, customization }
      - `deliveryInfo`: { name, phone, address, pickupLocation }
      - `paymentMethod`
    - success: clear cart, chuyển `/orders/:id`
- Backend:
  - `POST /api/orders` → `OrderService.createOrder()`
  - tính `total` bằng sum(price*quantity)
  - insert vào bảng `orders` (items JSONB, delivery_info JSONB)

### UCU07 — Order Tracking
- Frontend:
  - `/orders` (OrderTrackingView): `GET /api/orders` lấy lịch sử
  - `/orders/:id` (OrderDetailView): `GET /api/orders/:id` lấy chi tiết
- Backend:
  - `GET /api/orders` (theo user_id)
  - `GET /api/orders/:id` (kiểm tra `order.user_id === req.user.id`)

### UCU08 — Payment
- Frontend: `/orders/:id` (OrderDetailView)
  - nếu status = `ordered` thì hiện phần “Thanh toán”
  - gọi `POST /api/orders/:id/payment` với `{ paymentMethod, paymentData:{} }`
- Backend:
  - `OrderService.processPayment()`:
    - chỉ cho pay khi status `ordered`
    - gọi `PaymentGateway.processPayment()`:
      - `card` / `credit`: mô phỏng luôn success
      - `momo` / `zalopay`: cần set env key, nếu không sẽ báo “not configured”
    - update `orders.status = 'paid'` và `transaction_id`

### UCU09 — Rate & Review
- Frontend:
  - `/orders/:id`:
    - nếu status `paid` hoặc `completed` thì hiện form review cho từng item
    - gọi `POST /api/orders/:id/review` với `{ productId, rating, comment }`
  - `/product/:id`:
    - load review public: `GET /api/menu/:id/reviews` (hiển thị stats + list)
- Backend:
  - `OrderService.addReview()`:
    - yêu cầu order thuộc user
    - yêu cầu status `paid` hoặc `completed`
    - check productId nằm trong order.items
    - chặn duplicate review (orderId+userId+productId)
    - insert vào `reviews` (MVP: `is_approved=true` ngay)
  - `GET /api/menu/:id/reviews`:
    - lấy reviews approved theo product_id
    - tính stats average/count
    - mask email người review

---

## 10) Các UCA (Admin Use Cases)

### UCA1 — Admin Login / Dashboard
**Hoàn thiện (MVP)**
- Backend: `POST /api/auth/admin/login` có sẵn (admin-only).
- Frontend:
  - Hiện UI login dùng `POST /api/auth/login` và sau đó dựa vào `user.role` để điều hướng `/admin`.
  - `/admin` hiển thị dashboard + navigation.
- RBAC enforced:
  - FE guard: Router chặn `/admin*` nếu không admin
  - BE guard: `requireAdmin` chặn mọi endpoint admin

### UCA2 — Manage Menu (CRUD)
**Hoàn thiện (MVP)**
- Frontend: `/admin/menu`
  - list: `GET /api/menu` (chỉ thấy `is_active=true` do backend filter)
  - create: `POST /api/menu` (admin-only)
  - update: `PUT /api/menu/:id` (admin-only)
  - delete: `DELETE /api/menu/:id` (admin-only, soft delete `is_active=false`)
- Backend: `menu-controller.js` + `MenuService` + `ProductModel` thao tác bảng `products`.

**Giới hạn hiện tại:** Admin UI chưa xem được products đã bị soft-delete vì API list đang filter `is_active=true`.

### UCA3 — Manage Users
**Chưa hoàn thiện**
- Hiện có:
  - `GET /api/auth/me` để lấy profile user hiện tại.
- Chưa có:
  - API admin để list/update users
  - UI quản trị users (page `/admin/users` hiện là stub)

### UCA4 — Manage Orders
**Hoàn thiện (MVP)**
- Frontend: `/admin/orders`
  - list: `GET /api/orders/admin/all` (admin-only)
  - update status: `PUT /api/orders/:id/status` (admin-only)
- Backend:
  - `OrderService.getAllOrders()` đọc bảng `orders`
  - `OrderService.updateOrderStatus()` validate status và update

### UCA5 — View Statistics
**Hoàn thiện (MVP)**
- Frontend: `/admin/statistics`
  - gọi `GET /api/analytics/statistics?period=day|week|month`
  - hiển thị KPI (revenue, orderCount, averageOrderValue), topProducts, breakdown theo ngày
- Backend: `AnalyticsService`
  - lấy orders theo date range từ bảng `orders`
  - tổng hợp doanh thu và top products từ `orders.items`

### UCA6 — Manage Reviews
**Chưa hoàn thiện**
- Hiện có:
  - Review được tạo là `is_approved=true` ngay (MVP) để hiển thị cho product detail.
  - Public endpoint: `GET /api/menu/:id/reviews` (đọc reviews đã approved)
- Chưa có:
  - endpoint admin list/approve/hide/delete review
  - UI quản trị reviews (`/admin/reviews` hiện stub)

### UCA7 — Manage Promotions
**Chưa hoàn thiện**
- DB table `promotions` đã có trong migration.
- Chưa có:
  - API CRUD promotions
  - UI quản trị promotions (`/admin/promotions` hiện stub)
  - luồng áp mã giảm giá phía customer

---

## 11) Hướng dẫn tạo tài khoản Admin (đúng theo schema hiện tại)
1) Đăng ký user thường tại `/signup` (để password được hash đúng)
2) Trong Supabase SQL Editor:
```sql
update public.users
set role = 'admin'
where email = 'your_email@example.com';
```
3) Logout/Login lại để JWT chứa role admin
4) Vào `/admin`

---

## 12) Ghi chú nhất quán / known limitations
- Frontend API base URL mặc định đang là `http://127.0.0.1:3001`; cần set `VITE_API_URL=http://127.0.0.1:3000` để khớp backend local.
- Payment momo/zalopay chỉ là mô phỏng và sẽ báo lỗi nếu thiếu env keys.
- Promotions tồn tại ở DB nhưng chưa có luồng sử dụng.
- Admin Users/Reviews/Promotions hiện là stub UI (chưa có backend endpoints tương ứng).
