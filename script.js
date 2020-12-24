// Global variable of maplist
var mapList;

function loadMap() {
  var map = document.getElementById("map").contentDocument.querySelector("svg");
  var toolTip = document.getElementById("toolTip");

  // Add event listeners to map element
  if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // If user agent is not mobile add click listener (for wikidata links)
    map.addEventListener("click", handleClick, false);
  }
  map.addEventListener("mousemove", mouseEntered, false);
  map.addEventListener("mouseout", mouseGone, false);

  // Show tooltip on mousemove
  function mouseEntered(e) {
    var target = e.target;
    if (target.nodeName == "path") {
      target.style.opacity = 0.6;
      var details = e.target.attributes;

      // Follow cursor
      toolTip.style.transform = `translate(${e.offsetX}px, ${e.offsetY}px)`;

      // Tooltip data
      toolTip.innerHTML = `
        <ul>
            <li><b>Province: ${details.name.value}</b></li>
            <li>Local name: ${details.gn_name.value}</li>
            <li>Country: ${details.admin.value}</li>
            <li>Postal: ${details.postal.value}</li>
        </ul>`;
    }
  }

  // Clear tooltip on mouseout
  function mouseGone(e) {
    var target = e.target;
    if (target.nodeName == "path") {
      target.style.opacity = 1;
      toolTip.innerHTML = "";
    }
  }

  // Go to wikidata page onclick
  function handleClick(e) {
    if (e.target.nodeName == "path") {
      var details = e.target.attributes;
      window.open(`https://www.wikidata.org/wiki/${details.wikidataid.value}`, "_blank");
    }
  }
}

// Calls init function on window load
window.onload = function () {
  var changeSelector = document.getElementById("mapChange");

  // Get JSON file containing map list
  getData("/mapList.json").then(function (res) {
    mapList = res;
    res.map(function (item) {
      var option = document.createElement("option");
      option.text = item[0] + " - " + item[1];
      option.value = item[3];
      changeSelector.appendChild(option);
    });
    changeSelector.options[149].selected = "selected";
  });

  // Init map
  loadMap();
};

function randomMap() {
  var random = Math.floor(Math.random() * mapList.length);
  changeMap(random);
}

// Calls map change function on button click
function changeMap(random) {
  var map = document.getElementById("map");
  var changeSelector = document.getElementById("mapChange");
  var downloadLink = document.querySelector("a.download");
  var countryName = document.getElementById("country-name");

  // Get value of dropdown selection
  var selectedValue;

  if (random) {
    // Random map generated
    selectedValue = mapList[random][3];
    changeSelector.options[random].selected = "selected";
  } else {
    // Selected from dropdown
    selectedValue = changeSelector.options[changeSelector.selectedIndex].value;
  }

  // Get details of selected country
  var details = mapList.filter(function (item) {
    return item[3] == selectedValue;
  });

  // Set country title
  countryName.innerHTML = details[0][2];

  // Load new map
  map.data = `/maps/${selectedValue}`;
  downloadLink.href = `/maps/${selectedValue}`;

  // Re-init map on map load
  map.onload = function () {
    loadMap();
  };
}

// Load external data
function getData(e) {
  var request = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    request.open("GET", e);

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        resolve(JSON.parse(request.responseText));
      } else {
        console.error("Cant reach the file!");
      }
    };

    request.onerror = function () {
      console.error("Cant reach the file!");
    };

    request.send();
  });
}
