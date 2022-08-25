const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('Server is listening'));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>
  console.log(`[server]: Server is listening on http://localhost:${PORT}`)
);
