let navbar=document.querySelector('.header .navbar');

document.querySelector('#menu-btn').onclick = () => {
    navbar.classList.toggle('active');
}

document.querySelectorAll('.about .video-container .controls .control-btn').forEach(btn => {
    btn.onclick = () => {
        let src = btn.getAttribute('data-src');
        document.querySelector('.about .video-container .video').src =src;
    }
})

/*
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

*/