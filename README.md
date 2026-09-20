# 🌕 Đêm Trăng Rằm · Tết Trung Thu 2026

Trang web lễ hội Trung Thu làm bằng **HTML + CSS + JavaScript thuần** — không framework, không thư viện.

## ✨ Tính năng

- **4 màn hình riêng biệt** (Đêm hội · Truyền thuyết · Phong tục · Ước nguyện) — không cuộn trang dài: chuyển màn bằng menu, phím ←/→, hoặc vuốt ngang trên điện thoại
- **Hero điện ảnh**: trăng rằm vàng với bóng cây đa · chú Cuội · em bé, mây trôi, đèn lồng tự bay, skyline mái phố
- **Đếm ngược thật** tới rằm tháng Tám — thứ Sáu, ngày 25.09.2026
- **Đêm lễ hội tự động**: đúng ngày Trung Thu trang tự bật chế độ hội — pháo hoa canvas (bấm anywhere để bắn thêm), huy hiệu "Chúc mừng Trung Thu", lời chúc đầu đêm, đèn bay dày hơn. Xem trước mọi lúc bằng `?party=1`
- **Truyền thuyết** Hằng Nga & Chú Cuội với minh họa paper-cut SVG + lời bài "Múa lân"
- **Phong tục**: bánh nướng · bánh dẻo, múa lân, đèn ông sao · đèn cá chép, mâm cỗ đêm hội (bento)
- **Thả đèn ước nguyện**: viết điều ước → đèn bay lên trời, lưu bằng `localStorage`
- **Tương tác**: chạm bầu trời để thả sao băng ✦, parallax theo con trỏ
- **Font tự host** (Cormorant Garamond + Be Vietnam Pro, subset tiếng Việt) — không phụ thuộc Google Fonts, chạy offline hoàn toàn
- Tôn trọng `prefers-reduced-motion`: tắt animation cho người nhạy cảm chuyển động

## 🚀 Chạy thử

Mở trực tiếp `index.html`, hoặc:

```bash
python -m http.server 8000
```

rồi truy cập `http://localhost:8000`. Xem trước chế độ lễ hội: `http://localhost:8000/?party=1`.

## 🛠 Kỹ thuật

| Thành phần | Vai trò |
|---|---|
| `index.html` | Cấu trúc 4 màn + toàn bộ minh họa SVG inline |
| `css/style.css` | Design tokens (OKLCH), hệ màn hình, animation keyframes |
| `js/main.js` | Hash router màn hình, starfield & fireworks canvas, đếm ngược, đèn ước nguyện |
| `fonts/` | woff2 tự host + `fonts.css` |

---

*Chúc cả nhà một mùa Trung Thu sum vầy, trăng tròn vòng, đèn sáng lung linh.* 🏮
