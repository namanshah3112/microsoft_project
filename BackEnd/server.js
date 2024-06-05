const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION SUTTING DOWN');
  console.log(err.name, err.message);
  process.exit(1);
});
const db =
  'mongodb+srv://namanashah31:mgEYXqbCbNvR7i990@cluster0.jfcdso9.mongodb.net/';
const con = mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connection Successfull');
  });

const port = process.env.PORT || 8000;
// console.log(process.env);
const server = app.listen(port, () => {
  console.log(`app running on port 127.0.0.1/${port}/`);
});

//EVENT LISTENERS
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLER REJEXTION SUTTING DOWN');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// console.log(x);
