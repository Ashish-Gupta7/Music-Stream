function randomWidth() {
  document.querySelectorAll(".progress-bar").forEach((bar) => {
    const randomWidth = Math.floor(Math.random() * (270 - 30 + 1)) + 30;
    gsap.to(bar, {
      width: `${randomWidth}px`,
    });
  });
}
randomWidth();

function mainMenu() {
  let menuButton = document.querySelector(".menu-button");
  let showMenu = document.querySelector(".show-menu");
  let hideSongs = document.querySelector(".hide-songs");
  let closeMenu = document.querySelector(".close-menu");
  menuButton.addEventListener("click", function () {
    menuButton.classList.add("hidden");
    showMenu.classList.remove("hidden");
    hideSongs.classList.add("hidden");
    gsap.to(showMenu, {
      top: 0,
    });
  });
  closeMenu.addEventListener("click", function () {
    menuButton.classList.remove("hidden");
    showMenu.classList.add("hidden");
    hideSongs.classList.remove("hidden");
    gsap.to(showMenu, {
      top: "96vh",
    });
  });
}
mainMenu();

function extraDetailsOfTheSong() {
  let moreButtons = document.querySelectorAll(".more-button");
  let showDetailsList = document.querySelectorAll(".show-details");

  moreButtons.forEach((elm, idx) => {
    let showDetails = showDetailsList[idx];
    let closeDetails = showDetails.querySelector(".close-details");

    elm.addEventListener("click", function () {
      showDetailsList.forEach((details) => {
        gsap.to(details, {
          left: "-100vw",
        });
      });

      gsap.to(showDetails, {
        left: 0,
      });
    });

    closeDetails.addEventListener("click", function () {
      gsap.to(showDetails, {
        left: "-100vw",
      });
    });
  });
}
extraDetailsOfTheSong();

function addRemoveFavSong() {
  document.querySelectorAll(".fav-icon").forEach((icon) => {
    icon.addEventListener("click", function () {
      const songId = this.getAttribute("data-song-id");
      const isFav = this.classList.contains("ri-heart-fill");

      this.classList.toggle("ri-heart-line");
      this.classList.toggle("ri-heart-fill");

      fetch("/home/favourite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songId: songId,
          isFav: !isFav,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log("Favorite status updated");
        })
        .catch((error) => {
          // console.error("Something went wrong.");
        });
    });
  });
}
addRemoveFavSong();

function playlistFuctionalities() {
  let createNewPlaylist = document.querySelectorAll(".create-new-playlist");
  let showCreatePlaylist = document.querySelector(".show-create-playlist");
  let closeCreatePlaylist = document.querySelector(".close-create-playlist");

  createNewPlaylist.forEach((elm) => {
    elm.addEventListener("click", function () {
      showCreatePlaylist.classList.remove("hidden");
    });
  });
  closeCreatePlaylist.addEventListener("click", function () {
    showCreatePlaylist.classList.add("hidden");
  });
}
playlistFuctionalities();

let uploadImg = document.querySelector(".upload-img");
let musicIcon = document.querySelector(".music-icon");
let imgIcon = document.querySelector(".img-icon");
let selectPlaylistLeft = document.querySelector(".select-playlist-left");
let playlistEditMenu = document.querySelector(".playlist-edit-menu");
let chooseOptions = document.querySelector(".choose-options");
let imageInput = document.querySelector("#image");
let uploadedImage = document.querySelector("#uploadedImage");
let changeImage = document.querySelector(".change-image");
let deleteImage = document.querySelector(".delete-image");
let errorMessage = document.querySelector(".img-error-message");
let playlistFrom = document.querySelector(".playlist-form");

uploadImg.addEventListener("mouseenter", function () {
  musicIcon.classList.add("hidden");
  imgIcon.classList.remove("hidden");
  uploadedImage.classList.add("hidden");
});

uploadImg.addEventListener("mouseleave", function () {
  musicIcon.classList.remove("hidden");
  imgIcon.classList.add("hidden");
  uploadedImage.classList.remove("hidden");
});

imageInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      errorMessage.innerText = "Please upload a JPG, JPEG, or PNG file!";
      errorMessage.classList.remove("hidden");
      imageInput.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      errorMessage.innerText = "File size must be less than 2MB!";
      errorMessage.classList.remove("hidden");
      imageInput.value = "";
      return;
    }

    errorMessage.classList.add("hidden");

    const reader = new FileReader();
    reader.onload = function (e) {
      uploadedImage.src = e.target.result;
      uploadedImage.classList.add("h-full", "w-full");
    };
    reader.readAsDataURL(file);
  }
});
