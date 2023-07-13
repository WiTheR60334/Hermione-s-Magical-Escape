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
document.getElementById("register-btn").addEventListener("click", function(event) {
    event.preventDefault();
    window.location.href = "signup.html";
});

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