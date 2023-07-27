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

// document.getElementById("logout-btn").addEventListener("click", function(event) {
//   event.preventDefault();
//   window.location.href = "index.html";
// });




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



