// SET UP SERVER AND REQUIRES

const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 8080; // default port 8080
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["money"],
}));
app.set("view engine", "ejs");
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// VARIABLE & FUNCTIONS

const urlDatabase = {
  "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userid: "userRandomID",
        shortURL: 'b2xVn2'

      },
  "9sm5xK":{
        longURL: "http://www.google.com",
        userid: "user4RandomID",
        shortURL: '9sm5xK'
      },
  "8dw8a0":{
        longURL: "http://www.yahoo.com",
        userid: "user3RandomID",
        shortURL: '8dw8a0'
      }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("1234", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("4321", 10)
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: bcrypt.hashSync("abcd", 10)
  },
  "user4RandomID": {
    id: "user4RandomID",
    email: "user4@example.com",
    password: bcrypt.hashSync("fdsa", 10)
  }
};

//This function generates the tiny URL by randomly choosing values from an alphanumeric string.

function generateRandomString() {
 return Math.random().toString(16).replace(/\s/g,'').substring(8,2);
};

//This function checks which URLs a user has access to, and logs them to a local URL database

function urlsForUser(id) {
  let urls = [];
  let shortURLs = [];
  for(let i in urlDatabase) {
    if(urlDatabase[i].userid === id) {
      urls.push(urlDatabase[i].longURL);
      shortURLs.push(urlDatabase[i].shortURL);
    }
  }
  return [urls, shortURLs];
};

//      ROUTES

//      INDEX

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userCookie = req.session.user_id;
  let templateVars = {
    urls: urlsForUser(userCookie)[0],
    shortURLs: urlsForUser(userCookie)[1],
    user: users[userCookie]
  };
  res.render("urls_index", templateVars);
});

//      /URLS

app.get("/urls/new", (req, res) => {
  const userCookie = req.session.user_id;
  const templateVars = {
            user: users[userCookie]
        }
  if (userCookie) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let userID = req.session.user_id;
  urlDatabase[shortURL] = {
                longURL: req.body.longURL,
                userid: userID,
                shortURL: shortURL
  };
  res.redirect("/urls");
});

//       EDITING

app.get("/urls/:id", (req, res) => {
  let currentURL = urlDatabase[req.params.id];
   console.log(currentURL);

  let templateVars = {
        shortURLs: req.params.id,
        longURL: currentURL.longURL,
        user: users[req.session.user_id]
      };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let newURL = req.body.newURL
  urlDatabase[shortURL].longURL = newURL;
  res.redirect("/urls");
});

//       DELETING


app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id] ;
  res.redirect("/urls");
});

//       /u/:shortURL

//This allows the user to enter their tinyURL into the browser address bar,
// redirecting to the long-form URL.

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

//       REGISTRATION

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  }
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
    let randID = generateRandomString();
    if(req.body.email === '' || req.body.password === '') {
      res.redirect(400, "/register")
    } else {
      users[randID] = {
          id: randID,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 10)
      }
      req.session.user_id = randID;
      res.redirect("/urls");
    }
});

//       LOGIN


app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  }
  res.render("urls_login", templateVars);
});

app.post('/login', (req, res) => {
  if(req.body.email === '' || req.body.password === '') {
    res.redirect(400, "/login")
  } else {
    for(let i in users) {
      if (users[i].email === req.body.email) {
        if (bcrypt.compareSync(req.body.password, users[i].password)) {
          req.session.user_id = users[i].id;
          return res.redirect("/urls");
        }
      res.status(403).send("Wrong Email");
      }
    }
  }
  res.status(403).send("Wrong Password").redirect("/register");
});


//       LOGOUT - CLEAR COOKIES

app.post("/logout", (req, res) => {
    req.session = null;
  res.redirect('/urls')
});

