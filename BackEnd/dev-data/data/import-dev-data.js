const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel');
const dotenv = require('dotenv');
const { Mongos } = require('mongodb');

dotenv.config({ path: './config.env' });
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

//READ JSON FILE

const tours = JSON.parse(fs.readFileSync('./tours-simple.json', 'utf-8'));
//IMPORT DATA INTO DB

const importData = async () => {
  try {
    await Tour.create(tours);
  } catch (err) {
    console.log(err);
  }
};

//DELETE ALL DATA

const deleteData = async () => {
  try {
    await Tour.deleteMany();
  } catch (err) {
    console.log(err);
  }
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[3] === '--delete') {
  deleteData();
}
console.log(process.argv);
