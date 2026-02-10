const bcrypt = require('bcrypt');

(async () => {
//   const adminHash = await bcrypt.hash('Admin@123', 10);
  const userHash = await bcrypt.hash('User@123', 10);

//   console.log('Admin@123 =>', adminHash);
  console.log('User@123  =>', userHash);

  process.exit(0);
})();
