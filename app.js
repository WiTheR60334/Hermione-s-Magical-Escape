require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const nodemailer = require("nodemailer");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

mongoose.connect("mongodb+srv://adminharrypotter:"+process.env.PASSWORD+"@cluster2.d4dgox6.mongodb.net/destinationsDB", { useNewUrlParser: true, useUnifiedTopology: true });

const destinationSchema = new mongoose.Schema({
    title: String,
    firstPara : String,
    firstImg : String,
    content: String,
    imagesURL: [String]
});

const Destination = mongoose.model("Destination", destinationSchema);

const destination1 = new Destination({
    title : "Hogwarts Castle",
    firstPara :"The Hogwarts castle is a wondrous structure built by wizard Gandalf and his friends in 2079 at the site of Dumb Pit, an ancient burial ground located on the edge of the world.",
    firstImg : "https://wallpaperaccess.com/full/562430.jpg",
    content : "Hogwarts Castle is a magnificent and iconic structure that serves as the primary setting for the Harry Potter series by J.K. Rowling. It is a grand and ancient castle located in the Scottish Highlands and is renowned as the school of witchcraft and wizardry, Hogwarts School of Witchcraft and Wizardry. Hogwarts Castle is a magnificent and iconic structure that serves as the primary setting for the Harry Potter series by J.K. Rowling. It is a grand and ancient castle located in the Scottish Highlands and is renowned as the school of witchcraft and wizardry, Hogwarts School of Witchcraft and Wizardry.",
    imagesURL : ["https://wallpaperaccess.com/full/1225564.jpg"]
});

// destination1.save()
// .then(()=>{
//     console.log("Destination1 saved Successfully!");
// })
// .catch((err)=>{
//     console.error(`Error while saving the data ${err}`);
// });

const usersSchema = new mongoose.Schema({
    name : String,
    username: String,
    password: String,
    role: {
      type: String,
      default: "user"
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }],
    googleId: String,
    googleDisplayName: String
  });
  
  usersSchema.plugin(passportLocalMongoose);
  
  const User = mongoose.model("User", usersSchema);
  
  // Configure passport
  passport.use(User.createStrategy());
  passport.serializeUser(function(user, done){
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done){
    User.findById(id)
  .then(user => {
    done(null, user);
  })
  .catch(err => {
    done(err);
  });
  
  });
  
  passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOne({ googleId: profile.id })
      .exec()
      .then((user) => {
        if (!user) {
          const newUser = new User({
            googleId: profile.id,
            googleDisplayName: profile.displayName,
            favorites: []
          });
          return newUser.save();
        } else {
          return user;
        }
      })
      .then((user) => {
        return cb(null, user);
      })
      .catch((err) => {
        return cb(err);
      });
  }
  ));
  
  
  app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile"] })
  );
  
  app.get("/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
      res.redirect("/");
    }
  );
  

app.get("/", function(req, res) {
    Destination.find({})
    .limit(6)
    .exec()
    .then((foundDestinations)=>{
        res.render("home",{destinations : foundDestinations, user:req.user});
    })
    .catch((err)=>{
        console.log(err);
    });
});

// User Sign Up
app.get("/signup", function(req, res) {
    res.render("signup", { user: req.user });
  });

app.get("/signup.html", function(req, res) {
    res.render("signup", { user: req.user });
});  
  
  app.post("/signup", function(req, res) {
    const { name, username, password } = req.body;
    const newUser = new User({ name, username });
  
    User.register(newUser, password, function(err, user) {
      if (err) {
        console.log(err);
        res.redirect("/signup");
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/");
        });
      }
    });
  });
  
  // User Sign In
  app.get("/login", function(req, res) {
    res.render("login", { user:req.user });
  });
  
  app.post("/login", function(req, res) {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
  
    req.login(user, function(err) {
      if (err) {
        console.log(err);
        res.redirect("/login");
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/");
        });
      }
    });
  });
  
  // User Authentication Middleware
  function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  }
  
  // Logout
  app.get("/logout", isAuthenticated, function(req, res) {
    req.logOut(function(err){
      if(err){
          console.log(err);
          res.redirect("/");
      }
      else{
          res.redirect("/login");
      }
  });
  });

  app.get("/createadmin", async function(req, res) {
    try {
      const existingAdmin = await User.findOne({name : "Admin", username: process.env.ADMIN_USERNAME });
  
      if (!existingAdmin) {
        User.register(new User({
            name : "Admin",
          username: process.env.ADMIN_USERNAME,
          role: "admin"
        }), process.env.ADMIN_PASSWORD, function(err, admin) {
          if (err) {
            console.log(err);
            res.redirect("/");
          } else {
            console.log("Admin account created");
            res.redirect("/");
          }
        });
      } else {
        console.log("Admin account already exists");
        res.redirect("/");
      }
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  });

app.get("/alldestinations",function(req,res){
    Destination.find({})
    .exec()
    .then((foundDestinations)=>{
        res.render("alldestinations",{destinations : foundDestinations, user:req.user});
    })
    .catch((err)=>{
        console.log(err);
    });
});

app.get("/alldestinations/:destinationId",function(req,res){
    const id= req.params.destinationId;

    Destination.findById(id)
    .then((foundDestination)=>{
        res.render("destination",{destination : foundDestination, user:req.user});
    })
    .catch((err)=>{
        console.log(err);
    });
});



app.get("/newdestination",function(req,res){
    res.render("newdestination", {user:req.user});
});

app.post("/newdestination",function(req,res){
    const newTitle = req.body.destinationTitle;
    const newFirstPara = req.body.destinationFirstPara;
    const newFirstImg = req.body.firstImageLink;
    const newContent = req.body.destinationBody;
    const newImage = req.body.imageLink;

    const newDestination = new Destination({
        title : newTitle,
        firstPara : newFirstPara,
        firstImg : newFirstImg,
        content: newContent
    });
    
    if (newImage) {
        newDestination.imagesURL = [req.body.imageLink];
      }
    newDestination.save();
    res.redirect("/alldestinations");
});

// GET route for searching
// GET route for searching
app.get("/search/:title", function(req, res) {
    const searchedTitle = req.params.title;
    const lowercaseSearchTitle = _.lowerCase(searchedTitle);
  
    Destination.find({ title: { $regex: `.*${searchedTitle}.*`, $options: 'i' } })
      .then((destinations) => {
        if (destinations.length > 0) {
          res.render("search", { searchResults: destinations, user: req.user, message : "" });
        } else {
          res.render("search", { searchResults: [], user: req.user, message : "Nothing Found" });
        }
      })
      .catch((err) => {
        console.error('Something went wrong', err);
        res.render("search", { searchResults: [], user: req.user });
      });
  });
  
  
  // POST route for form submission
  app.post("/search", function(req, res) {
    const searchQuery = req.body.searchTerm;
    res.redirect("/search/"+searchQuery);
  });

app.get("/alldestinations/:destinationId/edit", isAuthenticated, function(req, res) {
  const destinationID = req.params.destinationId;

  Destination.findOne({ _id: destinationID })
    .exec()
    .then((foundDestination) => {
      if (foundDestination) {
        res.render("edit", { foundDestination: foundDestination, user: req.user });
      } else {
        console.log("Destination not found");
        res.redirect("/");
      }
    })
    .catch((err) => {
      console.log(`Error Occurred: ${err}`);
      res.redirect("/");
    });
});

app.post("/alldestinations/:destinationId/edit", isAuthenticated, function (req, res) {
    const destinationID = req.params.destinationId;
    const updatedTitle = req.body.updatedTitle;
    const updatedFirstPara = req.body.updatedFirstPara;
    const updatedFirstImg = req.body.firstImg; // Updated this line
    const updatedContent = req.body.updatedContent;
    const imagesURL = req.body.imagesURL;
  
    const update = {
      title: updatedTitle,
      content: updatedContent,
      firstPara: updatedFirstPara,
      firstImg: updatedFirstImg, // Updated this line
    };
    if (imagesURL) {
      update.$addToSet = { imagesURL: imagesURL }; // Add the imageURL to the images array
    }
  
    Destination.findByIdAndUpdate(destinationID, update, { new: true })
      .then((updatedDestination) => {
        if (updatedDestination) {
          res.redirect(`/alldestinations/${destinationID}`);
        } else {
          console.log("Destination not found");
          res.redirect("/");
        }
      })
      .catch((err) => {
        console.log(`Error Occurred: ${err}`);
        res.redirect("/");
      });
  });


// Delete Post
app.post("/alldestinations/:destinationId/delete", isAuthenticated, function(req, res) {
  const destinationID = req.params.destinationId;

  Destination.findByIdAndRemove(destinationID)
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(`Error Occurred: ${err}`);
      res.redirect("/");
    });
});




// Remove Image from Post
// Remove Image from Post
app.post("/alldestinations/:destinationId/delete-image", isAuthenticated, function(req, res) {
    const destinationID = req.params.destinationId;
    const imagesURL = req.body.imagesURL;
  
    Destination.findByIdAndUpdate(
      destinationID,
      { $pull: { imagesURL: imagesURL } }, // Remove the imageURL from the images array
      { new: true }
    )
      .then((updatedDestination) => {
        if (updatedDestination) {
          res.redirect(`/alldestinations/${destinationID}/edit`);
        } else {
          console.log("Destination not found");
          res.redirect("/");
        }
      })
      .catch((err) => {
        console.log(`Error Occurred: ${err}`);
        res.redirect("/");
      });
  });

app.get("/about", function(req, res) {
    res.render("about", {user:req.user});
});

app.get("/services", function(req, res) {
    res.render("services",{user:req.user});
});

app.get("/contact",function(req,res){
    res.render("contact", {user:req.user});
});


app.listen(3000, function() {
    console.log("Server started on port 3000");
});



