document.querySelector(".back-button").onclick = () => Cmds.goBack();
document.querySelector(".forward-button").onclick = () => Cmds.goForward();
document.querySelector(".reload-button").onclick = () => Cmds.reload();
document.querySelector(".stop-button").onclick = () => Cmds.stop();

(function() {
  let urlbar = document.querySelector(".urlbar");
  let urlinput = document.querySelector(".urlinput");

  urlinput.addEventListener("focus", () => {
    urlinput.select();
    urlbar.classList.add("focus");
  })

  urlinput.addEventListener("blur", () => {
    urlbar.classList.remove("focus");
  })

  urlinput.addEventListener("keypress", (e) => {
    if (e.keyCode == 13) {
      gBrowser.urlInputChanged()
    }
  });

  urlinput.addEventListener("input", () => {
    gBrowser.selectedTab.userInput = urlinput.value;
  });

  let searchbar = document.querySelector(".searchbar");
  let searchinput = document.querySelector(".searchinput");
  searchinput.addEventListener("focus", () => {
    searchinput.select();
    searchbar.classList.add("focus");
  })
  searchinput.addEventListener("blur", () => searchbar.classList.remove("focus"))
  searchinput.addEventListener("keypress", (e) => {
    if (e.keyCode == 13) {
      gBrowser.searchInputChanged()
    }
  });
})()
