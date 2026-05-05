// 1. Firebase imports & config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2GJVacjNwAzIXhJyNi_Djen5gd3jV91o",
  authDomain: "notesapp-lab2.firebaseapp.com",
  projectId: "notesapp-lab2",
  storageBucket: "notesapp-lab2.firebasestorage.app",
  messagingSenderId: "466128721010",
  appId: "1:466128721010:web:aec831b58ffddf9bfd1eeb"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// 2. Backend base URL
const API = "http://localhost:8000";

// 3. DOM references
const loginPanel = document.getElementById("login-panel");
const appPanel = document.getElementById("app-panel");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const loginError = document.getElementById("login-error");
const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");
const userEmail = document.getElementById("user-email");
const userUid = document.getElementById("user-uid");
const noteContent = document.getElementById("note-content");
const btnSave = document.getElementById("btn-save");
const noteError = document.getElementById("note-error");
const notesList = document.getElementById("notes-list");
const notesCount = document.getElementById("notes-count");
const notesLoading = document.getElementById("notes-loading");
const notesEmpty = document.getElementById("notes-empty");

// 4. Lấy Firebase ID Token
async function getToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Chưa đăng nhập");
  return await user.getIdToken();
}

// 5. API calls
async function apiFetch(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Lỗi ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// 6. Load danh sách notes
async function loadNotes() {
  notesLoading.classList.remove("hidden");
  notesEmpty.classList.add("hidden");
  notesList.innerHTML = "";

  try {
    const notes = await apiFetch("/notes");
    notesLoading.classList.add("hidden");
    notesCount.textContent = notes.length;

    if (notes.length === 0) {
      notesEmpty.classList.remove("hidden");
      return;
    }

    notes.forEach(note => renderNote(note));
    console.log(`Đã load ${notes.length} ghi chú`);
  } catch (err) {
    notesLoading.classList.add("hidden");
    console.error("Lỗi load notes:", err.message);
  }
}

// 7. Render 1 note vào danh sách
function renderNote(note) {
  const date = new Date(note.created_at).toLocaleString("vi-VN");

  const li = document.createElement("li");
  li.className = "note-item";
  li.dataset.id = note.id;
  li.innerHTML = `
    <div>
      <p class="note-content">${escapeHtml(note.content)}</p>
      <p class="note-date">${date}</p>
    </div>
    <button class="btn-delete" data-id="${note.id}">Xóa</button>
  `;

  li.querySelector(".btn-delete").addEventListener("click", () => deleteNote(note.id, li));
  notesList.prepend(li);
}

// 8. Tạo note mới
async function createNote() {
  const content = noteContent.value.trim();
  if (!content) {
    showNoteError("Vui lòng nhập nội dung ghi chú.");
    return;
  }

  hideNoteError();
  btnSave.textContent = "Đang lưu...";
  btnSave.disabled = true;

  try {
    const note = await apiFetch("/notes", {
      method: "POST",
      body: JSON.stringify({ content }),
    });

    noteContent.value = "";
    renderNote(note);
    notesEmpty.classList.add("hidden");
    notesCount.textContent = parseInt(notesCount.textContent || "0") + 1;
    console.log("Đã tạo note id:", note.id);
  } catch (err) {
    showNoteError("Lỗi khi lưu: " + err.message);
    console.error("Lỗi tạo note: ", err.message);
  } finally {
    btnSave.textContent = "Lưu ghi chú";
    btnSave.disabled = false;
  }
}

// 9. Xóa note
async function deleteNote(id, liElement) {
  if (!confirm("Xóa ghi chú này?")) return;

  try {
    await apiFetch(`/notes/${id}`, { method: "DELETE" });
    liElement.remove();
    const current = parseInt(notesCount.textContent || "1");
    notesCount.textContent = Math.max(0, current - 1);
    if (notesList.children.length === 0) {
      notesEmpty.classList.remove("hidden");
    }
    console.log("Đã xóa note id:", id);
  } catch (err) {
    alert("Lỗi khi xóa: " + err.message);
    console.error("Lỗi xóa note: ", err.message);
  }
}

// 10. Show/hide panels
function showApp(user) {
  loginPanel.classList.add("hidden");
  appPanel.classList.remove("hidden");
  userEmail.textContent = user.email;
  userUid.textContent   = "UID: " + user.uid;
  loadNotes();
}

function showLogin() {
  appPanel.classList.add("hidden");
  loginPanel.classList.remove("hidden");
  notesList.innerHTML    = "";
  notesCount.textContent = "0";
  emailInput.value = "";
  passInput.value  = "";
}

function showLoginError(msg) {
  loginError.textContent = msg;
  loginError.classList.remove("hidden");
}

function hideLoginError() {
  loginError.classList.add("hidden");
}

function showNoteError(msg) {
  noteError.textContent = msg;
  noteError.classList.remove("hidden");
}

function hideNoteError() {
  noteError.classList.add("hidden");
}

// 11. Escape HTML (XSS's counter)
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 12. Firebase error messages
function mapFirebaseError(code) {
  const map = {
    "auth/invalid-email": "Email không hợp lệ.",
    "auth/user-not-found": "Tài khoản không tồn tại.",
    "auth/wrong-password": "Sai mật khẩu.",
    "auth/invalid-credential": "Email hoặc mật khẩu không đúng.",
    "auth/too-many-requests": "Quá nhiều lần thử. Vui lòng thử lại sau.",
    "auth/network-request-failed": "Lỗi kết nối mạng.",
  };
  return map[code] || "Đăng nhập thất bại. Vui lòng thử lại.";
}

// 13. Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Đã đăng nhập:", user.email, "| UID:", user.uid);
    showApp(user);
  } else {
    console.log("Chưa đăng nhập");
    showLogin();
  }
});

// 14. Event listeners
btnLogin.addEventListener("click", async () => {
  hideLoginError();
  const email = emailInput.value.trim();
  const password = passInput.value;

  if (!email || !password) {
    showLoginError("Vui lòng nhập email và mật khẩu.");
    return;
  }

  btnLogin.textContent = "Đang đăng nhập...";
  btnLogin.disabled = true;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error("Login error:", err.code, err.message);
    showLoginError(mapFirebaseError(err.code));
  } finally {
    btnLogin.textContent = "Đăng nhập";
    btnLogin.disabled = false;
  }
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  console.log("Đã đăng xuất");
});

btnSave.addEventListener("click", createNote);

// Nhấn Ctrl+Enter trong textarea cũng lưu note
noteContent.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") createNote();
});