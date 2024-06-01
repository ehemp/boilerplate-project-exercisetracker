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

app.use('/api/users/:_id/logs?', (req, res, next) => {
  console.log(req.params)
  req.id = req.params._id;
  req.lim = parseInt(req.query.limit);
  Exercise.find({_id: req.id}).find({ log: {date: {$gte: new Date(req.query.from),
    $lte: new Date(req.query.to)}}}).limit(req.lim).exec((err, logDate) => {
            if (err) {console.log("Get Logs error: ", err); res.json(err)}
            console.log("MiddleWARE LOG: ", logDate, req.lim, "REQ.URL: ", req.url)
            req.logDate = logDate;
            })
  next();
}, (req, res, next) => {
  User.findOne({_id: req.id}, (err, logData) => {
    console.log("LOGDATE: ", req.logDate, "logData: ", logData)
    res.json({
      username: logData.username,
      _id: req.id,
      count: req.logDate[0].log.length,
      log: req.logDate
    })
    //next();
  })
})


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
  //_id : false,
  log: [{
    _id : false,
    description: {
      type: String,
    },
  duration: {
    type: Number,
  },
  date: {
    type: Date,
  } 
  }],
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
    type: Date,
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

  const exercise = new Exercise({_id: user._id, log: []})
  exercise.save(function(err, data) {
    if (err) {console.log("Exercise save error: ", err)}
    return data;
  })

};

const findIdCreateAndSaveExercise = (infoAdded, done) => {

  User.findById(infoAdded._id, (err, userData) => {
    if (err) {return console.log('findIdCreateAndSaveExercise(): ',err)}
  

//const exerciseObj = {description: infoAdded.description, duration: infoAdded.duration, date: infoAdded.date}
/*User.findByIdAndUpdate(infoAdded._id, {$set: {description: infoAdded.description, duration: infoAdded.duration, date: infoAdded.date}},  { new: true}, (err, data) => {
  if (err) {console.error(err)}
    //var exerciseObj = {_id: data._id, username: data.username, date: data.date, duration: data.duration, description: data.description}
    done(null, data)
  })*/


  Exercise.findById(userData._id, (err, data) => {
    if (err) {console.error(err)}
    data.log.push({description: infoAdded.description, duration: infoAdded.duration, date: new Date(infoAdded.date)})
      var exerciseObj = {_id: userData._id, username: userData.username, date: data.date, duration: data.duration, description: data.description}
      data.save((err, saveData) => {
        if (err) {console.log("Save Logs Error: ", err)}
        return saveData;
        })
      done(null, exerciseObj)
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
  var exerciseObj = {_id: id, date: date, duration: duration, description: description  }
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



app.get('/api/users/:_id/logs?/:from?/:to?/:limit?', (req, res) => {
  //console.log(req.url)
  console.log(req.query)
  var id = req.params._id;
  
 var lim = parseInt(req.query.limit);

  /*Logs.findById(id, (err, data) => {
    if (err) {console.log(err)}

    if (req.query.from) {
      console.log("REQ.QUERY.LIMIT: ", typeof lim)
      Logs.find({_id: id}).limit(lim).find({ 'log.date': {$gte: new Date(req.query.from),
        $lte: new Date(req.query.to)}}).exec((err, data) => {
                if (err) {console.log("Get Logs error: ", err); res.json(err)}
                console.log("LOG: ", data, lim, "REQ.URL: ", req.url)
              res.json(data)
                })
    }
    else if (req.query.limit) {
      Logs.find({_id: id}).limit(lim).exec((err, data) => {
        if (err) {console.log("Get Logs error: ", err); res.json(err)}
        console.log("LOG: ", data, req.query.limit, "LIMIT REQ.URL: ", req.url)
      res.json(data)
        })
    } else {
      res.json(data)
    }

  })*/




});


  /*Person.find({favoriteFoods: foodToSearch}).sort({name: 'asc'}).limit(2).select('-age').exec((err, chainedData) => {
    if (err) {return console.error(err)}
    done(null, chainedData);
    console.log("CHAINED-DATA: " + chainedData)
  })*/



const listener = app.listen(process.env.PORT || 3001, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
