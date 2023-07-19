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
const { ObjectId } = require('mongoose').Types;
const PDFDocument = require('pdfkit');
const fs = require('fs');

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
    googleDisplayName: String,
    bookedFlights: [{
      flight: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
      },
      name: String,
      mobile: String,
      passportNumber: String,
      email: String,
      departure: String,
      arrival: String,
      departureDate: Date,
    }],
    transactions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    }],
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
  

  // Define the schedule schema
const scheduleSchema = new mongoose.Schema({
    departureDate: {
      type: Date,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalDate: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
  });
  
  // Define the flight schema
  const flightSchema = new mongoose.Schema({
    flightID: {
      type: String,
      required: true,
      unique: true,
    },
    departure: {
      type: String,
      required: true,
    },
    arrival: {
      type: String,
      required: true,
    },
    maxCapacity: {
      type: Number,
      required: true,
    },
    currentStatus: {
      type: String,
      enum: ['Available', 'Sold Out'],
      default: 'Available',
    },
    schedule: [scheduleSchema], // Embed the schedule schema
  });
  
  // Create the Flight model
  const Flight = mongoose.model('Flight', flightSchema);

  const transactionSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  });
  
  // Create the Transaction model
  const Transaction = mongoose.model('Transaction', transactionSchema);
  
  
  // Example code to create and store flight information
  const flight1 = new Flight({
    flightID: 'FL001',
    departure: 'London',
    arrival: 'Hogwarts Castle',
    maxCapacity: 100,
    schedule: [
      {
        departureDate: new Date('2023-07-15'),
        departureTime: '10:00 AM',
        arrivalDate: new Date('2023-07-15'),
        arrivalTime: '12:00 PM',
        availableSeats: 100,
      },
    ],
  });
  
  const flight2 = new Flight({
    flightID: 'FL002',
    departure: 'Paris',
    arrival: 'Diagon Valley',
    maxCapacity: 150,
    schedule: [
      {
        departureDate: new Date('2023-07-16'),
        departureTime: '11:00 AM',
        arrivalDate: new Date('2023-07-16'),
        arrivalTime: '2:00 PM',
        availableSeats: 150,
      },
    ],
  });
  
  // Save the flights to the database
//   flight1.save()
//     .then(() => console.log('Flight 1 saved successfully'))
//     .catch((err) => console.error('Error saving Flight 1:', err));
  
//   flight2.save()
//     .then(() => console.log('Flight 2 saved successfully'))
//     .catch((err) => console.error('Error saving Flight 2:', err));


  
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
    const message="";
    res.render("login",{message : message, user : req.user});
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
        passport.authenticate("local", function(err, user, info) {
          if (err) {
            console.log(err);
            res.redirect("/login");
          } else if (!user) {
            const message = "Invalid Credentials";
            res.render("login", { message: message, user : req.user });
          } else {
            req.logIn(user, function(err) {
              if (err) {
                console.log(err);
                res.redirect("/login");
              } else {
                const message = "";
                res.redirect("/");
              }
            });
          }
        })(req, res);
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


//Route for checking all flights schedule.

app.get('/allflights', function(req, res) {
    Flight.find({})
      .exec()
      .then((allFlights) => {
        res.render('allflights', { allFlights: allFlights, user : req.user });
      })
      .catch((err) => {
        console.error('Error retrieving flights:', err);
        res.redirect('/');
      });
  });
  
  app.get('/allflights/:flightId', function(req, res) {
    const flightId = req.params.flightId;
  
    Flight.findById(flightId)
      .exec()
      .then((flight) => {
        if (flight) {
          res.render('flight', { flight: flight, user : req.user });
        } else {
          console.log('Flight not found');
          res.redirect('/allflights');
        }
      })
      .catch((err) => {
        console.error('Error retrieving flight:', err);
        res.redirect('/allflights');
      });
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


app.get("/newflight",function(req,res){
    res.render("newflight",{user : req.user});
});  


// Route for adding a new flight (admin only)
app.post("/newflight", isAuthenticated, function(req, res) {
    const flightID = req.body.flightID;
    const departure = req.body.departure;
    const arrival = req.body.arrival;
    const maxCapacity = req.body.maxCapacity;
    const departureDate = req.body.departureDate;
    const departureTime = req.body.departureTime;
    const arrivalDate = req.body.arrivalDate;
    const arrivalTime = req.body.arrivalTime;
    const availableSeats = req.body.availableSeats;
  
    // Create a new flight object
    const newFlight = new Flight({
      flightID: flightID,
      departure: departure,
      arrival: arrival,
      maxCapacity: maxCapacity,
      schedule: [
        {
          departureDate: departureDate,
          departureTime: departureTime,
          arrivalDate: arrivalDate,
          arrivalTime: arrivalTime,
          availableSeats: availableSeats,
        },
      ],
    });
  
    // Save the new flight to the database
    newFlight.save()
      .then(() => {
        console.log("New flight added successfully");
        res.redirect("/allflights");
      })
      .catch((err) => {
        console.error("Error adding new flight:", err);
        res.redirect("/allflights");
      });
  });
    



app.get("/allflights/:flightID/edit", isAuthenticated, function(req, res) {
  const flightID = req.params.flightID;

  Flight.findOne({ _id: flightID })
    .exec()
    .then((foundFlight) => {
      if (foundFlight) {
        res.render("editflight", { foundFlight: foundFlight, user: req.user });
      } else {
        console.log("Flight not found");
        res.redirect("/");
      }
    })
    .catch((err) => {
      console.log(`Error Occurred: ${err}`);
      res.redirect("/");
    });
});

app.post("/allflights/:flightID/edit", isAuthenticated, function (req, res) {
    const flightID = req.params.flightID;
    const updatedDeparture = req.body.departure;
    const updatedArrival = req.body.arrival;
    const updatedMaxCapacity = req.body.maxCapacity; // Updated this line
    const updatedDepartureDate = req.body.departureDate;
    const updatedDepartureTime = req.body.departureTime;
    const updatedArrivalDate = req.body.arrivalDate;
    const updatedArrivalTime = req.body.arrivalTime;
    const updatedAvailableSeats = req.body.availableSeats;
  
    const update = {
      departure: updatedDeparture,
      arrival: updatedArrival,
      maxCapacity: updatedMaxCapacity,
      schedule: [
        {
      departureDate: updatedDepartureDate,
      departureTime : updatedDepartureTime,
      arrivalDate : updatedArrivalDate,
      arrivalTime :  updatedArrivalTime,
      availableSeats : parseInt(updatedAvailableSeats)
        },
    ]
    };
  
    Flight.findByIdAndUpdate(flightID, update, { new: true })
      .then((updatedFlight) => {
        if (updatedFlight) {
          res.redirect(`/allflights/${flightID}`);
        } else {
          console.log("Flight not found");
          res.redirect("/");
        }
      })
      .catch((err) => {
        console.log(`Error Occurred: ${err}`);
        res.redirect("/");
      });
  });


// Delete Post
app.post("/allflights/:flightID/delete", isAuthenticated, function(req, res) {
  const flightID = req.params.flightID;

  Flight.findByIdAndRemove(flightID)
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(`Error Occurred: ${err}`);
      res.redirect("/");
    });
});


// app.post("/allflights/search", async function(req, res) {
//   try {
//     const departure = req.body.departure;
//     const arrival = req.body.arrival;
//     const departureDate = req.body.departureDate;
//     const adults = parseInt(req.body.adults);
//     const children = parseInt(req.body.children);
//     const totalPassengers = adults + children;
//     const returnDate = req.body.returnDate;
//     const tripType = req.body.tripType;

//     var count = req.body.count;
//     var newDepartureArray = [];
//     var newArrivalArray = [];
//     var newDepartureDateArray = [];
//     var moreFlightsArray = [];
//     for (var i = 0; i < count; i++) {
//       const newDepartureDate = req.body[`newDepartureDate${i}`];
//       const newArrival = req.body[`newArrival${i}`];
//       const newDeparture = req.body[`newDeparture${i}`];

//       newDepartureArray.push(newDeparture);
//       newDepartureDateArray.push(newDepartureDate);
//       newArrivalArray.push(newArrival);
//     }

//     const firstFlight = await Flight.findOne({ departure: departure, arrival: arrival, departureDate: departureDate });

//     const moreFlightsPromises = [];
//     for (let i = 0; i < count; i++) {
//       const moreFlightPromise = Flight.findOne({ departure: newDepartureArray[i], arrival: newArrivalArray[i], departureDate: newDepartureDateArray[i] });
//       moreFlightsPromises.push(moreFlightPromise);
//     }

//     const moreFlights = await Promise.all(moreFlightsPromises);

//     const departureToArrivalFlights = await Flight.find({
//       departure: departure,
//       arrival: arrival,
//       "schedule.departureDate": departureDate,
//       "schedule.availableSeats": { $gte: totalPassengers }
//     });

//     const returnFlights = await Flight.find({
//       departure: arrival,
//       arrival: departure,
//       "schedule.departureDate": returnDate,
//       "schedule.availableSeats": { $gte: totalPassengers }
//     });

//     res.render("flightsearch", {
//       departureToArrivalFlights: departureToArrivalFlights,
//       returnFlights: returnFlights,
//       moreFlights: moreFlights,
//       user: req.user,
//       firstFlight: firstFlight
//     });
//   } catch (err) {
//     console.log(err);
//     res.redirect("/");
//   }
// });




app.post("/allflights/search", async function(req, res) {
  try {
    const departure = req.body.departure;
    const arrival = req.body.arrival;
    const departureDate = req.body.departureDate;
    const adults = parseInt(req.body.adults);
    const children = parseInt(req.body.children);
    const totalPassengers = adults + children;
    const returnDate = req.body.returnDate;

    const departureToArrivalFlights = await Flight.find({
      departure: departure,
      arrival: arrival,
      "schedule.departureDate": departureDate,
      "schedule.availableSeats": { $gte: totalPassengers }
    });

    const returnFlights = await Flight.find({
      departure: arrival,
      arrival: departure,
      "schedule.departureDate": returnDate,
      "schedule.availableSeats": { $gte: totalPassengers }
    });

    res.render("flightsearch", {
      departureToArrivalFlights: departureToArrivalFlights,
      returnFlights: returnFlights,
      user: req.user
    });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
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


  app.get("/allflights/:flightId/bookflight", isAuthenticated, async function(req, res) {
    try {
      const flightId = req.params.flightId;
      const flight = await Flight.findById(flightId);
  
      res.render("bookflight", { flightId: flightId, user: req.user, availableSeats: flight.schedule[0].availableSeats });
    } catch (err) {
      console.log(err);
      res.redirect("/allflights");
    }
  });
  
  app.post("/allflights/:flightId/bookflight", isAuthenticated, async function(req, res) {
    try {
      const flightId = req.params.flightId;
      const { Name, mobile, passportNumber, email } = req.body;
  
      const flight = await Flight.findById(flightId);
  
      if (flight.schedule[0].availableSeats > 0) {
        const booking = {
          flight: flight._id,
          departure: flight.departure,
          arrival: flight.arrival,
          departureDate: flight.schedule[0].departureDate,
          name: Name,
          mobile: mobile,
          passportNumber: passportNumber,
          email: email,
        };
  
        await User.findByIdAndUpdate(req.user._id, { $push: { bookedFlights: booking } });
        flight.schedule[0].availableSeats -= 1;
        await flight.save();
  
        console.log("Flight booked successfully");

       // Generate PDF ticket
      const doc = new PDFDocument();
      const ticketPath = `ticket for ${booking.departure+" to "+booking.arrival}.pdf`;
      const stream = fs.createWriteStream(ticketPath);

      doc.pipe(stream);
      doc.fontSize(12).text(`Name: ${booking.name}`);
      doc.fontSize(12).text(`Passport Number: ${booking.passportNumber}`);
      doc.fontSize(12).text(`Mobile Number: ${booking.mobile}`);
      doc.fontSize(12).text(`Email Address: ${booking.email}`);
      doc.end();

      // Set the ticketPath in the bookedFlight object
      booking.ticketPath = ticketPath;
      await User.findOneAndUpdate(
        { _id: req.user._id, "bookedFlights.flight": booking.flight },
        { $set: { "bookedFlights.$.ticketPath": ticketPath } }
      );

      // Trigger the download of the PDF ticket
      res.setHeader('Content-disposition', `attachment; filename=${ticketPath}`);
      res.setHeader('Content-type', 'application/pdf');
      fs.createReadStream(ticketPath).pipe(res);

      } else {
        console.log("No available seats for the selected flight");
      }
    } catch (err) {
      console.log(err);
    }
    res.redirect("/allflights/" + req.params.flightId);
  });
  
  //Route for cancelling the booked flight.

app.post("/allflights/:flightId/cancelbooking/:bookingId", isAuthenticated, async function(req, res) {
  try {
    const flightId = req.params.flightId;
    const bookingId = req.params.bookingId;

    const flight = await Flight.findById(flightId);
    // Remove the booking from the user's bookedFlights array
    await User.findByIdAndUpdate(req.user._id, { $pull: { bookedFlights: { _id: bookingId } } });

    // Increase the available seats for the canceled flight

        flight.schedule[0].availableSeats += 1;
        await flight.save();


    console.log("Flight canceled successfully");
    
    res.redirect(`/allflights/${flightId}`);
  } catch (err) {
    console.log(err);
   
    res.redirect(`/allflights`);
  }
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



