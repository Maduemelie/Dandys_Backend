const app = require('./app');
require('dotenv').config();
const connectToDb = require('./dbConnect');

const port = process.env.PORT || 5300;
connectToDb();

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
