const express = require('express')
const app = express()
const cors = require('cors')
const req = require('express/lib/request')
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
const { type } = require('express/lib/response');
const connectStr = "mongodb+srv://ehempfling:4clJYTNDrbN48Gfe@cluster0.dyaznbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(connectStr, { useNewUrlParser: true, useUnifiedTopology: true });
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));

let User;
let Exercise;
const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
})

const exerciseSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  description: {
      type: String,
    },
  duration: {
    type: Number,
  },
  date: {
    type: Date,
  }  
  
})

User = mongoose.model('User', userSchema);
Exercise = mongoose.model('Exercise', exerciseSchema)

const createAndSaveUser = (userAdded, done) => {
  const user = new User({username: userAdded})
  console.log("createandSave: " + user)
  user.save(function(err, data) {
    if (err) {
      return console.error(err)
    } else {
      done(null, data);
    }
  })
  
};

const findIdCreateAndSaveExercise = (infoAdded, done) => {

  User.findById(infoAdded._id, (err, getUser) => {
    if (err) {return console.log('findIdCreateAndSaveExercise(): ',err)}
    console.log("getUser: ", getUser)
    const exercise = new Exercise({username: getUser.username, _id: getUser._id, description: infoAdded.description, duration: infoAdded.duration, date: Date(infoAdded.date).toString()})
  console.log("createandSaveExercise: " + getUser.username)
  exercise.save(function(err, exerciseData) {
    if (err) {
      return console.error(err)
    } else {
      console.log(exerciseData)
      done(null, exerciseData);
    }
  })
  
  })
  
  
};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.route('/api/users').post((req, res) => {
  var { username } = req.body;
  createAndSaveUser(username, (err, data) => {
    if (err) { console.log(err) }
    console.log(data + " is saved in the db.")
    const showUser = {username: data.username, _id: data._id}
    res.json(showUser)
  })
  console.log("User: ", User.user)
  //res.json(User);
})
app.route('/api/users/:_id/exercises').post((req, res) => {
  var id = req.body[':_id'];
  var { description, duration, date } = req.body;
  var exerciseObj = {_id: id, description: description, duration: duration, date: date}
  findIdCreateAndSaveExercise(exerciseObj, (err, data) => {
    if (err) { console.log(err) }
    console.log(data + " is saved in the db.")
    //const showUser = {username: data.username, _id: data._id}
    //res.json(showUser)
    
  })
})

const listener = app.listen(process.env.PORT || 3001, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
