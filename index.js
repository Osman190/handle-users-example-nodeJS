require("dotenv").config();
var uuidv4 = require("uuid/v4");
var express = require("express");
var app = express();
var fs = require("fs");

app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static("public"));

app.get("/", function(req, res) {
  res.render("index", { title: "Happy User", message: "Hello there!" });
});

app.get("/users", (req, res) => {
  console.log("Route /confirmed users");
  var filesArray = fs.readdirSync("./users");
  console.log(filesArray);
  var confirmedUsers = [];
  filesArray.forEach(file => {
    var readingFile = fs.readFileSync(`./users/${file}`);
    var user = JSON.parse(readingFile);
    if (user.status !== "unconfirmed") {
      confirmedUsers.push(user);
    }
  });
  console.log(confirmedUsers);
  res.render("listUserConfirmed", {
    users: confirmedUsers
  });
});

app.get("/admin", function(req, res) {
  console.log("Route /admin");
  var allUsers = fs.readdirSync("./users");
  var allList = [];
  allUsers.forEach(file => {
    var readingFile = fs.readFileSync(`./users/${file}`);
    var user = JSON.parse(readingFile);
    console.log(user.email);
    allList.push(user);
  });
  res.render("allUsers", {
    userList: allList
  });
});

app.get("/user/create", (req, res) => {
  var id = uuidv4();
  var obj = {
    uuid: id, //every user should become a uuid. https://www.npmjs.com/package/uuid
    email: req.query.email, //from form
    pw: req.query.pw, //from form
    status: "unconfirmed", //default value unconfirmed, every register is first unconfirmed
    session: true //depending on the RememberMe checkbox
  };
  fs.writeFile(`./users/${id}.json`, JSON.stringify(obj), function(err) {
    if (err) {
      return console.log(err);
    }
    console.log("ths file was saved");
    res.redirect("/");
    console.log(req.query);
  });
});

app.get("/user/verify/:token", (req, res) => {
  console.log(req.params.token);
  //open your files folder fs.readDir
  fs.readFile(`./users/${req.params.token}.json`, (err, file) => {
    if (err) console.log("Error", err);
    else {
      var file = JSON.parse(file);
      //set that document status to confirmed
      if (file.uuid === req.params.token) {
        console.log("current file uuid:", file.uuid);
        file.status = "confirmed";
        //write file back
        fs.writeFile(`./users/${req.params.token}.json`, JSON.stringify(file), err => {
          if (err) {
            return console.log(err);
          }
          console.log("The Email was confirmed!");
          //redirect to /
          res.redirect("/");
        });
      }
    }
  });
});
app.listen(4000, () => console.log("Example app listening on port 4000!"));
