const express = require('express')
const app = express()
const cors = require('cors')
const req = require('express/lib/request')
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
const { type } = require('express/lib/response');
const { Int32, ObjectId } = require('mongodb');
const connectStr = "mongodb+srv://ehempfling:4clJYTNDrbN48Gfe@cluster0.dyaznbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(connectStr, { useNewUrlParser: true, useUnifiedTopology: true });
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', (req, res, next) => {

  console.log("SLASH ONLY!! ", req.query)
  next();
})

app.use('/api/users/:_id/logs?', (req, res, next) => {
  console.log(req.query)
  req.id = req.params._id;
  req.lim = parseInt(req.query.limit);
  Exercise.find({ id: req.id }, (err, dataId) => {
    //console.log("FIND FULL EXERCISE: ", dataId)
    req.count = dataId.length;
  })
  if (req.query.from && req.query.to && req.query.limit) {
    Exercise.find({id: req.id.toString()}).find({ date: {$gte: Math.floor(new Date(req.query.from)),
      $lte: Math.floor(new Date(req.query.to))}}, (err, logDate) => {
        if (err) {return console.log("From/To", err)}
        console.log("LOGDATE: ", logDate)
        req.logDate = []
        for (i of logDate) {
          var  { description, duration, date } =  i
          req.dateObj = { description: description, duration: duration, date: date.toDateString() }
          if (req.id.toString() === i.id.toString()) {
            req.logDate.push(req.dateObj)
          }
        }
        console.log("find DATE TO & FROM & LIMIT: ", req.logDate)
      }).limit(req.lim)
    next();
  }
  
  else if (req.query.from && req.query.to && !req.query.limit) {
    Exercise.find({ date: {$gte: new Date(req.query.from),
      $lte: new Date(req.query.to)}}, (err, logDate) => {
        if (err) {return console.log("From/To", err)}
        //req.logDate = [...logDate].map(({ description, duration, date}) => {description, duration, date});
        req.logDate = []
        for (i of logDate) {
          var  { description, duration, date } =  i
          req.dateObj = { description: description, duration: duration, date: date.toDateString() }
          //console.log("REQ.ID: ", req.id, "logDate.ID: ", i.id)
          if (req.id.toString() === i.id.toString()) {
            req.logDate.push(req.dateObj)
          }
          
        }
        console.log("find DATE FROM & TO no LIMIT: ", req.logDate, "COUNT: ", logDate.length)
        //return req.logDate;
      })
    next();
  }

  else if (req.query.from && !req.query.to) {
    Exercise.find({ date: {$gte: new Date(req.query.from)}}, (err, logDate) => {
      if (err) {return console.log("From", err)}
        //req.logDate = [...logDate].map(({ description, duration, date}) => {description, duration, date});
        req.logDate = []
        for (i of logDate) {
          var  { description, duration, date } =  i
          req.dateObj = { description: description, duration: duration, date: date.toDateString() }
          if (req.id.toString() === i.id.toString()) {
            req.logDate.push(req.dateObj)
          }
        }
        console.log("find DATE FROM ONLY: ", req.logDate)

      }).limit(req.lim)

    next();
  }

  else if (!req.query.from && req.query.to) {
    Exercise.find({ date: {$gte: new Date(req.query.to)}}, (err, logDate) => {
      if (err) {return console.log("To", err)}
      //req.logDate = [...logDate].map(({ description, duration, date}) => {description, duration, date});
      req.logDate = []
      for (i of logDate) {
        var  { description, duration, date } =  i
        req.dateObj = { description: description, duration: duration, date: date.toDateString() }
        if (req.id.toString() === i.id.toString()) {
          req.logDate.push(req.dateObj)
        }
      }
      console.log("find DATE TO ONLY: ", req.logDate)
      //return req.logDate;
    }).limit(req.lim)/*.exec((err, logDate) => {
            if (err) {console.log("Get Logs error: ", err); res.json(err)}
            console.log("MiddleWARE LOG: ", logDate, req.lim, "REQ.URL: ", req.url)
            req.logDate = logDate;
            })*/
  next();
  }

  else if (!req.query.from && !req.query.to && req.query.limit) {
    Exercise.find({id: req.id}, (err, logDate) => {
      if (err) {return console.log("Limit Only", err)}
      //req.logDate = [...logDate].map(({ description, duration, date}) => {description, duration, date});
      req.logDate = []
      for (i of logDate) {
        var  { description, duration, date } =  i
        req.dateObj = { description: description, duration: duration, date: date.toDateString() }
        if (req.id.toString() === i.id.toString()) {
          req.logDate.push(req.dateObj)
        }
      }
      console.log("find DATE LIMIT ONLY: ", req.logDate)
      //return req.logDate;
    }).limit(req.lim)/*.exec((err, logDate) => {
            if (err) {console.log("Get Logs error: ", err); res.json(err)}
            console.log("MiddleWARE LOG: ", logDate, req.lim, "REQ.URL: ", req.url)
            req.logDate = logDate;
            })*/
  next();
  }

  else {
    Exercise.find({id: req.id}, (err, logDate) => {
      req.logDate = []
      for (i of logDate) {
        var  { description, duration, date } =  i
        req.dateObj = { description: description, duration: duration, date: date.toDateString() }
        if (req.id.toString() === i.id.toString()) {
          req.logDate.push(req.dateObj)
        }
      }
      console.log("find DATE ELSE ONLY: ", req.logDate)
    })
    next();
  }

}, (req, res, next) => {
  User.findById(req.id, (err, logData) => {
    console.log("LOGDATE: ", req.logDate, "logData: ", logData, "URL: ", req.url, "PATH: ", req.path)
    res.json({
      username: logData.username,
      _id: req.id,
    count: req.count,
    log: req.logDate
    //log: { description: req.logDate.description, duration: req.logDate.duration, date: new Date(req.logDate.date).toDateString() }
    })
    next();
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
  //log: [{
    id : {
      type: ObjectId,
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
  //}],
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
    type: ObjectId,
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
  


};

const findIdCreateAndSaveExercise = (infoAdded, done) => {

  User.findById(infoAdded._id, (err, userData) => {
    if (err) {return console.log('findIdCreateAndSaveExercise(): ',err)}
  




    //console.log('INOFADDED: ', infoAdded)
    const exercise = new Exercise({id: userData._id, description: infoAdded.description, duration: infoAdded.duration, date: Math.floor(new Date(infoAdded.date))})
    exercise.save(function(err, data) {
      if (err) {console.log("Save Logs Error: ", err)}
      console.log("EXERCISE DATA: ", data)
      var {_id, username} = userData
        //var exerciseObj = {_id: userData._id, username: userData.username, date: infoAdded.date.toDateString(), duration: infoAdded.duration, description: infoAdded.description}
        var exerciseObj = { _id: _id, username: username, date: infoAdded.date.toDateString(), duration: Number(infoAdded.duration), description: infoAdded.description }
        done(null, exerciseObj)
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

 

  var id = id = req.params._id;
  var { description, duration, date } = req.body;
  if (date === undefined || date === null || date === "") {
    date = new Date();
  } else {
    date = new Date(date);
  }
  //date = new Date(date).toDateString();
  req.exerciseObj = {_id: id, date: date, duration: duration, description: description  }
  //console.log("POST INFO: ",exerciseObj, " PATH: ", req.path, " PARAMS: ", req.params)
  findIdCreateAndSaveExercise(req.exerciseObj, (err, data) => {
    if (err) { console.log(err) }
    res.json(data);
    console.log("POST EXERCISE: ", data + " is saved in the db.")
    
    
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
