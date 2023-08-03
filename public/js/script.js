// let navbar=document.querySelector('.header .navbar');

// document.querySelector('#menu-btn').onclick = () => {
//     navbar.classList.toggle('active');
// }

// document.querySelectorAll('.about .video-container .controls .control-btn').forEach(btn => {
//     btn.onclick = () => {
//         let src = btn.getAttribute('data-src');
//         document.querySelector('.about .video-container .video').src =src;
//     }
// })

// document.getElementById("logoutbtn").addEventListener("click", function(event) {
//   event.preventDefault();
//   // console.log('button clicked')
//   window.location.href = "index.html";
//   // document.querySelector('#logout-btn').onclick = () => {
//   //     document.querySelector('.logout').classList.toggle('active');
//   }
// );

// document.getElementById("logout-btn").addEventListener("click", function(event) {
//   event.preventDefault();
//   window.location.href = "index.html";
// });

let navbar=document.querySelector('.navbar');

document.querySelector('#menu-btn').onclick = () => {
    navbar.classList.toggle('active');
    loginForm.classList.remove('active');
    searchForm.classList.remove('active');
}

let loginForm=document.querySelector('.login-form');

document.querySelector('#login-btn').onclick = () => {
    loginForm.classList.toggle('active');
    navbar.classList.remove('active');
    searchForm.classList.remove('active');
}



let searchForm=document.querySelector('.search-form');

document.querySelector('#search-btn').onclick = () => {
    searchForm.classList.toggle('active');
    navbar.classList.remove('active');
    loginForm.classList.remove('active');
}

let themeBtn=document.querySelector('#toggleDark');

themeBtn.onclick = () => {
    console.log('Button clicked!');
    themeBtn.classList.toggle('bi-moon')
    themeBtn.classList.toggle('active');  

    if (themeBtn.classList.contains('bi-moon') && themeBtn.classList.contains('active')) {
        document.body.classList.add('active');
        document.body.style.transition='1s';
    } else {
        document.body.classList.remove('active');
        document.body.style.transition='1s';
        
    }
};


// var swiper = new Swiper(".review-slider", {
//     loop: true,
//     spaceBetween: 30,
//     centeredSlides: true,
//     autoplay: {
//       delay: 5500,
//       disableOnInteraction: false,
//     },
//     pagination: {
//       el: ".swiper-pagination",
//     },
// });

// document.querySelectorAll('.about .video-container .controls .control-btn').forEach(btn => {
//     btn.onclick = () => {
//         let src = btn.getAttribute('data-src');
//         document.querySelector('.about .video-container .video').src =src;
//     }
// })

const videoPlayer = document.getElementById("videoPlayer");
const videoSources = [
  "/videos/video1.mp4",
  "/videos/video2.mp4",
  "/videos/video3.mp4"
];
let currentVideoIndex = 0;
let playCount = 0;

function playNextVideo() {
  videoPlayer.src = videoSources[currentVideoIndex];
  videoPlayer.play();
  
  videoPlayer.addEventListener("ended", function() {
    playCount++;
    
    if (playCount < 2) {
      // Repeat the same video
      videoPlayer.play();
    } else {
      playCount = 0;
      currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
      videoPlayer.src = videoSources[currentVideoIndex];
      videoPlayer.play();
    }
  });
}

playNextVideo();


//New Code added 

const daysTag = document.querySelector(".days"),
currentDate = document.querySelector(".current-date"),
prevNextIcon = document.querySelectorAll(".icons span");

// getting new date, current year and month
let date = new Date(),
currYear = date.getFullYear(),
currMonth = date.getMonth();

// storing full name of all months in array
const months = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"];

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), // getting first day of month
    lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // getting last date of month
    lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
    lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
    let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) { // creating li of previous month last days
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) { // creating li of all days of current month
        // adding active class to li if the current day, month, and year matched
        let isToday = i === date.getDate() && currMonth === new Date().getMonth() 
                     && currYear === new Date().getFullYear() ? "active" : "";
        liTag += `<li class="${isToday}">${i}</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) { // creating li of next month first days
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
    }
    currentDate.innerText = `${months[currMonth]} ${currYear}`; // passing current mon and yr as currentDate text
    daysTag.innerHTML = liTag;
}
renderCalendar();

prevNextIcon.forEach(icon => { // getting prev and next icons
    icon.addEventListener("click", () => { // adding click event on both icons
        // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        if(currMonth < 0 || currMonth > 11) { // if current month is less than 0 or greater than 11
            // creating a new date of current year & month and pass it as date value
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear(); // updating current year with new date year
            currMonth = date.getMonth(); // updating current month with new date month
        } else {
            date = new Date(); // pass the current date as date value
        }
        renderCalendar(); // calling renderCalendar function
    });
});  



const multiCitiesRadio = document.getElementById('multi-cities');
const extraSection = document.querySelector('.extra-section');
const extraSection1 = document.querySelector('.extra-section1');
const addFlightButton = document.querySelector('.add-new-flight');
const removeFlightButton = document.querySelector('.remove-new-flight');

function toggleExtraSection() {
  if (multiCitiesRadio.checked) {
    extraSection.style.display = 'block';
    extraSection1.style.display = 'block';
    addFlightButton.style.display = 'block';
    extraSection1.style.display = 'grid'; // Show extra-section1
  } else {
    extraSection.style.display = 'none';
    extraSection1.style.display = 'none';
    addFlightButton.style.display = 'none';
  }
}

extraSection1.style.display = 'none'; // Hide extra-section1 initially

multiCitiesRadio.addEventListener('click', toggleExtraSection);

// Add event listeners to other radio buttons
const radioButtons = document.querySelectorAll('.trip-details input[type="radio"]');
radioButtons.forEach(function(radioButton) {
  if (radioButton !== multiCitiesRadio) {
    radioButton.addEventListener('click', function() {
      extraSection.style.display = 'none';
      extraSection1.style.display = 'none';
      addFlightButton.style.display = 'none';
    });
  }
});

addFlightButton.addEventListener('click', function() {
  const clonedExtraSection = extraSection.cloneNode(true);
  extraSection.parentNode.insertBefore(clonedExtraSection, extraSection.nextSibling);
});

removeFlightButton.addEventListener('click', function() {
  const clonedExtraSections = document.querySelectorAll('.extra-section');

  if (clonedExtraSections.length > 1) { // Check if there is more than one cloned extra-section
    const lastClonedExtraSection = clonedExtraSections[clonedExtraSections.length - 1];
    lastClonedExtraSection.remove();
  }
});


// const addFlightButton = document.querySelector('.add-new-flight');

// function toggleExtraSection() {
//   if (multiCitiesRadio.checked) {
//     extraSection.style.display = 'block';
//   } else {
//     extraSection.style.display = 'none';
//   }
// }

// function activateExtraSection() {
//   extraSection.style.display = 'block';
// }

// multiCitiesRadio.addEventListener('click', toggleExtraSection);
// addFlightButton.addEventListener('click', activateExtraSection);

// // Add event listeners to other radio buttons
// radioButtons.forEach(function(radioButton) {
//   if (radioButton !== multiCitiesRadio) {
//     radioButton.addEventListener('click', function() {
//       extraSection.style.display = 'none';
//     });
//   }
// });










const today = new Date();
  
const year = today.getFullYear();
let month = today.getMonth() + 1;
if (month < 10) {
  month = '0' + month;
}
let day = today.getDate();
if (day < 10) {
  day = '0' + day;
}
const formattedDate = `${year}-${month}-${day}`;
document.getElementById("calendar").value = formattedDate;




const fromSearchBox = document.getElementById('fromSearchBox');
const toSearchBox = document.getElementById('toSearchBox');

fromSearchBox.addEventListener('click', () => {
  const indianCities = getAllIndianCities();
  const mainCities = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore'];
  showSearchOptions(fromSearchBox, mainCities, indianCities);
});

toSearchBox.addEventListener('click', () => {
  const indianCities = getAllIndianCities();
  const mainCities = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore'];
  showSearchOptions(toSearchBox, mainCities, indianCities);
});

function showSearchOptions(searchBox, mainCities, indianCities) {
  if (searchBox.getAttribute('list')) return; // Don't regenerate if options already shown
  searchBox.value = '';
  searchBox.setAttribute('list', '');
  const datalistId = 'datalist-' + searchBox.id;
  const datalist = document.createElement('datalist');
  datalist.id = datalistId;

  mainCities.forEach((option) => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    datalist.appendChild(optionElement);
  });

  indianCities.forEach((option) => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    datalist.appendChild(optionElement);
  });

  searchBox.setAttribute('list', datalistId);
  document.body.appendChild(datalist);
}

function getAllIndianCities() {
  // Include all Indian cities here
  const indianCities = [
    'Delhi',
    'Mumbai',
    'Kolkata',
    'Chennai',
    'Bangalore',
    'Ahmedabad'
    // Add more Indian cities...
  ];

  return indianCities;
}


document.getElementById("find-now").addEventListener("click", function(event) {
    event.preventDefault();
    window.location.href = "flights.html";
});

