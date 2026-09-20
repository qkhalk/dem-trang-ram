# 🌕 Đêm Trăng Rằm · Tết Trung Thu 2026

Trang web lễ hội Trung Thu làm bằng **HTML + CSS + JavaScript thuần** — không framework, không thư viện.

## ✨ Tính năng

- **Hero điện ảnh**: trăng rằm vàng với bóng cây đa · chú Cuội · em bé, mây trôi, đèn lồng tự bay, skyline mái phố
- **Đếm ngược thật** tới rằm tháng Tám — thứ Sáu, ngày 25.09.2026
- **Truyền thuyết** Hằng Nga & Chú Cuội với minh họa paper-cut SVG
- **Phong tục**: bánh nướng · bánh dẻo, múa lân, đèn ông sao · đèn cá chép, mâm cỗ đêm hội (bento grid)
- **Thả đèn ước nguyện**: viết điều ước → đèn bay lên trời, lưu bằng `localStorage`
- **Tương tác**: chạm bầu trời để thả sao băng ✦, parallax theo con trỏ, reveal khi cuộn
- **Toàn bộ hình ảnh là SVG inline** — chạy offline, không phụ thuộc link ảnh ngoài
- Tôn trọng `prefers-reduced-motion`: tắt animation cho người nhạy cảm chuyển động

## 🚀 Chạy thử

Mở trực tiếp `index.html`, hoặc:

```bash
python -m http.server 8000
```

rồi truy cập `http://localhost:8000`.

## 🛠 Kỹ thuật

| Thành phần | Vai trò |
|---|---|
| `index.html` | Cấu trúc + toàn bộ minh họa SVG inline |
| `css/style.css` | Design tokens (OKLCH), layout, animation keyframes |
| `js/main.js` | Starfield canvas, đếm ngược, đèn ước nguyện, parallax, reveal |

Font: [Bodoni Moda](https://fonts.google.com/specimen/Bodoni+Moda) + [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) (Google Fonts, có fallback hệ thống).

---

*Chúc cả nhà một mùa Trung Thu sum vầy, trăng tròn vòng, đèn sáng lung linh.* 🏮
