const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

const bcrypt = require('bcrypt');

bcrypt.hash('Admin@123', 10).then(console.log);
bcrypt.hash('Demo@123', 10).then(console.log);

