document.querySelector(".back-button").onclick = () => Cmds.navigation.goBack();
document.querySelector(".forward-button").onclick = () => Cmds.navigation.goForward();
document.querySelector(".reload-button").onclick = () => Cmds.navigation.reload();
document.querySelector(".stop-button").onclick = () => Cmds.navigation.stop();

let urlbar = document.querySelector(".urlbar");
let urlinput = document.querySelector(".urlinput");
urlinput.addEventListener("focus", () => {
  urlinput.select();
  urlbar.classList.add("focus");
})
urlinput.addEventListener("blur", () => urlbar.classList.remove("focus"))
urlinput.addEventListener("keypress", (e) => {
  if (e.keyCode == 13) {
    gBrowser.urlInputChanged()
  }
});
let searchbar = document.querySelector(".searchbar");
let searchinput = document.querySelector(".searchinput");
searchinput.addEventListener("focus", () => {
  searchinput.select();
  searchbar.classList.add("focus");
})
searchinput.addEventListener("blur", () => searchbar.classList.remove("focus"))
