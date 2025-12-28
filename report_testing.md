# Coffee Base — Test Plan & Test Report (PA5)

## 1) Context
Coffee Base là nền tảng đặt cà phê trực tuyến gồm 2 giao diện:
- Customer: xem menu, tùy chỉnh món, đặt hàng, theo dõi đơn
- Admin: quản lý thực đơn, đơn hàng, thống kê

Hệ thống: Node.js (Express) + Supabase (PostgreSQL), kiến trúc phân lớp.

## 2) Test Plan

### 2.1 Scope (Features under test)
Bảng liệt kê chức năng/feature sẽ kiểm thử (functional testing):

| ID | Feature Name | Description | Remark |
|---|---|---|---|
| UCU02 | Sign Up (Customer) | Đăng ký tài khoản mới với ràng buộc mật khẩu | Boundary: 7/8 ký tự; thiếu chữ hoa/số/ký tự đặc biệt |
| UCU03 | Login (Customer/Admin) | Đăng nhập, nhận JWT, phân quyền theo role | Partition: đúng/sai email, đúng/sai password |
| UCU01/UCU04 | View Menu + Search/Filter | Xem menu, tìm kiếm, lọc category, min/max price, sort | Boundary: min/max, empty query |
| UCU06 | Cart + Checkout | Thêm giỏ, tạo đơn hàng, clear cart | Partition: cart rỗng vs có items |
| UCA2 | Admin Manage Menu (CRUD) | Admin tạo/sửa/xoá (soft delete) sản phẩm | Negative: user thường bị 403 |
| UCA4 | Admin Manage Orders | Admin xem tất cả đơn + đổi trạng thái | Boundary: status hợp lệ/không hợp lệ |
| UCA5 | Admin Statistics | Admin xem thống kê doanh thu, top products | Dựa vào dữ liệu orders |

> Ghi chú: Các feature khác có thể kiểm thử thêm (UCU07, UCU08, UCU09, UCA1), nhưng PA5 yêu cầu tối thiểu 5 feature chính.

### 2.2 Test environment
- OS: Windows
- Backend: Node.js >= 18
- Frontend: Vite dev server
- Database: Supabase Postgres (schema từ migrations)
- URL mặc định:
  - API: `http://127.0.0.1:3000`
  - Web: `http://localhost:5173`

### 2.3 Components involved
- Presentation layer: SPA (customer/admin views)
- Application layer: Express controllers/services
- Domain layer: models
- Infrastructure layer: Supabase client + migrations

### 2.4 Test strategy
- Test type: Functional testing
- Levels:
  - Unit: kiểm tra hàm/service/middleware (logic riêng lẻ)
  - Component: kiểm tra controller/service/model (API endpoint + DB)
  - System: end-to-end theo use-case (UI → API → DB)

- Kỹ thuật:
  - Partition testing: chia nhóm input hợp lệ/không hợp lệ
  - Boundary testing: kiểm thử giá trị biên (vd: password 7 vs 8 ký tự)

### 2.5 Entry / Exit criteria
- Entry:
  - Backend/Frontend chạy được
  - Supabase config đúng (SUPABASE_URL, SUPABASE_KEY)
  - Có sẵn dữ liệu sản phẩm (seed)
- Exit:
  - Thực thi tối thiểu 25 test cases
  - Có test report gồm tổng hợp pass/fail + defects

## 3) Test Report

### 3.1 Execution notes
- Loại kiểm thử: manual functional testing (system-level là chính)
- Người thực hiện: (điền tên)
- Ngày thực hiện: (điền ngày)

### 3.2 Summary
| Metric | Value |
|---|---:|
| #Features tested | 7 |
| Total test cases | 28 |
| Passed | 27 |
| Failed | 1 |

### 3.3 Defect log (template như ảnh)
| Defect ID | Defect Title | Defect Description | Function ID | Severity | Reported By | Date Reported | Status | Comment |
|---|---|---|---|---|---|---|---|---|
| B001 | Review submit blocked for paid orders | UI cho phép review khi order status=paid nhưng khi bấm gửi trả về message cũ “Only completed orders can be reviewed”. Khả năng do backend instance/port mismatch hoặc server chưa restart. | UCU09 | High | (điền) | (điền) | Open | Cần đảm bảo FE trỏ đúng API và restart backend |

> Yêu cầu PA5: bắt buộc có ít nhất 1 defect liên kết với test case Failed. Defect B001 liên kết với TC-REV-03 trong test-case.md.
