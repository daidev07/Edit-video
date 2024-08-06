const express = require('express');
const path = require('path');
const app = express();

// Middleware để thêm các tiêu đề HTTP cần thiết
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Phục vụ các tệp tĩnh từ thư mục 'dist' (sau khi build Vue.js)
app.use(express.static(path.join(__dirname, 'dist')));

// Bất kỳ tuyến đường nào khác sẽ trả về 'index.html' (cho ứng dụng SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
