// required middleware packages
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

let urlDatabase = {
  "b2xVn2": {
    longUrl: "http://www.lighthouselabs.ca",
    userId: "user2RandomID"
  },
  "9sm5xK": {
    longUrl: "http://www.google.com",
    userId: "userRandomID"
  }
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
    password: "123"
  }
};

function generateRandomString() {
 return Math.random().toString(16).substring(8,2);
};



function checkUser(req, res, next) {
  if (req.path.match(/login|register/)) {
    next()
    return
  }
  //console.log(req.signedCookies);
  if (req.signedCookies) {
    const currentUser = req.signedCookies.user_id
    if (currentUser) {
      //console.log('User is logged in!', currentUser);
      req.currentUser = currentUser
      next()
    } else {
        res.redirect('/login');
    }

  } else {
      res.redirect('/login');
  }
};

app.use(cookieParser('this_is_the_longest_code_I_ever_wrote'))
app.use(checkUser)
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user : users[req.cookies["user_id"]]
  };
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
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();

  urlDatabase[shortURL] = {};

  urlDatabase[shortURL]["longUrl"] = req.body.longURL;
  urlDatabase[shortURL]["userId"] = req.signedCookies.user_id;

  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  let userId = req.signedCookies.user_id;
  let idTobeDeleted = req.params.id ;

  if(userId === urlDatabase[idTobeDeleted]["userId"]){
  delete urlDatabase[idTobeDeleted] ;
  res.redirect("/urls");
 }
});

app.post("/urls/:id/update", (req, res) => {
  let shortURL = req.params.id
  let userId = req.signedCookies.user_id;
  console.log("out ", urlDatabase);

  if(userId === urlDatabase[shortURL]["userId"]){
    urlDatabase[shortURL]["longUrl"] = req.body.longURL
    console.log("in ", urlDatabase);
    res.redirect("/urls");

  }

});

app.get("/login", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    user : users[req.signedCookies["user_id"]],
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_login" , templateVars);
});

app.post("/login", (req, res) => {

  const userEmail= req.body.email;
  const password = req.body.password;

  for(let uid in users ){
    if( users[uid]["email"] === userEmail ){

        if( users[uid]["password"] === password){
          res.cookie("user_id", users[uid], { signed: true })
          res.redirect("/");
        } else {
            res.status(403).send("Wrong Password");

          }
    return;
    }
  };


  res.status(403).send("Wrong Email");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id").redirect("/login");
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
    res.cookie("user_id", newEmailId, {signed: true} ).redirect("/urls");
  }
});



