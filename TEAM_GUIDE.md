# دليل الفريق - Phase 2 (Online Library)

## ترتيب تحميل السكريبتات (في كل صفحة، بـ defer، من غير inline JS)
```html
<link rel="stylesheet" href="css/style.css">
<script src="js/storage.js" defer></script>
<script src="js/auth.js" defer></script>
<script src="js/nav.js" defer></script>
<script src="js/validation.js" defer></script>
<script src="js/<page>.js" defer></script>
```
الصفحات المحمية: حط `hidden` على `<body>` (الـ guard هو اللي بيظهرها). وأول سطر في سكريبت الصفحة:
```js
const session = requireRole('user');   // أو 'admin' أو requireLogin()
if (!session) return;                  // جوه دالة init، الـ guard عمل redirect
```
> صفحات الـ guest (login / signup / index) مفيهاش `hidden`.

## Tables (استخدم الثوابت)
`TABLES.USERS` = `'users'` و `TABLES.BOOKS` = `'books'`

| Table | Fields |
|---|---|
| users | id, username, email, passwordHash, role (`'user'` / `'admin'`) |
| books | id, title, author, category, description, status (`'Available'` / `'Borrowed'`), borrowedBy (id أو `null`), borrowDate (ISO أو `null`) |

## storage.js
`getAll(t)` · `getById(t,id)` (الـ id ممكن يكون string من الـ URL) · `insert(t,record)` · `update(t,id,changes)` (الـ id مش بيتغير) · `remove(t,id)` → true/false · `find(t,predicate)`
> ممنوع أي `localStorage` مباشر في أي ملف تاني. `insert` و `update` بيرجعوا `null` لو الحفظ فشل.

## auth.js
- **Session:** `setSession(user)` · `getSession()` → `{id,username,role}` أو null · `clearSession()` · `getHomePage(role)` · `redirectToHome()`
- **Guards:** `requireLogin()` · `requireRole(role)` · `redirectIfLoggedIn()` (للـ login/signup) · `hasRole(role)` (للتحقق جوه دوال الـ edit/delete/borrow)
- **Auth (async):** `registerUser({username,email,password,role})` → `{ok,user}` أو `{ok:false,message}` · `login(username,password)` → `{ok,user}` أو `{ok:false,message}` · `logout()`
- **للـ validation.js:** `isUsernameTaken(username, ignoreId)` · `isEmailTaken(email, ignoreId)` (يستخدموا مع `setCustomValidity`)
- بعد نجاح الـ login استدعي `redirectToHome()`. بعد نجاح الـ signup حوّل لـ `login.html`.

## قيم الـ role في الـ sign-up
الـ `<select name="role">` لازم قيمه `user` و `admin` بالظبط (والنص الظاهر User / Administrator).

## تقسيم الشغل
| العضو | الملفات |
|---|---|
| 1 | storage.js, auth.js, README.txt, cover page, الدمج والتسليم |
| 2 | validation.js, index / login / signup |
| 3 | nav.js, books.html (الكتالوج والبحث) |
| 4 | book-details.html (Borrow / Return) |
| 5 | my-borrowed.html + مراجعة الصلاحيات |
| 6 | admin-books.html + add-edit-book.html |

## قواعد مهمة
1. `textContent` دايمًا، ممنوع `innerHTML` لأي نص جاي من التخزين.
2. اعمل `trim()` لكل نص قبل الحفظ وارفض الفاضي.
3. الـ Borrow/Return/Delete/Edit: افحص الصلاحية والحالة **جوه الدالة** من storage مش من الـ DOM (`getById` من جديد لحظة الضغط).
4. مفيش بيانات تجريبية hard-coded، وكل الكروت والصفوف تتولد من `getAll`.
5. لو احتجت دالة مشتركة جديدة، ابعتلي أضيفها هنا بدل ما تتكرر في الصفحات.
