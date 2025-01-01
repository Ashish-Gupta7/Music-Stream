let uploadImgShow = document.querySelector(".upload-img-show");
let musicIconShow = document.querySelector(".music-icon-show");
let imgIconShow = document.querySelector(".img-icon-show");
let playlistFromShow = document.querySelector(".playlist-form-show");
let editButtons = document.querySelectorAll(".edit-playlist");
let showEditPlaylist = document.querySelectorAll(".show-edit-playlist");

function editPlaylist() {
  editButtons.forEach((button, idx) => {
    let edit = showEditPlaylist[idx];
    let closeEditPlaylist = edit.querySelector(".close-edit-playlist");
    let selectPlaylistLeftEdit = edit.querySelector(
      ".select-playlist-left-edit"
    );
    let playlistEditMenu = edit.querySelector(".playlist-edit-menu");
    let chooseOptionsEdit = edit.querySelector(".choose-options-edit");
    let changeImageEdit = edit.querySelectorAll(".change-image-edit");
    let imageInputEdit = edit.querySelector("#image-edit");
    let uploadedImageEdit = edit.querySelector("#uploadedImage-edit");
    let errorMessageEdit = edit.querySelector(".img-error-message-edit");

    selectPlaylistLeftEdit.addEventListener("mouseenter", function () {
      playlistEditMenu.classList.remove("hidden");
    });
    selectPlaylistLeftEdit.addEventListener("mouseleave", function () {
      playlistEditMenu.classList.add("hidden");
    });

    let flag = true;
    playlistEditMenu.addEventListener("click", function () {
      if (flag) {
        chooseOptionsEdit.classList.remove("hidden");
        flag = false;
      } else {
        chooseOptionsEdit.classList.add("hidden");
        flag = true;
      }
    });

    button.addEventListener("click", function (e) {
      showEditPlaylist.forEach((elem) => {
        elem.classList.add("hidden");
      });
      edit.classList.remove("hidden");
    });

    closeEditPlaylist.addEventListener("click", function () {
      edit.classList.add("hidden");
    });

    changeImageEdit[0].addEventListener("click", function () {
      imageInputEdit.click();
    });
    changeImageEdit[1].addEventListener("click", function (e) {
      e.preventDefault();
    });

    imageInputEdit.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
          errorMessageEdit.innerText =
            "Please upload a JPG, JPEG, or PNG file!";
          errorMessageEdit.classList.remove("hidden");
          imageInputEdit.value = "";
          return;
        }

        if (file.size > 2 * 1024 * 1024) {
          errorMessageEdit.innerText = "File size must be less than 2MB!";
          errorMessageEdit.classList.remove("hidden");
          imageInput.value = "";
          return;
        }

        errorMessageEdit.classList.add("hidden");

        const reader = new FileReader();
        uploadedImageEdit.src = "";
        reader.onload = function (e) {
          uploadedImageEdit.src = e.target.result;
          uploadedImageEdit.classList.add("h-full", "w-full");
        };
        reader.readAsDataURL(file);
      }
    });
  });
}
editPlaylist();

function deletePlaylist() {
  let deletePlaylist = document.querySelectorAll(".delete-playlist");

  deletePlaylist.forEach((elem) => {
    elem.addEventListener("click", function () {
      let playlistId = this.getAttribute("playlistId");
      let playlistElement = this.closest(".playlist-element");

      fetch("/playlist/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlistId: playlistId,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to delete playlist: ${response.statusText}`
            );
          }
          return response.json();
        })
        .then((data) => {
          // console.log("Playlist Deleted:", data.message);
          playlistElement.remove();
        })
        .catch((error) => {
          // console.error("Error:", error);
        });
    });
  });
}
deletePlaylist();

function playlistFuctionalities() {
  let createNewPlaylist = document.querySelectorAll(".create-new-playlist");
  let showCreatePlaylist = document.querySelector(".show-create-playlist");
  let closeCreatePlaylist = document.querySelector(".close-create-playlist");
  let zeroPlaylist = document.querySelector(".zero-playlist");
  let afterClickCreatePlaylist = document.querySelector(
    ".after-click-create-playlist"
  );

  createNewPlaylist.forEach((elem) => {
    elem.addEventListener("click", function () {
      showCreatePlaylist.classList.remove("hidden");
      zeroPlaylist.classList.add("hidden");
      afterClickCreatePlaylist.classList.remove("hidden");
    });
  });
  closeCreatePlaylist.addEventListener("click", function () {
    zeroPlaylist.classList.remove("hidden");
    showCreatePlaylist.classList.add("hidden");
    afterClickCreatePlaylist.classList.add("hidden");
  });
}
playlistFuctionalities();

function createPlaylist() {
  let uploadImg = document.querySelector(".upload-img");
  let musicIcon = document.querySelector(".music-icon");
  let imgIcon = document.querySelector(".img-icon");
  // let selectPlaylistLeft = document.querySelector(".select-playlist-left");
  // let playlistEditMenu = document.querySelector(".playlist-edit-menu");
  // let chooseOptions = document.querySelector(".choose-options");
  let imageInput = document.querySelector("#image");
  let uploadedImage = document.querySelector("#uploadedImage");
  // let changeImage = document.querySelector(".change-image");
  // let deleteImage = document.querySelector(".delete-image");
  let errorMessage = document.querySelector(".img-error-message");
  // let playlistFrom = document.querySelector(".playlist-form");

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
}
createPlaylist();

function deletePlaylistPoster() {
  document.addEventListener("DOMContentLoaded", function () {
    let deleteImageShow = document.querySelectorAll(".delete-image-show");

    deleteImageShow.forEach((elem) => {
      elem.addEventListener("click", function () {
        let confirmed = confirm("Are you sure you want to delete this image?");
        let playlistId = this.getAttribute("playlistId");

        if (confirmed) {
          let uploadedImage = document.querySelector(
            `img[imageId=image-${playlistId}]`
          );
          uploadedImage.src = "/images/picture/default-image.webp";

          fetch("/playlist/delete/image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "delete", playlistId: playlistId }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.message === "Playlist poster deleted successfully") {
                console.log("playlist poster deleted");
              } else {
                alert("Failed to delete the image.");
              }
            })
            .catch((err) => console.error(err));
        }
      });
    });
  });
}
deletePlaylistPoster();
