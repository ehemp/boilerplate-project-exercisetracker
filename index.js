const express = require("express");
const app = express();
const cors = require("cors");
const req = require("express/lib/request");
const bodyParser = require("body-parser");
var mongoose = require("mongoose");
const { type } = require("express/lib/response");
const { Int32, ObjectId } = require("mongodb");
const connectStr =
  "mongodb+srv://ehempfling:4clJYTNDrbN48Gfe@cluster0.dyaznbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(connectStr, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

let User;
let Exercise;
let Logs;
const userSchema = new mongoose.Schema(
  {
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
    },
  },
  { versionKey: false },
);

const exerciseSchema = new mongoose.Schema(
  {
    id: {
      type: ObjectId,
    },
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
    },
    //}],
  },
  { versionKey: false },
);

const logSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    count: {
      type: Number,
    },
    _id: {
      type: ObjectId,
    },
    log: [
      {
        _id: false,
        description: {
          type: String,
        },
        duration: {
          type: Number,
        },
        date: {
          type: Date,
        },
      },
    ],
  },
  { versionKey: false },
);

User = mongoose.model("User", userSchema);
Exercise = mongoose.model("Exercise", exerciseSchema);
Logs = mongoose.model("Logs", logSchema);

const createAndSaveUser = (userAdded, done) => {
  const user = new User({ username: userAdded });
  console.log("createandSave: " + user);
  user.save(function (err, data) {
    if (err) {
      return console.error(err);
    } else {
      done(null, data);
    }
  });
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users/:_id/exercises", (req, res) => {
  var id = (id = req.params._id);
  var { description, duration, date } = req.body;

  User.findById(id.toString(), (err, data) => {
    if (date === undefined || date === null || date === "") {
      date = new Date();
    } else {
      date = new Date(date);
    }
    console.log("DATA: ", data);
    const exercise = new Exercise({
      id: id,
      username: data.username,
      description: description,
      duration: duration,
      date: date,
    });
    exercise.save(function (err, data) {
      if (err) {
        console.log("Save Logs Error: ", err);
      }

      var { id, username, date, duration, description } = data;

      req.exerciseObj2 = {
        _id: id,
        username: username,
        date: date.toDateString(),
        duration: Number(duration),
        description: description,
      };
      console.log("EXERCISE DATA: ", req.exerciseObj2);
      try {
        res.json(req.exerciseObj2);
      } catch (err) {
        console.log("Error: ", err);
      }
    });
  });
});

/*app.get("/api/users/:_id/exercises", (req, res) => {
  console.log("REQ.EXERCISEOBJ: ", req.exerciseObj2);
});*/

app.route("/api/users").post((req, res) => {
  var { username } = req.body;
  createAndSaveUser(username, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.log(data + " is saved in the db.");
    const showUser = { username: data.username, _id: data._id };
    res.json(showUser);
  });
});

app.get("/api/users", (req, res) => {
  const getAllUsers = User.find({}, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      res.json(result);
    }
  });
});

app.get(
  "/api/users/:_id/logs",
  (req, res, next) => {
    console.log(req.query);
    req.id = req.params._id;
    req.lim = parseInt(req.query.limit);
    Exercise.find({ id: req.id }, (err, dataId) => {
      //console.log("FIND FULL EXERCISE: ", dataId)
      req.count = dataId.length;
    });
    if (req.query.from && req.query.to && req.query.limit) {
      Exercise.find({ id: req.id.toString() })
        .find(
          {
            date: {
              $gte: Math.floor(new Date(req.query.from)),
              $lte: Math.floor(new Date(req.query.to)),
            },
          },
          (err, logDate) => {
            if (err) {
              return console.log("From/To", err);
            }
            console.log("LOGDATE: ", logDate);
            req.logDate = [];
            for (i of logDate) {
              var { description, duration, date } = i;
              req.dateObj = {
                description: description,
                duration: duration,
                date: date.toDateString(),
              };
              if (req.id.toString() === i.id.toString()) {
                req.logDate.push(req.dateObj);
              }
            }
            console.log("find DATE TO & FROM & LIMIT: ", req.logDate);
          },
        )
        .limit(req.lim);
      next();
    } else if (req.query.from && req.query.to && !req.query.limit) {
      Exercise.find({ id: req.id.toString() }).find(
        {
          date: {
            $gte: new Date(req.query.from),
            $lte: new Date(req.query.to),
          },
        },
        (err, logDate) => {
          if (err) {
            return console.log("From/To", err);
          }
          //req.logDate = [...logDate].map(({ description, duration, date}) => {description, duration, date});
          req.logDate = [];
          for (i of logDate) {
            var { description, duration, date } = i;
            req.dateObj = {
              description: description,
              duration: duration,
              date: date.toDateString(),
            };
            //console.log("REQ.ID: ", req.id, "logDate.ID: ", i.id)
            if (req.id.toString() === i.id.toString()) {
              req.logDate.push(req.dateObj);
            }
          }
          console.log(
            "find DATE FROM & TO no LIMIT: ",
            req.logDate,
            "COUNT: ",
            logDate.length,
          );
          //return req.logDate;
        },
      );
      next();
    } else if (req.query.from && !req.query.to) {
      Exercise.find(
        { date: { $gte: new Date(req.query.from) } },
        (err, logDate) => {
          if (err) {
            return console.log("From", err);
          }
          //req.logDate = [...logDate].map(({ description, duration, date}) => {description, duration, date});
          req.logDate = [];
          for (i of logDate) {
            var { description, duration, date } = i;
            req.dateObj = {
              description: description,
              duration: duration,
              date: date.toDateString(),
            };
            if (req.id.toString() === i.id.toString()) {
              req.logDate.push(req.dateObj);
            }
          }
          console.log("find DATE FROM ONLY: ", req.logDate);
        },
      ).limit(req.lim);

      next();
    } else if (!req.query.from && req.query.to) {
      Exercise.find(
        { date: { $gte: new Date(req.query.to) } },
        (err, logDate) => {
          if (err) {
            return console.log("To", err);
          }
          //req.logDate = [...logDate].map(({ description, duration, date}) => {description, duration, date});
          req.logDate = [];
          for (i of logDate) {
            var { description, duration, date } = i;
            req.dateObj = {
              description: description,
              duration: duration,
              date: date.toDateString(),
            };
            if (req.id.toString() === i.id.toString()) {
              req.logDate.push(req.dateObj);
            }
          }
          console.log("find DATE TO ONLY: ", req.logDate);
          //return req.logDate;
        },
      ).limit(req.lim);
      next();
    } else if (!req.query.from && !req.query.to && req.query.limit) {
      Exercise.find({ id: req.id }, (err, logDate) => {
        if (err) {
          return console.log("Limit Only", err);
        }
        //req.logDate = [...logDate].map(({ description, duration, date}) => {description, duration, date});
        req.logDate = [];
        for (i of logDate) {
          var { description, duration, date } = i;
          req.dateObj = {
            description: description,
            duration: parseInt(duration),
            date: date.toDateString(),
          };
          if (req.id.toString() === i.id.toString()) {
            req.logDate.push(req.dateObj);
          }
        }
        console.log("find DATE LIMIT ONLY: ", req.logDate);
        //return req.logDate;
      }).limit(req.lim);

      next();
    } else {
      Exercise.find({ id: req.id }, (err, logDate) => {
        req.logDate = [];
        for (i of logDate) {
          var { description, duration, date } = i;
          req.dateObj = {
            description: description,
            duration: duration,
            date: date.toDateString(),
          };
          if (req.id.toString() === i.id.toString()) {
            req.logDate.push(req.dateObj);
          }
        }
        console.log("find DATE ELSE ONLY: ", req.logDate);
      });
      next();
    }
  },
  (req, res, next) => {
    User.findById(req.id, (err, logData) => {
      console.log(
        "LOGDATE: ",
        req.logDate,
        "logData: ",
        logData,
        "COUNT: ",
        req.count,
        "URL: ",
        req.url,
        "PATH: ",
        req.path,
      );

      if (req.logDate) {
        res.json({
          username: logData.username,
          _id: req.id,
          count: req.count,
          log: req.logDate,
        });
      } else {
        next();
      }
    });
  },
);

const listener = app.listen(process.env.PORT || 3001, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
