// required middleware packages
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "dishwasher-funk"
  },
  "user4RandomID": {
    id: "user4RandomID",
    email: "user4@example.com",
    password: "dishwasher-funk"
  }
};

function generateRandomString() {
 return Math.random().toString(16).substring(8,2);
};



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user : users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls : urlDatabase,
    user : users[req.cookies["user_id"]]
   };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    user : users[req.cookies["user_id"]],
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
      urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  let idTobeDeleted = req.params.id ;
  delete urlDatabase[idTobeDeleted] ;
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  let shortURL = req.params.id
      urlDatabase[shortURL] = req.body.longURL // reasign longURL to it id/shortURL/
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    user : users[req.cookies["user_id"]],
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {

  const userEmail= req.body.email
  const password = req.body.password

  for(let uid in users ){
    if( users[uid]["email"] === userEmail ){
      if( users[uid]["password"] === password){
        res.cookie("user_id", users[uid]).redirect("/");
      }else {
        res.send("Wrong Password").status(403);
      }
    }else {
      res.send("Wrong Email").status(403);
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("username").redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("urls_registration");
});

app.post("/register", (req, res) => {
  if(!req.body.email && !req.body.password){
    res.status(400);
  }else {
    let newEmailId = generateRandomString();
    users[newEmailId] = {

      "id" : newEmailId,
      "email" : req.body.email,
      "password" : req.body.password

    };
    res.cookie("user_id", newEmailId).redirect("/urls");
  }
});
