const express = require('express')
const app = express()
const cors = require('cors')
const req = require('express/lib/request')
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
const { type } = require('express/lib/response');
const { Int32 } = require('mongodb');
const connectStr = "mongodb+srv://ehempfling:4clJYTNDrbN48Gfe@cluster0.dyaznbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(connectStr, { useNewUrlParser: true, useUnifiedTopology: true });
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));

let User;
let Exercise;
let Logs;
const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  date: {
    type: String,
  },
  duration: {
    type: Number,
  },  
  description: {
    type: String,
  }
},
{ versionKey: false }
)

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
    type: String,
  }, 
},
{ versionKey: false }
);

const logSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  count: {
    type: Number,
  },
  _id: {
    type: String,
  },
  log: [{
    _id : false,
    description: {
      type: String,
    },
  duration: {
    type: Number,
  },
  date: {
    type: String,
  } 
  },],
},
{ versionKey: false }
);

User = mongoose.model('User', userSchema);
Exercise = mongoose.model('Exercise', exerciseSchema);
Logs = mongoose.model('Logs', logSchema);

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
  
  const logs = new Logs({username: userAdded, count: 0, _id: user._id, log: []})
  logs.save(function(err, data) {
    if (err) {console.log("Logs save error: ", err)}
    return data;
  })
};

const findIdCreateAndSaveExercise = (infoAdded, done) => {

  User.findById(infoAdded._id, (err, data) => {
    if (err) {return console.log('findIdCreateAndSaveExercise(): ',err)}
  
    
//const exerciseObj = {description: infoAdded.description, duration: infoAdded.duration, date: infoAdded.date}
User.findByIdAndUpdate(infoAdded._id, {$set: {description: infoAdded.description, duration: infoAdded.duration, date: infoAdded.date}},  { new: true}, (err, data) => {
  if (err) {console.error(err)}
    //var exerciseObj = {_id: data._id, username: data.username, date: data.date, duration: data.duration, description: data.description}
    done(null, data)
  })

  


    
  Logs.findById(infoAdded._id, (err, data) => {
    if (err) {console.log(err)}
    data.log.push({description: infoAdded.description, duration: infoAdded.duration, date: new Date(infoAdded.date)})
    var length = data.log.length;
    Logs.findByIdAndUpdate(data._id, {count: length}, {new: true}, (err, data2) => {
      if (err) {console.log(err)}
      return data2;
    })
    data.save((err, saveData) => {
      if (err) {console.log("Save Logs Error: ", err)}
      return saveData;
      })
 
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
})
app.route('/api/users/:_id/exercises').post((req, res) => {
  //var id = req.body[':_id'];
  
  /*if (req.body[':_id'] === undefined) {
    id = req.params._id;
  }*/
  var id = id = req.params._id;
  var { description, duration, date } = req.body;
  if (date === undefined || date === null || date === "") {
    date = new Date();
  } else {
    date = new Date(date);
  }
  //date = new Date(date).toDateString();
  var exerciseObj = {_id: id, date: date.toDateString(), duration: duration, description: description  }
  //console.log("POST INFO: ",exerciseObj, " PATH: ", req.path, " PARAMS: ", req.params)
  findIdCreateAndSaveExercise(exerciseObj, (err, data) => {
    if (err) { console.log(err) }
    res.json(data);
    console.log(data + " is saved in the db.")
    
    
  })
})

app.get('/api/users', (req, res) => {
  const getAllUsers = User.find({}, function(err, result) {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });

})

app.get('/api/users/:_id/logs?', (req, res) => {
  console.log(req.url)

  var id = req.params._id;
  console.log("Less Than: ", new Date(req.query.from) < new Date(req.query.to))
  if (req.query.from !== "" && id !== ':_id') {

    /*Logs.find({"log.date": {$gte: new Date(req.query.from),
      $lte: new Date(req.query.to)}}, ((err, data) => {
        if (err) {console.log("Get Logs error: ", err)}
          console.log("CHAINED: ", data, new Date(req.query.from))
        res.json(data)
          })
        ) 

        }*/

        Logs.find({log: { $elemMatch: {date: {$gte: new Date(req.query.from),
      $lt: new Date(req.query.to)}}} }, ((err, data) => {
            if (err) {console.log("Get Logs error: ", err)}
              console.log("CHAINED: ", data, new Date(req.query.to))
            res.json(data)
              })
            ) 
    
            }

  else if (id !== ':_id') {
    Logs.findById(id, (err, data) => {
      if (err) {console.log("Get Logs error: ", err)}
      res.json(data)
      })
    }
  else {
    Logs.find({}, (err, data) => {
      if (err) {console.log("Get Logs error: ", err)}
      res.json(data)
      console.log(req.query)
    
    });
  }

});


  /*Person.find({favoriteFoods: foodToSearch}).sort({name: 'asc'}).limit(2).select('-age').exec((err, chainedData) => {
    if (err) {return console.error(err)}
    done(null, chainedData);
    console.log("CHAINED-DATA: " + chainedData)
  })*/



const listener = app.listen(process.env.PORT || 3001, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
