# NotesApp

Ứng dụng ghi chú cá nhân. Người dùng đăng nhập bằng Firebase Authentication, tạo và quản lý ghi chú cá nhân được lưu vào PostgreSQL.

Được xây dựng cho Lab 2 — Môn Tư duy Tính toán: API & Firebase Studio.

---

## Công nghệ sử dụng

| Layer | Công nghệ |
|---|---|
| Backend | FastAPI |
| Authentication | Firebase Authentication |
| Database | PostgreSQL + SQLAlchemy |
| Frontend | HTML + CSS + Vanilla JavaScript |
| Firebase Admin | firebase-admin SDK |
| Firebase Client | Firebase JS SDK v10 |

---

## Cấu trúc thư mục

```
notesapp/
├── backend/
│   ├── __init__.py
│   ├── main.py          # FastAPI app, tất cả routes
│   ├── database.py      # SQLAlchemy engine + session
│   ├── models.py        # ORM model: Note
│   ├── schemas.py       # Pydantic schemas
│   ├── auth.py          # Firebase token verification
│   ├── .env             # Biến môi trường
│   └── firebase_service_account.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js           # Firebase Auth + API calls
├── requirements.txt
├── .gitignore
└── README.md
```

---

## Yêu cầu môi trường

- Python 3.10 trở lên
- PostgreSQL 14 trở lên
- Trình duyệt hiện đại (Chrome, Edge, Firefox)
- [VS Code Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) (để chạy frontend)

---

## Cài đặt

### 1. Clone repository

```bash
git clone <GITHUB_REPO_URL>
cd notesapp
```

### 2. Tạo và kích hoạt virtual environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python -m venv .venv
source .venv/bin/activate
```

### 3. Cài dependencies

```bash
pip install -r requirements.txt
```

---

## Cấu hình

### 4. Tạo PostgreSQL database

```bash
createdb -U postgres notesapp
```

Kết nối và tạo bảng:

```bash
psql -U postgres -d notesapp
```

```sql
CREATE TABLE notes (
    id         SERIAL PRIMARY KEY,
    user_uid   VARCHAR(128) NOT NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_notes_user_uid ON notes(user_uid);
\q
```

### 5. Tạo file `backend/.env`

Tạo file `backend/.env` với nội dung sau (thay thông tin thật của bạn):

```
DATABASE_URL=postgresql+psycopg://YOUR_USER:YOUR_PASSWORD@localhost:5432/notesapp
```

> File này không được commit lên GitHub.

### 6. Đặt Firebase Service Account Key

- Vào [Firebase Console](https://console.firebase.google.com) → Project Settings → Service accounts → **Generate new private key**.
- Đổi tên file tải về thành `firebase_service_account.json`.
- Đặt file vào thư mục `backend/`.

> File này không được commit lên GitHub.

### 7. Cấu hình Firebase Web Config trong frontend

- Vào Firebase Console → Project Settings → Your apps → chọn Web app → copy `firebaseConfig`.
- Mở `frontend/app.js`, tìm đoạn sau và thay bằng config thật của bạn:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

---

## Chạy ứng dụng

### Chạy backend

Đảm bảo venv đã được kích hoạt, đứng ở thư mục `notesapp/`:

```bash
uvicorn backend.main:app --reload
```

Backend chạy tại: `http://localhost:8000`

Swagger UI (tài liệu API): `http://localhost:8000/docs`

### Chạy frontend

Mở file `frontend/index.html` bằng **VS Code Live Server**:

1. Mở VS Code, cài extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
2. Mở file `frontend/index.html` trong VS Code.
3. Click **"Go Live"** ở thanh trạng thái dưới cùng.

Frontend chạy tại: `http://127.0.0.1:5500/frontend/index.html`

> Phải dùng Live Server (HTTP), không mở trực tiếp file (`file:///`) vì sẽ bị lỗi CORS.

---

## Test nhanh

1. Đảm bảo backend đang chạy tại `http://localhost:8000`.
2. Mở frontend qua Live Server.
3. Đăng nhập bằng email/password đã tạo trong Firebase Console → Authentication → Users.
4. Tạo một ghi chú → kiểm tra xuất hiện trong danh sách.
5. Reload trang → ghi chú vẫn còn (đã lưu vào PostgreSQL).
6. Xóa ghi chú → biến mất khỏi danh sách.

Kiểm tra dữ liệu trực tiếp trong database:

```bash
psql -U postgres -d notesapp -c "SELECT * FROM notes;"
```

---

## Video demo

> Linh video demo: 
