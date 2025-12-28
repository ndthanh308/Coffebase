# Coffee Base — Functional Test Cases (PA5)

## 0) How to use
- Mỗi test case có: bước thực hiện, dữ liệu test, kết quả mong đợi, Actual/Status.
- Sau khi chạy xong, điền **Actual Result** và **Status** (Pass/Fail).

## 1) Test data preparation (gợi ý)
- Customer account: tạo qua `/signup`
- Admin account: tạo customer rồi update `users.role` = `admin` trong Supabase; đăng xuất/đăng nhập lại.
- Có sẵn một số products trong bảng `products` (seed).

## 2) Test cases

### Feature: UCU02 — Sign Up
| Test Case ID | Function ID | Test Title | Preconditions | Steps | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| TC-SU-01 | UCU02 | Signup thành công với password hợp lệ | Web chạy | 1) Vào `/signup` 2) Nhập email/password/confirm 3) Submit | Email mới; Password: `Aa1!aaaa` | Tạo user thành công, nhận token, chuyển về trang chính |  |  |
| TC-SU-02 | UCU02 | Signup fail khi password < 8 ký tự (boundary) | Web chạy | 1) `/signup` 2) Submit | Password: `Aa1!aaa` (7 chars) | Hiện lỗi “Password must be at least 8 characters” |  |  |
| TC-SU-03 | UCU02 | Signup fail khi thiếu số (partition invalid) | Web chạy | 1) `/signup` 2) Submit | Password: `Aa!aaaaa` | Hiện lỗi password phải có số |  |  |
| TC-SU-04 | UCU02 | Signup fail khi thiếu chữ hoa | Web chạy | 1) `/signup` 2) Submit | Password: `aa1!aaaa` | Hiện lỗi password phải có uppercase |  |  |
| TC-SU-05 | UCU02 | Signup fail khi confirmPassword không khớp | Web chạy | 1) `/signup` 2) Submit | password != confirm | Hiện lỗi “Passwords do not match” |  |  |

### Feature: UCU03 — Login (Customer/Admin)
| Test Case ID | Function ID | Test Title | Preconditions | Steps | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| TC-LG-01 | UCU03 | Login customer thành công | Có user customer | 1) `/login` 2) Submit | Email/pass đúng | Nhận token, vào `/` |  |  |
| TC-LG-02 | UCU03 | Login fail sai mật khẩu (partition invalid) | Có user | 1) `/login` 2) Submit | pass sai | Hiện lỗi “Invalid email or password” |  |  |
| TC-LG-03 | UCU03 | Login fail email không tồn tại | Không có user | 1) `/login` 2) Submit | email random | Hiện lỗi “Invalid email or password” |  |  |
| TC-LG-04 | UCU03 | Login admin thành công và chuyển `/admin` | user.role=admin | 1) `/login` 2) Submit | admin email/pass | Nhận token, auto navigate `/admin` |  |  |
| TC-LG-05 | UCU03 | Guard chặn user thường vào `/admin` | login customer | 1) Nhập URL `/admin` | customer token | Router redirect về `/` (hoặc không vào admin) |  |  |

### Feature: UCU01/UCU04 — View Menu + Search/Filter
| Test Case ID | Function ID | Test Title | Preconditions | Steps | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| TC-MN-01 | UCU01 | Xem menu hiển thị list sản phẩm | Có products | 1) Vào `/menu` |  | Hiển thị danh sách sản phẩm |  |  |
| TC-MN-02 | UCU04 | Filter theo category coffee | Có products category coffee | 1) `/menu` 2) Click “Cà phê” |  | Chỉ hiển thị sản phẩm coffee |  |  |
| TC-MN-03 | UCU04 | Search theo tên có kết quả | Có product tên chứa từ khoá | 1) `/menu` 2) Nhập search 3) Enter | search=`Latte` | Hiển thị sản phẩm match |  |  |
| TC-MN-04 | UCU04 | Boundary minPrice/maxPrice | Có nhiều mức giá | 1) set min/max 2) “Áp dụng” | min=0, max=0 (biên) | Nếu không có giá 0 → trả rỗng + message “Không có sản phẩm…” |  |  |
| TC-MN-05 | UCU04 | Sort theo price | Có sản phẩm giá khác nhau | 1) chọn sort=price 2) apply |  | Danh sách được sort theo giá tăng |  |  |

### Feature: UCU06 — Cart + Checkout
| Test Case ID | Function ID | Test Title | Preconditions | Steps | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| TC-CK-01 | UCU06 | Add to cart từ product detail | Có products | 1) `/menu` 2) chọn món 3) “Thêm vào giỏ” | size/topping bất kỳ | Cart tăng số lượng item |  |  |
| TC-CK-02 | UCU06 | Cart tổng tiền = sum(price*qty) | Có cart items | 1) `/cart` |  | Total hiển thị đúng |  |  |
| TC-CK-03 | UCU06 | Checkout bị chặn khi cart rỗng | Chưa add item | 1) `/checkout` |  | Hiện “Giỏ hàng đang trống…” và không tạo order |  |  |
| TC-CK-04 | UCU06 | Tạo order thành công | Login customer + cart có item | 1) `/checkout` 2) nhập form 3) submit | name/phone/address/pickupLocation | Tạo order, clear cart, navigate `/orders/:id` |  |  |
| TC-CK-05 | UCU06 | Checkout fail khi thiếu token | Logout | 1) `/checkout` 2) tạo đơn |  | Bị redirect `/login` hoặc báo token required |  |  |

### Feature: UCA2 — Admin Manage Menu (CRUD)
| Test Case ID | Function ID | Test Title | Preconditions | Steps | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| TC-AM-01 | UCA2 | Admin mở `/admin/menu` thấy list sản phẩm | Login admin | 1) `/admin/menu` |  | Hiển thị danh sách sản phẩm |  |  |
| TC-AM-02 | UCA2 | Admin tạo sản phẩm mới (valid) | Login admin | 1) Fill form 2) Submit | name, price>=0, category | Tạo mới thành công, list reload có item mới |  |  |
| TC-AM-03 | UCA2 | Admin tạo sản phẩm fail khi thiếu name | Login admin | 1) name rỗng 2) submit | name empty | Hiện lỗi “Name and price are required” |  |  |
| TC-AM-04 | UCA2 | Admin cập nhật sản phẩm | Login admin | 1) bấm “Sửa” 2) đổi giá 3) lưu | price change | Cập nhật thành công, list phản ánh giá mới |  |  |
| TC-AM-05 | UCA2 | User thường bị 403 khi gọi CRUD | Login customer | 1) vào `/admin/menu` 2) thử create/update/delete |  | UI báo lỗi/403, không thay đổi dữ liệu |  |  |

### Feature: UCA4 — Admin Manage Orders
| Test Case ID | Function ID | Test Title | Preconditions | Steps | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| TC-AO-01 | UCA4 | Admin xem danh sách orders | Login admin + có orders | 1) `/admin/orders` |  | Hiển thị list orders |  |  |
| TC-AO-02 | UCA4 | Admin đổi status ordered → processing | Có order ordered | 1) chọn status 2) cập nhật | status=processing | Order được update, reload thấy status mới |  |  |
| TC-AO-03 | UCA4 | Admin đổi status processing → completed | Có order processing | 1) đổi status 2) cập nhật | status=completed | Update thành công |  |  |
| TC-AO-04 | UCA4 | Admin set status invalid bị chặn (boundary/negative) | Login admin | 1) gọi API bằng DevTools (optional) | status=`invalid` | API trả lỗi “Invalid order status” |  |  |
| TC-AO-05 | UCA4 | Customer không truy cập được admin/all orders | Login customer | 1) vào `/admin/orders` |  | Router chặn hoặc API 403 |  |  |

### Feature: UCA5 — Admin Statistics
| Test Case ID | Function ID | Test Title | Preconditions | Steps | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| TC-AS-01 | UCA5 | Admin xem statistics period=day | Login admin + có orders | 1) `/admin/statistics` | period=day | Hiển thị KPI + top products + breakdown |  |  |
| TC-AS-02 | UCA5 | Đổi period week reload data | Login admin | 1) chọn “Last 7 days” |  | Data reload, không crash |  |  |
| TC-AS-03 | UCA5 | Đổi period month reload data | Login admin | 1) chọn “Last 30 days” |  | Data reload, không crash |  |  |
| TC-AS-04 | UCA5 | Không có orders thì KPI = 0, top empty | DB không có orders (tuỳ) | 1) `/admin/statistics` |  | Revenue=0, orderCount=0, top empty, breakdown empty |  |  |
| TC-AS-05 | UCA5 | Customer bị chặn thống kê | Login customer | 1) vào `/admin/statistics` |  | Router chặn hoặc API 403 |  |  |

### Feature: UCU09 — Review (link defect)
| Test Case ID | Function ID | Test Title | Preconditions | Steps | Test Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|---|
| TC-REV-01 | UCU09 | Review thành công khi order completed | Login customer + order completed | 1) `/orders/:id` 2) submit review | rating 5 + comment | API tạo review, alert “Cảm ơn…” |  |  |
| TC-REV-02 | UCU09 | Review bị chặn khi order status=ordered | Login customer + order ordered | 1) `/orders/:id` |  | Không hiển thị form review |  |  |
| TC-REV-03 | UCU09 | Review cho order paid phải được phép (regression) | Login customer + order paid | 1) `/orders/:id` 2) submit review | rating 4 | Expected: tạo review thành công; Nếu hiện message cũ “Only completed…” => Fail + log defect B001 |  |  |

## 3) Execution summary (fill after running)
- Total executed: ___
- Passed: ___
- Failed: ___
- Notes: ___
