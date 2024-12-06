/* 
 * Material You NewTab
 * Copyright (c) 2023-2024 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * You should have received a copy of the GNU General Public License along with this program. 
 * If not, see <https://www.gnu.org/licenses/>.
 */

// Check if alert has already been shown
if(!localStorage.getItem("alertShown"))
{
  // Show the alert after 4 seconds
  setTimeout(() =>
  {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const message = isMac
      ? "Press Cmd + Shift + B to show the bookmarks bar."
      : "Press Ctrl + Shift + B to show the bookmarks bar.";

    alert(message);

    // Set a flag in localStorage so the alert is not shown again
    localStorage.setItem("alertShown", "true");
  }, 4000);
}

let proxyurl;
let clocktype;
let hourformat;
window.addEventListener("DOMContentLoaded", async() =>
{
  try
  {
    // Cache DOM elements
    const userAPIInput = document.getElementById("userAPI");
    const userLocInput = document.getElementById("userLoc");
    const userProxyInput = document.getElementById("userproxy");
    const saveAPIButton = document.getElementById("saveAPI");
    const saveLocButton = document.getElementById("saveLoc");
    const resetbtn = document.getElementById("resetsettings");
    const saveProxyButton = document.getElementById("saveproxy");

    // Load saved data from localStorage
    const savedApiKey = localStorage.getItem("weatherApiKey");
    const savedLocation = localStorage.getItem("weatherLocation");
    const savedProxy = localStorage.getItem("proxy");

    // Pre-fill input fields with saved data
    if(savedLocation)
    {
      userLocInput.value = savedLocation;
    }
    if(savedApiKey)
    {
      userAPIInput.value = savedApiKey;
    }

    const defaultProxyURL = "https://mynt-proxy.rhythmcorehq.com"; //Default proxy url
    if(savedProxy && savedProxy !== defaultProxyURL)
    {
      userProxyInput.value = savedProxy;
    }

    // Function to simulate button click on Enter key press
    function handleEnterPress(event, buttonId)
    {
      if(event.key === "Enter")
      {
        document.getElementById(buttonId).click();
      }
    }

    // Add event listeners for handling Enter key presses
    userAPIInput.addEventListener("keydown", (event) => handleEnterPress(event, "saveAPI"));
    userLocInput.addEventListener("keydown", (event) => handleEnterPress(event, "saveLoc"));
    userProxyInput.addEventListener("keydown", (event) => handleEnterPress(event, "saveproxy"));

    // Save API key to localStorage
    saveAPIButton.addEventListener("click", () =>
    {
      const apiKey = userAPIInput.value.trim();
      localStorage.setItem("weatherApiKey", apiKey);
      userAPIInput.value = "";
      location.reload();
    });

    // Save location to localStorage
    saveLocButton.addEventListener("click", () =>
    {
      const userLocation = userLocInput.value.trim();
      localStorage.setItem("weatherLocation", userLocation);
      userLocInput.value = "";
      location.reload();
    });

    // Reset settings (clear localStorage)
    resetbtn.addEventListener("click", () =>
    {
      if(confirm("Are you sure you want to reset your settings? This action cannot be undone."))
      {
        localStorage.clear();
        location.reload();
      }
    });

    // Save the proxy to localStorage
    saveProxyButton.addEventListener("click", () =>
    {
      const proxyurl = userProxyInput.value.trim();

      // If the input is empty, use the default proxy.
      if(proxyurl === "")
      {
        localStorage.setItem("proxy", defaultProxyURL);
        userProxyInput.value = "";
        location.reload();
        return;
      }

      // Validate if input starts with 'http://' or 'https://'
      if(proxyurl.startsWith("http://") || proxyurl.startsWith("https://"))
      {
        if(!proxyurl.endsWith("/"))
        {
          localStorage.setItem("proxy", proxyurl);
          userProxyInput.value = "";
          location.reload();
        }
        else
        {
          alert("There shouldn't be / at the end of the link");
        }
      }
      else
      {
        alert("Only links (starting with http:// or https://) are allowed.");
      }
    });

    // Default Weather API key
    const weatherApiKeys = [
      "d36ce712613d4f21a6083436240910",
      "db0392b338114f208ee135134240312",
      "de5f7396db034fa2bf3140033240312",
      "c64591e716064800992140217240312",
      "9b3204c5201b4b4d8a2140330240312",
      "eb8a315c15214422b60140503240312",
      "cd148ebb1b784212b74140622240312",
      "7ae67e219af54df2840140801240312"
    ];
    const defaultApiKey = weatherApiKeys[Math.floor(Math.random() * weatherApiKeys.length)];

    // Determine API key and proxy URL to use
    const apiKey = savedApiKey || defaultApiKey;
    proxyurl = savedProxy || defaultProxyURL;

    // Determine the location to use
    let currentUserLocation = savedLocation;

    // If no saved location, fetch the IP-based location
    if(!currentUserLocation)
    {
      try
      {
        const geoLocation = "https://ipinfo.io/json/";
        const locationData = await fetch(geoLocation);
        const parsedLocation = await locationData.json();

        // If the country is India and the location is 'Delhi', update to 'New Delhi'
        if(parsedLocation.country === "IN" && parsedLocation.city === "Delhi")
        {
          currentUserLocation = "New Delhi";
        }
        else
        {
          currentUserLocation = parsedLocation.city; // Update to user's city from IP
        }

        localStorage.setItem("weatherLocation", currentUserLocation); // Save and show the fetched location
      }
      catch(error)
      {
        currentUserLocation = "auto:ip"; // Fallback if fetching location fails
      }
    }

    const currentLanguage = getLanguageStatus("selectedLanguage") || "en";

    // Fetch weather data using Weather API
    const weatherApi = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${currentUserLocation}&aqi=no&lang=${currentLanguage}`;
    const data = await fetch(weatherApi);
    const parsedData = await data.json();

    // Weather data
    const conditionText = parsedData.current.condition.text;
    const tempCelsius = Math.round(parsedData.current.temp_c);
    const tempFahrenheit = Math.round(parsedData.current.temp_f);
    const humidity = parsedData.current.humidity;
    const feelsLikeCelsius = parsedData.current.feelslike_c;
    const feelsLikeFahrenheit = parsedData.current.feelslike_f;

    // Update DOM elements with the weather data
    document.getElementById("conditionText").textContent = conditionText;

    // Localize and display temperature and humidity
    const localizedHumidity = localizeNumbers(humidity.toString(), currentLanguage);
    const localizedTempCelsius = localizeNumbers(tempCelsius.toString(), currentLanguage);
    const localizedFeelsLikeCelsius = localizeNumbers(feelsLikeCelsius.toString(), currentLanguage);
    const localizedTempFahrenheit = localizeNumbers(tempFahrenheit.toString(), currentLanguage);
    const localizedFeelsLikeFahrenheit = localizeNumbers(feelsLikeFahrenheit.toString(), currentLanguage);

    // Set humidity level
    const humidityLabel = translations[currentLanguage]?.humidityLevel || translations["en"].humidityLevel; // Fallback
                                                                                                            // to
                                                                                                            // English
                                                                                                            // if
                                                                                                            // translation
                                                                                                            // is
                                                                                                            // missing
    document.getElementById("humidityLevel").innerHTML = `${humidityLabel} ${localizedHumidity}%`;

    // Event Listener for the Fahrenheit toggle
    const fahrenheitCheckbox = document.getElementById("fahrenheitCheckbox");
    const updateTemperatureDisplay = () =>
    {
      const tempElement = document.getElementById("temp");
      const feelsLikeLabel = translations[currentLanguage]?.feelsLike || translations["en"].feelsLike;
      if(fahrenheitCheckbox.checked)
      {
        tempElement.innerHTML = `${localizedTempFahrenheit}<span class="tempUnit">°F</span>`;
        const feelsLikeFUnit = currentLanguage === "cs" ? " °F" : "°F";  // Add space for Czech in Fahrenheit
        document.getElementById("feelsLike").innerHTML =
          `${feelsLikeLabel} ${localizedFeelsLikeFahrenheit}${feelsLikeFUnit}`;
      }
      else
      {
        tempElement.innerHTML = `${localizedTempCelsius}<span class="tempUnit">°C</span>`;
        const feelsLikeCUnit = currentLanguage === "cs" ? " °C" : "°C";  // Add space for Czech in Celsius
        document.getElementById("feelsLike").innerHTML =
          `${feelsLikeLabel} ${localizedFeelsLikeCelsius}${feelsLikeCUnit}`;
      }
    };
    updateTemperatureDisplay();

    // Setting weather Icon
    const newWIcon = parsedData.current.condition.icon;
    const weatherIcon = newWIcon.replace("//cdn", "https://cdn");
    document.getElementById("wIcon").src = weatherIcon;

    // Define minimum width for the slider based on the language
    const humidityMinWidth = {
      idn: "47%",
      en: "42%" // Default for English and others
    };
    const slider = document.getElementById("slider");
    slider.style.minWidth = humidityMinWidth[currentLanguage] || humidityMinWidth["en"];

    // Set slider width based on humidity
    if(humidity > 40)
    {
      slider.style.width = `calc(${humidity}% - 60px)`;
    }

    // Update location
    var city = parsedData.location.name;
    // var city = "Thiruvananthapuram";
    var maxLength = 10;
    var limitedText = city.length > maxLength ? city.substring(0, maxLength) + "..." : city;
    document.getElementById("location").textContent = limitedText;

  }
  catch(error)
  {
    console.error("Error fetching weather data:", error);
  }
});
// ---------------------------end of weather stuff--------------------

// ------------------------Google App Menu-----------------------------------
const iconContainer = document.getElementById("iconContainer");
const googleAppsCont = document.getElementById("googleAppsCont");

// Toggle menu and tooltip visibility
googleAppsCont.addEventListener("click", function(event)
{
  const isMenuVisible = iconContainer.style.display === "grid";

  // Toggle menu visibility
  iconContainer.style.display = isMenuVisible ? "none" : "grid";

  // Add or remove the class to hide the tooltip
  if(!isMenuVisible)
  {
    googleAppsCont.classList.add("menu-open"); // Hide tooltip
  }
  else
  {
    googleAppsCont.classList.remove("menu-open"); // Restore tooltip
  }

  event.stopPropagation();
});

// Close menu when clicking outside
document.addEventListener("click", function(event)
{
  const isClickInside =
    iconContainer.contains(event.target) || googleAppsCont.contains(event.target);

  if(!isClickInside && iconContainer.style.display === "grid")
  {
    iconContainer.style.display = "none"; // Hide menu
    googleAppsCont.classList.remove("menu-open"); // Restore tooltip
  }
});
// ------------------------End of Google App Menu Setup-----------------------------------

// Retrieve current time and calculate initial angles
var currentTime = new Date();
var initialSeconds = currentTime.getSeconds();
var initialMinutes = currentTime.getMinutes();
var initialHours = currentTime.getHours();

// Initialize cumulative rotations
let cumulativeSecondRotation = initialSeconds * 6; // 6° par seconde
let cumulativeMinuteRotation = initialMinutes * 6 + (initialSeconds / 10); // 6° par minute + ajustement pour les
                                                                           // secondes
let cumulativeHourRotation = (30 * initialHours + initialMinutes / 2); // 30° par heure + ajustement pour les minutes

// Apply initial rotations (no need to wait 1s now)
document.getElementById("second").style.transform = `rotate(${cumulativeSecondRotation}deg)`;
document.getElementById("minute").style.transform = `rotate(${cumulativeMinuteRotation}deg)`;
document.getElementById("hour").style.transform = `rotate(${cumulativeHourRotation}deg)`;

let intervalId;
let secondreset = false;
let hourreset = false;
let minreset = false;

function initializeClockType()
{
  const savedClockType = localStorage.getItem("clocktype");
  clocktype = savedClockType ? savedClockType : "analog"; // Default to "analog" if nothing is saved
  localStorage.setItem("clocktype", clocktype); // Ensure it's set in local storage
}

// Call this function to initialize the clock type
initializeClockType();

function updateDate()
{
  if(clocktype === "analog")
  {
    var currentTime = new Date();
    var dayOfWeek = currentTime.getDay();
    var dayOfMonth = currentTime.getDate();
    var month = currentTime.getMonth();

    // Define the current language
    var currentLanguage = getLanguageStatus("selectedLanguage") || "en";

    // Get the translated name of the day
    var dayName;
    if(
      translations[currentLanguage] &&
      translations[currentLanguage].days &&
      translations[currentLanguage].days[dayOfWeek]
    )
    {
      dayName = translations[currentLanguage].days[dayOfWeek];
    }
    else
    {
      dayName = translations["en"].days[dayOfWeek]; // Fallback to English day name
    }

    // Get the translated name of the month
    var monthName;
    if(
      translations[currentLanguage] &&
      translations[currentLanguage].months &&
      translations[currentLanguage].months[month]
    )
    {
      monthName = translations[currentLanguage].months[month];
    }
    else
    {
      monthName = translations["en"].months[month]; // Fallback to English month name
    }

    // Localize the day of the month
    var localizedDayOfMonth = localizeNumbers(dayOfMonth.toString(), currentLanguage);

    const dateDisplay = {
      bn: `${dayName}, ${localizedDayOfMonth} ${monthName}`,
      mr: `${dayName}, ${localizedDayOfMonth} ${monthName}`,
      zh: `${monthName}${dayOfMonth}日${dayName}`,
      cs: `${dayName}, ${dayOfMonth}. ${monthName}`,
      hi: `${dayName}, ${dayOfMonth} ${monthName}`,
      it: `${dayName.substring(0, 3)} ${dayOfMonth} ${monthName.substring(0, 3)}`,
      ja: `${dayName.substring(0, 1)}, ${monthName}${dayOfMonth}`,
      ko: `${dayName.substring(0, 1)}, ${monthName} ${dayOfMonth}일`,
      pt: `${dayName.substring(0, 3)}, ${dayOfMonth} ${monthName.substring(0, 3)}`,
      ru: `${dayName.substring(0, 2)}, ${dayOfMonth} ${monthName.substring(0, 4)}.`,
      es: `${dayName.substring(0, 3)}, ${dayOfMonth} ${monthName.substring(0, 3)}`,
      tr: `${dayName.substring(0, 3)}, ${dayOfMonth} ${monthName}`,
      uz: `${dayName.substring(0, 3)}, ${dayOfMonth}-${monthName}`,
      vi: `${dayName}, Ngày ${dayOfMonth} ${monthName}`,
      idn: `${dayName}, ${dayOfMonth} ${monthName}`,
      default: `${dayName.substring(0, 3)}, ${monthName.substring(0, 3)} ${localizedDayOfMonth}`
    };
    document.getElementById("date").innerText = dateDisplay[currentLanguage] || dateDisplay.default;
  }
}

function updateanalogclock()
{
  var currentTime = new Date();
  var initialSeconds = currentTime.getSeconds();
  var initialMinutes = currentTime.getMinutes();
  var initialHours = currentTime.getHours();

  // Initialize cumulative rotations

  let cumulativeSecondRotation = initialSeconds * 6; // 6° par seconde
  let cumulativeMinuteRotation = initialMinutes * 6 + (initialSeconds / 10); // 6° par minute + ajustement pour les
                                                                             // secondes
  let cumulativeHourRotation = (30 * initialHours + initialMinutes / 2);
  if(secondreset)
  {
    document.getElementById("second").style.transition = "none";
    document.getElementById("second").style.transform = `rotate(0deg)`;
    secondreset = false;
    return;
  }
  if(minreset)
  {
    document.getElementById("minute").style.transition = "none";
    document.getElementById("minute").style.transform = `rotate(0deg)`;
    minreset = false;
    return;
  }
  if(hourreset)
  {
    document.getElementById("hour").style.transition = "none";
    document.getElementById("hour").style.transform = `rotate(0deg)`;
    hourreset = false;
    return;
  }
  if(cumulativeSecondRotation == 0)
  {
    document.getElementById("second").style.transition = "transform 1s ease";
    document.getElementById("second").style.transform = `rotate(361deg)`;
    secondreset = true;
  }
  else if(secondreset != true)
  {
    document.getElementById("second").style.transition = "transform 1s ease";
    document.getElementById("second").style.transform = `rotate(${cumulativeSecondRotation}deg)`;
  }
  if(cumulativeMinuteRotation == 0)
  {
    document.getElementById("minute").style.transition = "transform 1s ease";
    document.getElementById("minute").style.transform = `rotate(361deg)`;
    minreset = true;
  }
  else if(minreset != true)
  {
    document.getElementById("minute").style.transition = "transform 1s ease";
    document.getElementById("minute").style.transform = `rotate(${cumulativeMinuteRotation}deg)`;
  }
  if(cumulativeHourRotation == 0)
  {

    document.getElementById("hour").style.transition = "transform 1s ease";
    document.getElementById("hour").style.transform = `rotate(361deg)`;
    hourreset = true;
  }
  else if(hourreset != true)
  {
    document.getElementById("hour").style.transition = "transform 1s ease"; // Transition fluide
    document.getElementById("hour").style.transform = `rotate(${cumulativeHourRotation}deg)`;
  }
  // Update date immediately
  updateDate();
}

function getGreeting()
{
  const currentHour = new Date().getHours();
  let greetingKey;

  // Determine the greeting key based on the current hour
  if(currentHour < 12)
  {
    greetingKey = "morning";
  }
  else if(currentHour < 17)
  {
    greetingKey = "afternoon";
  }
  else
  {
    greetingKey = "evening";
  }

  // Get the user's language setting
  const userLang = getLanguageStatus("selectedLanguage") || "en"; // Default to English

  // Check if the greeting is available for the selected language
  if(
    translations[userLang] &&
    translations[userLang].greeting &&
    translations[userLang].greeting[greetingKey]
  )
  {
    return translations[userLang].greeting[greetingKey];
  }
  else
  {
    // Fallback to English greeting if the userLang or greeting key is missing
    return translations["en"].greeting[greetingKey];
  }
}

function updatedigiClock()
{
  const hourformatstored = localStorage.getItem("hourformat");
  let hourformat = hourformatstored === "true"; // Default to false if null
  const greetingCheckbox = document.getElementById("greetingcheckbox");
  const isGreetingEnabled = localStorage.getItem("greetingEnabled") === "true";
  greetingCheckbox.checked = isGreetingEnabled;

  const now = new Date();
  const dayOfWeek = now.getDay(); // Get day of the week (0-6)
  const dayOfMonth = now.getDate(); // Get current day of the month (1-31)

  const currentLanguage = getLanguageStatus("selectedLanguage") || "en";

  // Get translated day name
  let dayName;
  if(
    translations[currentLanguage] &&
    translations[currentLanguage].days &&
    translations[currentLanguage].days[dayOfWeek]
  )
  {
    dayName = translations[currentLanguage].days[dayOfWeek];
  }
  else
  {
    dayName = translations["en"].days[dayOfWeek]; // Fallback to English day name
  }

  // Localize the day of the month
  const localizedDayOfMonth = localizeNumbers(dayOfMonth.toString(), currentLanguage);

  // Determine the translated short date string based on language
  const dateFormats = {
    bn: `${dayName}, ${localizedDayOfMonth}`,
    mr: `${dayName}, ${localizedDayOfMonth}`,
    zh: `${dayOfMonth}日${dayName}`,
    cs: `${dayName}, ${dayOfMonth}.`,
    hi: `${dayName}, ${dayOfMonth}`,
    ja: `${dayOfMonth} ${dayName.substring(0, 1)}`,
    ko: `${dayOfMonth} ${dayName.substring(0, 1)}`,
    pt: `${dayName}, ${dayOfMonth}`,
    ru: `${dayOfMonth} ${dayName.substring(0, 2)}`,
    vi: `${dayOfMonth} ${dayName}`,
    idn: `${dayOfMonth} ${dayName}`,
    default: `${localizedDayOfMonth} ${dayName.substring(0, 3)}` // e.g., "24 Thu"
  };
  const dateString = dateFormats[currentLanguage] || dateFormats.default;

  // Handle time formatting based on the selected language
  let timeString;
  let period = ""; // For storing AM/PM equivalent

  // Array of languages to use 'en-US' format
  const specialLanguages = ["tr", "zh", "ja", "ko"]; // Languages with NaN in locale time format
  const localizedLanguages = ["bn", "mr"];
  // Force the 'en-US' format for Bengali, otherwise, it will be localized twice, resulting in NaN

  // Set time options and determine locale based on the current language
  const timeOptions = {hour: "2-digit", minute: "2-digit", hour12: hourformat};
  const locale = specialLanguages.includes(currentLanguage) || localizedLanguages.includes(currentLanguage) ? "en-US" :
    currentLanguage;
  timeString = now.toLocaleTimeString(locale, timeOptions);

  // Split the time and period (AM/PM) if in 12-hour format
  if(hourformat)
  {
    [timeString, period] = timeString.split(" "); // Split AM/PM if present
  }

  // Split the hours and minutes from the localized time string
  let [hours, minutes] = timeString.split(":");

  // Remove leading zero from hours for specific languages in 12-hour format only
  if(hourformat && currentLanguage !== "en")
  {
    hours = parseInt(hours, 10).toString(); // Remove leading zero
  }

  // Localize hours and minutes for the selected language
  const localizedHours = localizeNumbers(hours, currentLanguage);
  const localizedMinutes = localizeNumbers(minutes, currentLanguage);

  // Update the hour, colon, and minute text elements
  document.getElementById("digihours").textContent = localizedHours;
  document.getElementById("digicolon").textContent = ":"; // Static colon
  document.getElementById("digiminutes").textContent = localizedMinutes;

  // Manually set the period for special languages if 12-hour format is enabled
  if(hourformat && specialLanguages.includes(currentLanguage))
  {
    period = parseInt(hours, 10) < 12 ? "AM" : "PM";
  }

  // Display AM/PM if in 12-hour format
  if(hourformat)
  {
    document.getElementById("amPm").textContent = period; // Show AM/PM based on calculated period
  }
  else
  {
    document.getElementById("amPm").textContent = ""; // Clear AM/PM for 24-hour format
  }

  // Update the translated date
  document.getElementById("digidate").textContent = dateString;

  const clocktype1 = localStorage.getItem("clocktype");
  if(clocktype1 === "digital" && isGreetingEnabled)
  {
    document.getElementById("date").innerText = getGreeting();
  }
  else if(clocktype1 === "digital")
  {
    document.getElementById("date").innerText = ""; // Hide the greeting
  }
}

// Function to start the clock
function startClock()
{
  if(!intervalId)
  { // Only set interval if not already set
    intervalId = setInterval(updateanalogclock, 500);
  }
}

// Function to stop the clock
function stopClock()
{
  clearInterval(intervalId);
  intervalId = null; // Reset intervalId
}

// Initial clock display
displayClock();
setInterval(updatedigiClock, 1000); // Update digital clock every second

// Start or stop clocks based on clock type and visibility state
if(clocktype === "digital")
{
  updatedigiClock();
}
else if(clocktype === "analog")
{
  if(document.visibilityState === "visible")
  {
    startClock();
    updateDate(); // Immediately update date when clock is analog
  }
}

// Event listener for visibility change
document.addEventListener("visibilitychange", function()
{
  if(document.visibilityState === "visible")
  {
    startClock(); // Start the clock if the tab is focused
    updateDate(); // Update date when the tab becomes visible
  }
  else
  {
    stopClock(); // Stop the clock if the tab is not focused
  }
});

function displayClock()
{
  const analogClock = document.getElementById("analogClock");
  const digitalClock = document.getElementById("digitalClock");

  if(clocktype === "analog")
  {
    analogClock.style.display = "block"; // Show the analog clock
    digitalClock.style.display = "none";  // Hide the digital clock
  }
  else if(clocktype === "digital")
  {
    digitalClock.style.display = "block";  // Show the digital clock
    analogClock.style.display = "none";     // Hide the analog clock
  }
}

// Call updateanalogclock when the document is fully loaded
document.addEventListener("DOMContentLoaded", function()
{
  updateanalogclock();
});

// End of clock display

document.addEventListener("DOMContentLoaded", () =>
{
  const userTextDiv = document.getElementById("userText");
  const userTextCheckbox = document.getElementById("userTextCheckbox");

  // Load and apply the checkbox state
  const isUserTextVisible = localStorage.getItem("userTextVisible") !== "false";
  userTextCheckbox.checked = isUserTextVisible;
  userTextDiv.style.display = isUserTextVisible ? "block" : "none";

  // Toggle userText display based on checkbox state
  userTextCheckbox.addEventListener("change", () =>
  {
    const isVisible = userTextCheckbox.checked;
    userTextDiv.style.display = isVisible ? "block" : "none";
    localStorage.setItem("userTextVisible", isVisible);
  });

  // Set the default language to English if no language is saved
  const savedLang = localStorage.getItem("selectedLanguage") || "en";
  applyLanguage(savedLang);

  // Load the stored text if it exists
  const storedValue = localStorage.getItem("userText");
  if(storedValue)
  {
    userTextDiv.textContent = storedValue;
  }
  else
  {
    // Fallback to the placeholder based on the selected language
    const placeholder = userTextDiv.dataset.placeholder || translations["en"].userText; // Fallback to English
    userTextDiv.textContent = placeholder;
  }

  // Handle input event
  userTextDiv.addEventListener("input", function()
  {
    localStorage.setItem("userText", userTextDiv.textContent);
  });

  // Remove placeholder text when the user starts editing
  userTextDiv.addEventListener("focus", function()
  {
    if(userTextDiv.textContent === userTextDiv.dataset.placeholder)
    {
      userTextDiv.textContent = "";  // Clear the placeholder when focused
    }
  });

  // Restore placeholder if the user leaves the div empty after editing
  userTextDiv.addEventListener("blur", function()
  {
    if(userTextDiv.textContent === "")
    {
      userTextDiv.textContent = userTextDiv.dataset.placeholder;  // Show the placeholder again if empty
    }
  });
});

// Showing border or outline when you click on the searchbar
const searchbar = document.getElementById("searchbar");
searchbar.addEventListener("click", function(event)
{
  event.stopPropagation(); // Stop the click event from propagating to the document
  searchbar.classList.add("active");
});

document.addEventListener("click", function(event)
{
  // Check if the clicked element is not the searchbar
  if(!searchbar.contains(event.target))
  {
    searchbar.classList.remove("active");
  }
});

// Search function
document.addEventListener("DOMContentLoaded", () =>
{
  const enterBTN = document.getElementById("enterBtn");
  const searchInput = document.getElementById("searchQ");
  const searchEngineRadio = document.getElementsByName("search-engine");

  // Make entire search-engine div clickable
  document.querySelectorAll(".search-engine").forEach((engineDiv) =>
  {
    engineDiv.addEventListener("click", () =>
    {
      const radioButton = engineDiv.querySelector("input[type=\"radio\"]");
      radioButton.checked = true;
      localStorage.setItem("selectedSearchEngine", radioButton.value);
    });
  });

  // Function to perform search
  function performSearch()
  {
    var selectedOption = document.querySelector("input[name=\"search-engine\"]:checked").value;
    var searchTerm = searchInput.value;
    var searchEngines = {
      engine1: "https://www.google.com/search?q=",
      engine2: "https://duckduckgo.com/?q=",
      engine3: "https://bing.com/?q=",
      engine4: "https://search.brave.com/search?q=",
      engine5: "https://www.youtube.com/results?search_query="
    };

    if(searchTerm !== "")
    {
      var searchUrl = searchEngines[selectedOption] + encodeURIComponent(searchTerm);
      window.location.href = searchUrl;
    }
  }

  // Event listeners
  enterBTN.addEventListener("click", performSearch);

  searchInput.addEventListener("keypress", (event) =>
  {
    if(event.key === "Enter")
    {
      performSearch();
    }
  });

  // Set selected search engine from local storage
  const storedSearchEngine = localStorage.getItem("selectedSearchEngine");
  if(storedSearchEngine)
  {
    const selectedRadioButton = document.querySelector(`input[name="search-engine"][value="${storedSearchEngine}"]`);
    if(selectedRadioButton)
    {
      selectedRadioButton.checked = true;
    }
  }

  // Event listener for search engine radio buttons
  searchEngineRadio.forEach((radio) =>
  {
    radio.addEventListener("change", () =>
    {
      const selectedOption = document.querySelector("input[name=\"search-engine\"]:checked").value;
      localStorage.setItem("selectedSearchEngine", selectedOption);
    });
  });
  // -----Theme stay changed even if user reload the page---
  //  🔴🟠🟡🟢🔵🟣⚫️⚪️🟤
  const storedTheme = localStorage.getItem(themeStorageKey);
  if(storedTheme)
  {
    applySelectedTheme(storedTheme);
    const selectedRadioButton = document.querySelector(`.colorPlate[value="${storedTheme}"]`);
    if(selectedRadioButton)
    {
      selectedRadioButton.checked = true;
    }
  }
});

//  -----------Voice Search------------
// Function to detect Chrome and Edge on desktop
function isSupportedBrowser()
{
  const userAgent = navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isEdge = /Edg/.test(userAgent);
  const isDesktop = !/Android|iPhone|iPad|iPod/.test(userAgent); // Check if the device is not mobile
  const isBrave = navigator.brave && navigator.brave.isBrave; // Detect Brave

  return (isChrome || isEdge) && isDesktop && !isBrave;
}

// Set the initial state of the mic icon and checkbox based on saved state or supported browser
const micIcon = document.getElementById("micIcon");
const micIconCheckbox = document.getElementById("micIconCheckbox");

// Check if there's a saved state in localStorage
const savedState = localStorage.getItem("micIconVisible");
let isMicIconVisible;

// If saved state exists, use it; otherwise, fallback to initial state based on browser support
if(savedState !== null)
{
  isMicIconVisible = savedState === "true";
}
else
{
  // Default state: Hide mic icon if browser is not supported
  isMicIconVisible = isSupportedBrowser();
  // Save the initial state based on the user agent
  localStorage.setItem("micIconVisible", isMicIconVisible);
}

// Set the checkbox state based on the saved or default state
micIconCheckbox.checked = !isMicIconVisible; // Checked hides the mic icon
micIcon.style.visibility = isMicIconVisible ? "visible" : "hidden";

// Function to toggle mic icon visibility
function toggleMicIconVisibility(isVisible)
{
  micIcon.style.visibility = isVisible ? "visible" : "hidden";
  localStorage.setItem("micIconVisible", isVisible); // Save to localStorage
}

// Toggle mic icon display based on checkbox state
micIconCheckbox.addEventListener("change", () =>
{
  const isChecked = micIconCheckbox.checked;
  toggleMicIconVisibility(!isChecked); // Checked hides the mic icon

  // Only initialize Web Speech API if the mic icon is visible
  if(!isChecked)
  {
    initializeSpeechRecognition();
  }
});

// Function to initialize Web Speech API if supported
function initializeSpeechRecognition()
{
  const searchInput = document.getElementById("searchQ");
  const resultBox = document.getElementById("resultBox");
  const currentLanguage = getLanguageStatus("selectedLanguage") || "en";

  // Check if the browser supports SpeechRecognition API
  const isSpeechRecognitionAvailable = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  if(isSpeechRecognitionAvailable)
  {
    // Initialize SpeechRecognition (cross-browser compatibility)
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;  // Stop recognition after first result
    recognition.interimResults = true; // Enable interim results for live transcription
    recognition.lang = currentLanguage; // Set the language dynamically based on selected language

    let isRecognizing = false; // Flag to check if recognition is active

    // When speech recognition starts
    recognition.onstart = () =>
    {
      isRecognizing = true; // Set the flag to indicate recognition is active
      const selectedRadio = document.querySelector(".colorPlate:checked");
      if(selectedRadio.value !== "dark")
      {
        micIcon.style.color = "var(--darkerColor-blue)";
        // micIcon.style.transform = 'scale(1.05)';
      }
      searchInput.placeholder =
        `${translations[currentLanguage]?.listenPlaceholder || translations["en"].listenPlaceholder}`;
      micIcon.classList.add("micActive");
    };

    // When speech recognition results are available (including interim results)
    recognition.onresult = (event) =>
    {
      let transcript = "";
      // Loop through results to build the transcript text
      for(let i = 0; i < event.results.length; i++)
      {
        transcript += event.results[i][0].transcript; // Append each piece of the transcript
      }
      // Display the interim result in the search input
      searchInput.value = transcript;
      // If the result is final, hide the result box
      if(event.results[event.results.length - 1].isFinal)
      {
        resultBox.style.display = "none"; // Hide result box after final input
      }
    };

    // When an error occurs during speech recognition
    recognition.onerror = (event) =>
    {
      console.error("Speech recognition error: ", event.error);
      isRecognizing = false; // Reset flag on error
    };

    // When speech recognition ends (either by user or automatically)
    recognition.onend = () =>
    {
      isRecognizing = false; // Reset the flag to indicate recognition has stopped
      micIcon.style.color = "var(--darkColor-blue)"; // Reset mic color
      // micIcon.style.transform = 'scale(1)'; // Reset scaling
      micIcon.classList.remove("micActive");
      searchInput.placeholder =
        `${translations[currentLanguage]?.searchPlaceholder || translations["en"].searchPlaceholder}`;
    };

    // Start speech recognition when mic icon is clicked
    micIcon.addEventListener("click", () =>
    {
      if(isRecognizing)
      {
        recognition.stop(); // Stop recognition if it's already listening
      }
      else
      {
        recognition.start(); // Start recognition if it's not already listening
      }
    });
  }
  else
  {
    console.warn("Speech Recognition API not supported in this browser.");
  }
}

// Initialize SpeechRecognition only if the mic icon is visible
if(!micIconCheckbox.checked)
{
  initializeSpeechRecognition();
}
//  -----------End of Voice Search------------

// Function to apply the selected theme
const radioButtons = document.querySelectorAll(".colorPlate");
const themeStorageKey = "selectedTheme";
const storedTheme = localStorage.getItem(themeStorageKey);
// const radioButtons = document.querySelectorAll('.colorPlate');
// const themeStorageKey = 'selectedTheme'; // For predefined themes
const customThemeStorageKey = "customThemeColor"; // For color picker
// const storedTheme = localStorage.getItem(themeStorageKey);
const storedCustomColor = localStorage.getItem(customThemeStorageKey);

let darkThemeStyleTag; // Variable to store the dynamically added style tag

const resetDarkTheme = () =>
{
  // Remove the dark theme class
  document.documentElement.classList.remove("dark-theme");

  // Remove the injected dark theme style tag
  if(darkThemeStyleTag)
  {
    darkThemeStyleTag.remove();
    darkThemeStyleTag = null;
  }

  // Reset inline styles that were applied specifically for dark mode
  const resetElements = [
    "searchQ",
    "searchIconDark",
    "darkFeelsLikeIcon",
    "menuButton",
    "menuCloseButton",
    "closeBtnX"
  ];

  resetElements.forEach((id) =>
  {
    const element = document.getElementById(id);
    if(element)
    {
      element.removeAttribute("style");
    }
  });

  // Reset fill color for elements with the class "accentColor"
  const accentElements = document.querySelectorAll(".accentColor");
  accentElements.forEach((element) =>
  {
    element.style.fill = ""; // Reset fill color
  });
  // Reset the CSS variables to default (for non-dark themes)
  document.documentElement.style.setProperty("--bg-color-blue", "#ffffff");
  document.documentElement.style.setProperty("--accentLightTint-blue", "#E2EEFF");
  document.documentElement.style.setProperty("--darkerColor-blue", "#3569b2");
  document.documentElement.style.setProperty("--darkColor-blue", "#4382EC");
  document.documentElement.style.setProperty("--textColorDark-blue", "#1b3041");
  document.documentElement.style.setProperty("--whitishColor-blue", "#ffffff");
};

const applySelectedTheme = (colorValue) =>
{
  // If the selected theme is not dark, reset dark theme styles
  if(colorValue !== "dark")
  {
    resetDarkTheme();

    // Apply styles for other themes (not dark)
    if(colorValue === "blue")
    {
      document.documentElement.style.setProperty("--bg-color-blue", "#BBD6FD");
      document.documentElement.style.setProperty("--accentLightTint-blue", "#E2EEFF");
      document.documentElement.style.setProperty("--darkerColor-blue", "#3569b2");
      document.documentElement.style.setProperty("--darkColor-blue", "#4382EC");
      document.documentElement.style.setProperty("--textColorDark-blue", "#1b3041");
      document.documentElement.style.setProperty("--whitishColor-blue", "#ffffff");
    }
    else
    {
      document.documentElement.style.setProperty("--bg-color-blue", `var(--bg-color-${colorValue})`);
      document.documentElement.style.setProperty("--accentLightTint-blue", `var(--accentLightTint-${colorValue})`);
      document.documentElement.style.setProperty("--darkerColor-blue", `var(--darkerColor-${colorValue})`);
      document.documentElement.style.setProperty("--darkColor-blue", `var(--darkColor-${colorValue})`);
      document.documentElement.style.setProperty("--textColorDark-blue", `var(--textColorDark-${colorValue})`);
      document.documentElement.style.setProperty("--whitishColor-blue", `var(--whitishColor-${colorValue})`);
    }
  }

  // If the selected theme is dark
  else if(colorValue === "dark")
  {
    // Apply dark theme styles using CSS variables
    document.documentElement.style.setProperty("--bg-color-blue", `var(--bg-color-${colorValue})`);
    document.documentElement.style.setProperty("--accentLightTint-blue", `var(--accentLightTint-${colorValue})`);
    document.documentElement.style.setProperty("--darkerColor-blue", `var(--darkerColor-${colorValue})`);
    document.documentElement.style.setProperty("--darkColor-blue", `var(--darkColor-${colorValue})`);
    document.documentElement.style.setProperty("--textColorDark-blue", `var(--textColorDark-${colorValue})`);

    // Add dark theme styles for specific elements
    darkThemeStyleTag = document.createElement("style");
    darkThemeStyleTag.textContent = `
            .dark-theme .search-engine input[type="radio"]:checked {
                background-color: #2a2a2a;
                border: 2px solid #919191;
            }

            .dark-theme .search-engine input[type="radio"] {
                background-color: #9d9d9d   ;
                border: 0px solid #000000;
            }

            .dark-theme .colorsContainer {
                background-color: #212121;
            }

            .dark-theme #themeButton {
                background-color: #212121;
            }

            .dark-theme #themeIconSvg, .dark-theme #languageSelectorIconSvg {
                fill: #cdcdcd !important;
            }

            .dark-theme .languageIcon,
            .dark-theme .languageSelector {
                background-color: #212121;
                scrollbar-color: var(--darkerColor-blue) transparent;
            }

            .dark-theme .languageSelector::-webkit-scrollbar-thumb,
            .dark-theme .languageSelector::-webkit-scrollbar-thumb:hover {
                background-color: var(--darkerColor-blue);
            }

            .dark-theme .bottom a {
                color: #a1a1a1;
            }

            .dark-theme .ttcont input {
                background-color: #212121 !important;
            }

            .dark-theme input:checked + .toggle {
                background-color: #aaaaaa;
            }

            .dark-theme .tilesCont .tiles {
                color: #e8e8e8;
            }

            #searchQ{
            color: #fff;
            }

            .searchbar.active {
                outline: 2px solid #696969;
            }

            #searchIconDark {
                fill: #bbb !important;
            }

            .tilesContainer .tiles {
                background-color: #212121;
            }

            #darkFeelsLikeIcon{
                fill: #fff !important;
            }

            .humidityBar .thinLine{
                background-color: #aaaaaa;
            }

            .search-engine .darkIconForDarkTheme, .aiDarkIcons{
                fill: #bbbbbb !important;
            }

            .divider{
                background-color: #cdcdcd;
            }
    
            .shorcutDarkColor{
                fill: #3c3c3c !important;
            }

            #darkLightTint{
                fill: #bfbfbf;
            }

            .strokecolor {
	            stroke: #3c3c3c;
            }

            .shortcutsContainer .shortcuts .shortcutLogoContainer {
                background: radial-gradient(circle, #bfbfbf 44%, #000 64%);
            }

            .digiclock {
                fill: #909090;
            }
	    
	          #userText, #date, .shortcuts .shortcut-name {
	              text-shadow: 1px 1px 15px rgba(15, 15, 15, 0.9),
	 		            -1px -1px 15px rgba(15, 15, 15, 0.9),
    			        1px -1px 15px rgba(15, 15, 15, 0.9),
       			      -1px 1px 15px rgba(15, 15, 15, 0.9) !important;
            }

     	    .uploadButton,
            .randomButton{
	            background-color: var(--whitishColor-dark);
	            color: var(--darkColor-blue);
            }

            .uploadButton:hover,
            .randomButton:hover,
            .clearButton{
                background-color: var(--darkColor-blue);
                color: var(--whitishColor-dark);
            }

            .clearButton:hover{
                background-color: var(--whitishColor-dark) !important;
            }

     	    .micIcon{
                background-color: var(--whitishColor-dark);
            }

            #minute, #minute::after, #second::after {
                background-color: #909090;
            }

            .dot-icon {
                fill: #bfbfbf;
            }

            .menuicon{
                color: #c2c2c2;
            }

            #menuButton::before{
                background-color: #bfbfbf;
            }
            
            #menuButton::after{
                border: 4px solid #858585;
            }

            #menuCloseButton, #menuCloseButton:hover {
                background-color: var(--darkColor-dark);
            }

            #menuCloseButton .icon{
                background-color: #cdcdcd;
            }

            #closeBtnX{
                border: 2px solid #bdbdbd;
                border-radius: 100px;
            }

            body{
                background-color: #191919
            }
            
            #HangNoAlive{
                fill: #c2c2c2 !important;
            }

            .tempUnit{
                color: #dadada;
            }

            .dark-theme #githab,
            .dark-theme #sujhaw {
                fill: #b1b1b1;
            }

            .resultItem.active {
                background-color: var(--darkColor-dark);;
            }
        `;
    document.head.appendChild(darkThemeStyleTag);

    // Apply dark theme class
    document.documentElement.classList.add("dark-theme");

    // Change fill color for elements with the class "accentColor"
    const accentElements = document.querySelectorAll(".accentColor");
    accentElements.forEach((element) =>
    {
      element.style.fill = "#212121";
    });
  }

  // Change the extension icon based on the selected theme
  const iconPaths = [
    "blue",
    "yellow",
    "red",
    "green",
    "cyan",
    "orange",
    "purple",
    "pink",
    "brown",
    "silver",
    "grey",
    "dark"
  ]
  .reduce((acc, color) =>
  {
    acc[color] = `./favicon/${color}.png`;
    return acc;
  }, {});

  // Function to update the extension icon based on browser
  const updateExtensionIcon = (colorValue) =>
  {
    if(typeof chrome !== "undefined" && chrome.action)
    {
      // Chromium-based: Chrome, Edge, Brave
      chrome.action.setIcon({path: iconPaths[colorValue]});
    }
    else if(typeof browser !== "undefined" && browser.browserAction)
    {
      // Firefox
      browser.browserAction.setIcon({path: iconPaths[colorValue]});
    }
    else if(typeof safari !== "undefined")
    {
      // Safari
      safari.extension.setToolbarIcon({path: iconPaths[colorValue]});
    }
  };
  updateExtensionIcon(colorValue);

  // Change the favicon dynamically
  const faviconLink = document.querySelector("link[rel='icon']");
  if(faviconLink && iconPaths[colorValue])
  {
    faviconLink.href = iconPaths[colorValue];
  }
};

// ----Color Picker || ColorPicker----
function darkenHexColor(hex, factor = 0.6)
{
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.floor(r * (1 - factor));
  g = Math.floor(g * (1 - factor));
  b = Math.floor(b * (1 - factor));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

function lightenHexColor(hex, factor = 0.85)
{
  hex = hex.replace("#", "");
  if(hex.length === 3)
  {
    hex = hex.split("").map(c => c + c).join("");
  }
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.floor(r + (255 - r) * factor);
  g = Math.floor(g + (255 - g) * factor);
  b = Math.floor(b + (255 - b) * factor);
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
}

function lightestColor(hex, factor = 0.95)
{
  hex = hex.replace("#", "");
  if(hex.length === 3)
  {
    hex = hex.split("").map(c => c + c).join("");
  }
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = Math.floor(r + (255 - r) * factor);
  g = Math.floor(g + (255 - g) * factor);
  b = Math.floor(b + (255 - b) * factor);
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase()}`;
}

function isNearWhite(hex, threshold = 240)
{
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return r > threshold && g > threshold && b > threshold;
}

// ---- Color Picker || ColorPicker----

const applyCustomTheme = (color) =>
{

  adjustedColor = color;
  if(isNearWhite(color))
  {
    adjustedColor = "#696969"; // Light gray if near white
  }
  const darkerColorHex = darkenHexColor(adjustedColor);
  const lighterColorHex = lightenHexColor(adjustedColor, 0.85);
  const lightTin = lightestColor(adjustedColor, 0.95);

  // resetDarkTheme();
  document.documentElement.style.setProperty("--bg-color-blue", lighterColorHex);
  document.documentElement.style.setProperty("--accentLightTint-blue", lightTin);
  document.documentElement.style.setProperty("--darkerColor-blue", darkerColorHex);
  document.documentElement.style.setProperty("--darkColor-blue", adjustedColor);
  document.documentElement.style.setProperty("--textColorDark-blue", darkerColorHex);
  document.documentElement.style.setProperty("--whitishColor-blue", "#ffffff");
  document.getElementById("rangColor").style.borderColor = color;
  document.getElementById("dfChecked").checked = false;
};

// Load theme on page reload// Load theme on page reload
window.addEventListener("load", function()
{
  // console.log('Page loaded, stored theme:', storedTheme);
  // console.log('Page loaded, stored custom color:', storedCustomColor);
  if(storedTheme)
  {
    applySelectedTheme(storedTheme);
  }
  else if(storedCustomColor)
  {
    applyCustomTheme(storedCustomColor);
  }
});

// Handle radio button changes
const handleThemeChange = function()
{
  if(this.checked)
  {
    const colorValue = this.value;
    // console.log('Radio button changed, selected theme:', colorValue);
    localStorage.setItem(themeStorageKey, colorValue);
    localStorage.removeItem(customThemeStorageKey); // Clear custom theme
    applySelectedTheme(colorValue);
  }
};

// Remove any previously attached listeners and add only one
radioButtons.forEach(radioButton =>
{
  radioButton.removeEventListener("change", handleThemeChange); // Remove if already attached
  radioButton.addEventListener("change", handleThemeChange);    // Add fresh listener
});

// Handle color picker changes
const handleColorPickerChange = function(event)
{
  const selectedColor = event.target.value;
  // console.log('Color picker changed, selected color:', selectedColor);
  resetDarkTheme(); // Clear dark theme if active
  localStorage.setItem(customThemeStorageKey, selectedColor); // Save custom color
  localStorage.removeItem(themeStorageKey); // Clear predefined theme
  applyCustomTheme(selectedColor);

  // Uncheck all radio buttons
  radioButtons.forEach(radio =>
  {
    radio.checked = false;
  });
};

// Add listeners for color picker
colorPicker.removeEventListener("input", handleColorPickerChange); // Ensure no duplicate listeners
colorPicker.addEventListener("input", handleColorPickerChange);
// colorPicker.addEventListener('change', function () {
//     // console.log('Final color applied:', colorPicker.value);
//     location.reload();
// });

// end of Function to apply the selected theme

// ------------ Wallpaper ----------------------------------------------------------------
// Constants for database and storage
const dbName = "ImageDB";
const storeName = "backgroundImages";
const timestampKey = "lastUpdateTime"; // Key to store last update time
const imageTypeKey = "imageType"; // Key to store the type of image ('random' or 'upload')

// Open IndexedDB database
function openDatabase()
{
  return new Promise((resolve, reject) =>
  {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = function(event)
    {
      const db = event.target.result;
      db.createObjectStore(storeName);
    };
    request.onsuccess = function(event)
    {
      resolve(event.target.result);
    };
    request.onerror = function(event)
    {
      reject("Database error: " + event.target.errorCode);
    };
  });
}

// Save image data, timestamp, and type to IndexedDB
async function saveImageToIndexedDB(imageUrl, isRandom)
{
  const db = await openDatabase();
  return await new Promise((resolve, reject) =>
  {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    store.put(imageUrl, "backgroundImage");
    store.put(new Date().toISOString(), timestampKey);
    store.put(isRandom ? "random" : "upload", imageTypeKey);

    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject("Transaction error: " + event.target.errorCode);
  });
}

// Load image, timestamp, and type from IndexedDB
async function loadImageAndDetails()
{
  const db = await openDatabase();
  return await Promise.all([
    new Promise((resolve, reject) =>
    {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get("backgroundImage");

      request.onsuccess = (event) => resolve(request.result);
      request.onerror = (event_1) => reject("Request error: " + event_1.target.errorCode);
    }),
    new Promise((resolve_1, reject_1) =>
    {
      const transaction_1 = db.transaction(storeName, "readonly");
      const store_1 = transaction_1.objectStore(storeName);
      const request_1 = store_1.get(timestampKey);

      request_1.onsuccess = (event_2) => resolve_1(request_1.result);
      request_1.onerror = (event_3) => reject_1("Request error: " + event_3.target.errorCode);
    }),
    new Promise((resolve_2, reject_2) =>
    {
      const transaction_2 = db.transaction(storeName, "readonly");
      const store_2 = transaction_2.objectStore(storeName);
      const request_2 = store_2.get(imageTypeKey);

      request_2.onsuccess = (event_4) => resolve_2(request_2.result);
      request_2.onerror = (event_5) => reject_2("Request error: " + event_5.target.errorCode);
    })
  ]);
}

// Load only the background image
async function loadImageFromIndexedDB()
{
  const db = await openDatabase();
  return await new Promise((resolve, reject) =>
  {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get("backgroundImage");

    request.onsuccess = (event) => resolve(request.result);
    request.onerror = (event_1) => reject("Request error: " + event_1.target.errorCode);
  });
}

// Clear image data from IndexedDB
async function clearImageFromIndexedDB()
{
  const db = await openDatabase();
  return await new Promise((resolve, reject) =>
  {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.delete("backgroundImage");

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject("Delete error: " + event.target.errorCode);
  });
}

// Handle file input and save image as upload
document.getElementById("imageUpload").addEventListener("change", function(event)
{
  const file = event.target.files[0];
  if(file)
  {
    const reader = new FileReader();
    reader.onload = function(e)
    {
      const image = new Image();
      image.onload = function()
      {
        const totalPixels = image.width * image.height;
        if(totalPixels > 2073600)
        {
          alert(`Warning: The uploaded image dimensions (${image.width}x${image.height}) exceed (1920x1080) pixels. ` +
            `This may impact performance or image may fail to load properly.`);
        }
        document.body.style.setProperty("--bg-image", `url(${e.target.result})`);
        saveImageToIndexedDB(e.target.result, false)
        .then(() => updateTextShadow(true))
        .catch(error => console.error(error));
      };
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Fetch and apply random image as background
const RANDOM_IMAGE_URL = "https://picsum.photos/1920/1080";

async function applyRandomImage(showConfirmation = true)
{
  if(showConfirmation && !confirm("Would you like to set a new image as your wallpaper for the day?"))
  {
    return;
  }
  try
  {
    const response = await fetch(RANDOM_IMAGE_URL);
    const imageUrl = response.url;
    document.body.style.setProperty("--bg-image", `url(${imageUrl})`);
    await saveImageToIndexedDB(imageUrl, true);
    updateTextShadow(true);
  }
  catch(error)
  {
    console.error("Error fetching random image:", error);
  }
}

// Function to update text-shadow styles with animation
function updateTextShadow(hasWallpaper)
{
  const elements = [
    document.getElementById("userText"),
    document.getElementById("date"),
    ...document.querySelectorAll(".shortcuts:hover .shortcut-name")
  ];
  elements.forEach(element =>
  {
    if(hasWallpaper)
    {
      element.style.textShadow = "1px 1px 15px rgba(255, 255, 255, 0.9), " +
        "-1px -1px 15px rgba(255, 255, 255, 0.9), " +
        "1px -1px 15px rgba(255, 255, 255, 0.9), " +
        "-1px 1px 15px rgba(255, 255, 255, 0.9)";
    }
    else
    {
      element.style.textShadow = "none"; // Remove the text-shadow
    }
  });
}

// Check and update image on page load
function checkAndUpdateImage()
{
  loadImageAndDetails()
  .then(([savedImage, savedTimestamp, imageType]) =>
  {
    const now = new Date();
    const lastUpdate = new Date(savedTimestamp);

    if(!savedTimestamp || isNaN(lastUpdate))
    {
      updateTextShadow(false);
      return;
    }

    if(!savedImage || imageType === "upload")
    {
      document.body.style.setProperty("--bg-image", `url(${savedImage})`);
      document.body.style.backgroundImage = `var(--bg-image)`;
      updateTextShadow(true);
      return;
    }

    if(lastUpdate.toDateString() !== now.toDateString())
    {
      applyRandomImage(false);
    }
    else
    {
      document.body.style.setProperty("--bg-image", `url(${savedImage})`);
      updateTextShadow(true);
    }
  })
  .catch((error) =>
  {
    console.error(error);
    updateTextShadow(false);
  });
}

// Event listeners for buttons
document.getElementById("uploadTrigger")
.addEventListener("click", () => document.getElementById("imageUpload").click());
document.getElementById("clearImage").addEventListener("click", function()
{
  loadImageFromIndexedDB()
  .then((savedImage) =>
  {
    if(savedImage)
    {
      if(confirm("Are you sure you want to clear the background image?"))
      {
        clearImageFromIndexedDB()
        .then(() =>
        {
          document.body.style.removeProperty("--bg-image");
          updateTextShadow(false);
        })
        .catch((error) => console.error(error));
      }
    }
    else
    {
      alert("No background image is currently set.");
    }
  })
  .catch((error) => console.error(error));
});
document.getElementById("randomImageTrigger").addEventListener("click", applyRandomImage);

// Start image check on page load
checkAndUpdateImage();

// ------- End of BG Image -------------------------------------------

// when User click on "AI-Tools"
const element = document.getElementById("toolsCont");
const shortcuts = document.getElementById("shortcutsContainer");

function toggleShortcuts(event)
{
  const shortcutsCheckbox = document.getElementById("shortcutsCheckbox");

  if(shortcutsCheckbox.checked)
  {
    if(element.style.display === "flex")
    {
      shortcuts.style.display = "flex";
      element.style.opacity = "0";
      element.style.gap = "0";
      element.style.transform = "translateX(-100%)";

      setTimeout(() =>
      {
        element.style.display = "none";
        shortcuts.style.display = "flex";
      }, 500);
    }
    else
    {
      shortcuts.style.display = "none";
      element.style.display = "flex";
      setTimeout(() =>
      {
        element.style.opacity = "1";
        element.style.transform = "translateX(0)";
      }, 1);
      setTimeout(() =>
      {
        element.style.gap = "12px";
      }, 300);
    }
  }
  else
  {
    if(element.style.display === "flex")
    {
      shortcuts.style.display = "none";
      element.style.opacity = "0";
      element.style.gap = "0";
      element.style.transform = "translateX(-100%)";
      setTimeout(() =>
      {
        element.style.display = "none";
      }, 500);
    }
    else
    {
      shortcuts.style.display = "none";
      element.style.display = "flex";
      setTimeout(() =>
      {
        element.style.opacity = "1";
        element.style.transform = "translateX(0)";
      }, 1);
      setTimeout(() =>
      {
        element.style.gap = "12px";
      }, 300);
    }
  }
  // Prevent outside click handler from triggering
  if(event)
  {
    event.stopPropagation();
  }
}

// Collapse when clicking outside toolsCont
document.addEventListener("click", (event) =>
{
  if(!element.contains(event.target) && element.style.display === "flex")
  {
    toggleShortcuts();
  }
});

document.getElementById("0NIHK").onclick = toggleShortcuts;

// ------------Search Suggestions---------------

// Show the result box
function showResultBox()
{
  resultBox.classList.add("show");
  resultBox.style.display = "block";
}

// Hide the result box
function hideResultBox()
{
  resultBox.classList.remove("show");
  //resultBox.style.display = "none";
}

showResultBox();
hideResultBox();

document.getElementById("searchQ").addEventListener("input", async function()
{
  const searchsuggestionscheckbox = document.getElementById("searchsuggestionscheckbox");
  if(searchsuggestionscheckbox.checked)
  {
    var selectedOption = document.querySelector("input[name=\"search-engine\"]:checked").value;
    var searchEngines = {
      engine1: "https://www.google.com/search?q=",
      engine2: "https://duckduckgo.com/?q=",
      engine3: "https://bing.com/?q=",
      engine4: "https://search.brave.com/search?q=",
      engine5: "https://www.youtube.com/results?search_query="
    };
    const query = this.value;
    const resultBox = document.getElementById("resultBox");

    if(query.length > 0)
    {
      try
      {
        // Fetch autocomplete suggestions
        const suggestions = await getAutocompleteSuggestions(query);

        if(suggestions == "")
        {
          hideResultBox();
        }
        else
        {
          // Clear the result box
          resultBox.innerHTML = "";

          // Add suggestions to the result box
          suggestions.forEach((suggestion, index) =>
          {
            const resultItem = document.createElement("div");
            resultItem.classList.add("resultItem");
            resultItem.textContent = suggestion;
            resultItem.setAttribute("data-index", index);
            resultItem.onclick = () =>
            {
              var resultlink = searchEngines[selectedOption] + encodeURIComponent(suggestion);
              window.location.href = resultlink;
            };
            resultBox.appendChild(resultItem);
          });
          showResultBox();
        }
      }
      catch(error)
      {
        // Handle the error (if needed)
      }
    }
    else
    {
      hideResultBox();
    }
  }
});

let isMouseOverResultBox = false;
// Track mouse entry and exit within the resultBox
resultBox.addEventListener("mouseenter", () =>
{
  isMouseOverResultBox = true;
  // Remove keyboard highlight
  const activeItem = resultBox.querySelector(".active");
  if(activeItem)
  {
    activeItem.classList.remove("active");
  }
});

resultBox.addEventListener("mouseleave", () =>
{
  isMouseOverResultBox = false;
});

document.getElementById("searchQ").addEventListener("keydown", function(e)
{
  if(isMouseOverResultBox)
  {
    return; // Ignore keyboard events if the mouse is in the resultBox
  }
  const activeItem = resultBox.querySelector(".active");
  let currentIndex = activeItem ? parseInt(activeItem.getAttribute("data-index")) : -1;

  if(resultBox.children.length > 0)
  {
    if(e.key === "ArrowDown")
    {
      e.preventDefault();
      if(activeItem)
      {
        activeItem.classList.remove("active");
      }
      currentIndex = (currentIndex + 1) % resultBox.children.length;
      resultBox.children[currentIndex].classList.add("active");

      // Ensure the active item is visible within the result box
      const activeElement = resultBox.children[currentIndex];
      activeElement.scrollIntoView({block: "nearest"});
    }
    else if(e.key === "ArrowUp")
    {
      e.preventDefault();
      if(activeItem)
      {
        activeItem.classList.remove("active");
      }
      currentIndex = (currentIndex - 1 + resultBox.children.length) % resultBox.children.length;
      resultBox.children[currentIndex].classList.add("active");

      // Ensure the active item is visible within the result box
      const activeElement = resultBox.children[currentIndex];
      activeElement.scrollIntoView({block: "nearest"});
    }
    else if(e.key === "Enter" && activeItem)
    {
      e.preventDefault();
      activeItem.click();
    }
  }
});

function getClientParam()
{
  const userAgent = navigator.userAgent.toLowerCase();

  // Check for different browsers and return the corresponding client parameter
  if(userAgent.includes("firefox"))
  {
    return "firefox";
  }
  else if(userAgent.includes("chrome") || userAgent.includes("crios"))
  {
    return "chrome";
  }
  else if(userAgent.includes("safari"))
  {
    return "safari";
  }
  else if(userAgent.includes("edge") || userAgent.includes("edg"))
  {
    return "firefox";
  }
  else if(userAgent.includes("opera") || userAgent.includes("opr"))
  {
    return "opera";
  }
  else
  {
    return "firefox";  // Default to Firefox client if the browser is not recognized
  }
}

async function getAutocompleteSuggestions(query)
{
  const clientParam = getClientParam(); // Get the browser client parameter dynamically
  var selectedOption = document.querySelector("input[name=\"search-engine\"]:checked").value;
  var searchEnginesapi = {
    engine1: `http://www.google.com/complete/search?client=${clientParam}&q=${encodeURIComponent(query)}`,
    engine2: `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`,
    engine3: `http://www.google.com/complete/search?client=${clientParam}&q=${encodeURIComponent(query)}`,
    engine4: `https://search.brave.com/api/suggest?q=${encodeURIComponent(query)}&rich=true&source=web`,
    engine5: `http://www.google.com/complete/search?client=${clientParam}&ds=yt&q=${encodeURIComponent(query)}`
  };
  const useproxyCheckbox = document.getElementById("useproxyCheckbox");
  let apiUrl = searchEnginesapi[selectedOption];
  if(useproxyCheckbox.checked)
  {
    apiUrl = `${proxyurl}/proxy?url=${encodeURIComponent(apiUrl)}`;
  }

  try
  {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if(selectedOption === "engine4")
    {
      const suggestions = data[1].map(item =>
      {
        if(item.is_entity)
        {
          return `${item.q} - ${item.name} (${item.category ? item.category : "No category"})`;
        }
        else
        {
          return item.q;
        }
      });
      return suggestions;
    }
    else
    {

      return data[1];
    }
  }
  catch(error)
  {
    console.error("Error fetching autocomplete suggestions:", error);
    return [];
  }
}

// Hide results when clicking outside
document.addEventListener("click", function(event)
{
  const searchbar = document.getElementById("searchbar");
  // const resultBox = document.getElementById("resultBox");

  if(!searchbar.contains(event.target))
  {
    hideResultBox();
  }
});
// ------------End of Search Suggestions---------------

// ------------Showing & Hiding Menu-bar ---------------
const menuButton = document.getElementById("menuButton");
const menuBar = document.getElementById("menuBar");
const menuCont = document.getElementById("menuCont");
const optCont = document.getElementById("optCont");
const overviewPage = document.getElementById("overviewPage");
const shortcutEditPage = document.getElementById("shortcutEditPage");

function pageReset()
{
  optCont.scrollTop = 0;
  overviewPage.style.transform = "translateX(0)";
  overviewPage.style.opacity = "1";
  overviewPage.style.display = "block";
  shortcutEditPage.style.transform = "translateX(120%)";
  shortcutEditPage.style.opacity = "0";
  shortcutEditPage.style.display = "none";
}

const closeMenuBar = () =>
{
  requestAnimationFrame(() =>
  {
    optCont.style.opacity = "0";
    optCont.style.transform = "translateX(100%)";
  });
  setTimeout(() =>
  {
    requestAnimationFrame(() =>
    {
      menuBar.style.opacity = "0";
      menuCont.style.transform = "translateX(100%)";
    });
  }, 14);
  setTimeout(() =>
  {
    menuBar.style.display = "none";
  }, 555);
};

const openMenuBar = () =>
{
  setTimeout(() =>
  {
    menuBar.style.display = "block";
    pageReset();
  });
  setTimeout(() =>
  {
    requestAnimationFrame(() =>
    {
      menuBar.style.opacity = "1";
      menuCont.style.transform = "translateX(0px)";
    });
  }, 7);
  setTimeout(() =>
  {
    requestAnimationFrame(() =>
    {
      optCont.style.opacity = "1";
      optCont.style.transform = "translateX(0px)";
    });
  }, 11);
};

menuButton.addEventListener("click", () =>
{
  if(menuBar.style.display === "none" || menuBar.style.display === "")
  {
    openMenuBar();
  }
  else
  {
    closeMenuBar();
  }
});

//   ----------Hiding Menu Bar--------
menuBar.addEventListener("click", (event) =>
{
  if(event.target === menuBar)
  {
    closeMenuBar();
  }
});

// Hiding Menu Bar when user click on close button --------
document.getElementById("menuCloseButton").onclick = () =>
{
  closeMenuBar();
};

// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", function()
{

  /* ------ Constants ------ */

  // maximum number of shortcuts allowed
  const MAX_SHORTCUTS_ALLOWED = 50;

  // minimum number of  shorcutDarkColor allowed
  const MIN_SHORTCUTS_ALLOWED = 1;

  // The new shortcut placeholder info
  const PLACEHOLDER_SHORTCUT_NAME = "New shortcut";
  const PLACEHOLDER_SHORTCUT_URL = "https://example.com";

  // The placeholder for an empty shortcut
  const SHORTCUT_NAME_PLACEHOLDER = "Shortcut Name";
  const SHORTCUT_URL_PLACEHOLDER = "Shortcut URL";

  const SHORTCUT_PRESET_NAMES = ["Youtube", "Gmail", "Telegram", "WhatsApp", "Instagram", "Twitter"];
  const SHORTCUT_PRESET_URLS_AND_LOGOS = new Map([
    [
      "youtube.com", `
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
            <path fill="#FF3D00" d="M43.2,33.9c-0.4,2.1-2.1,3.7-4.2,4c-3.3,0.5-8.8,1.1-15,1.1c-6.1,0-11.6-0.6-15-1.1c-2.1-0.3-3.8-1.9-4.2-4C4.4,31.6,4,28.2,4,24c0-4.2,0.4-7.6,0.8-9.9c0.4-2.1,2.1-3.7,4.2-4C12.3,9.6,17.8,9,24,9c6.2,0,11.6,0.6,15,1.1c2.1,0.3,3.8,1.9,4.2,4c0.4,2.3,0.9,5.7,0.9,9.9C44,28.2,43.6,31.6,43.2,33.9z"></path><path fill="#FFF" d="M20 31L20 17 32 24z"></path>
            </svg>`
    ], [
      "mail.google.com", `
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
            <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"></path><path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"></path><polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"></polygon><path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z"></path><path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z"></path>
            </svg>
            `
    ], [
      "web.telegram.org", `
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
            <path fill="#29b6f6" d="M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z"></path><path fill="#fff" d="M33.95,15l-3.746,19.126c0,0-0.161,0.874-1.245,0.874c-0.576,0-0.873-0.274-0.873-0.274l-8.114-6.733 l-3.97-2.001l-5.095-1.355c0,0-0.907-0.262-0.907-1.012c0-0.625,0.933-0.923,0.933-0.923l21.316-8.468 c-0.001-0.001,0.651-0.235,1.126-0.234C33.667,14,34,14.125,34,14.5C34,14.75,33.95,15,33.95,15z"></path><path fill="#b0bec5" d="M23,30.505l-3.426,3.374c0,0-0.149,0.115-0.348,0.12c-0.069,0.002-0.143-0.009-0.219-0.043 l0.964-5.965L23,30.505z"></path><path fill="#cfd8dc" d="M29.897,18.196c-0.169-0.22-0.481-0.26-0.701-0.093L16,26c0,0,2.106,5.892,2.427,6.912 c0.322,1.021,0.58,1.045,0.58,1.045l0.964-5.965l9.832-9.096C30.023,18.729,30.064,18.416,29.897,18.196z"></path>
            </svg>
            `
    ], [
      "web.whatsapp.com", `
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
            <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"></path><path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"></path><path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"></path><path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"></path><path fill="#fff" fill-rule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clip-rule="evenodd"></path>
            </svg>
            `
    ], [
      "instagram.com", `
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
            <radialGradient id="yOrnnhliCrdS2gy~4tD8ma_Xy10Jcu1L2Su_gr1" cx="19.38" cy="42.035" r="44.899" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fd5"></stop><stop offset=".328" stop-color="#ff543f"></stop><stop offset=".348" stop-color="#fc5245"></stop><stop offset=".504" stop-color="#e64771"></stop><stop offset=".643" stop-color="#d53e91"></stop><stop offset=".761" stop-color="#cc39a4"></stop><stop offset=".841" stop-color="#c837ab"></stop></radialGradient><path fill="url(#yOrnnhliCrdS2gy~4tD8ma_Xy10Jcu1L2Su_gr1)" d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20\tc-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20\tC42.014,38.383,38.417,41.986,34.017,41.99z"></path><radialGradient id="yOrnnhliCrdS2gy~4tD8mb_Xy10Jcu1L2Su_gr2" cx="11.786" cy="5.54" r="29.813" gradientTransform="matrix(1 0 0 .6663 0 1.849)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4168c9"></stop><stop offset=".999" stop-color="#4168c9" stop-opacity="0"></stop></radialGradient><path fill="url(#yOrnnhliCrdS2gy~4tD8mb_Xy10Jcu1L2Su_gr2)" d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20\tc-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20\tC42.014,38.383,38.417,41.986,34.017,41.99z"></path><path fill="#fff" d="M24,31c-3.859,0-7-3.14-7-7s3.141-7,7-7s7,3.14,7,7S27.859,31,24,31z M24,19c-2.757,0-5,2.243-5,5\ts2.243,5,5,5s5-2.243,5-5S26.757,19,24,19z"></path><circle cx="31.5" cy="16.5" r="1.5" fill="#fff"></circle><path fill="#fff" d="M30,37H18c-3.859,0-7-3.14-7-7V18c0-3.86,3.141-7,7-7h12c3.859,0,7,3.14,7,7v12\tC37,33.86,33.859,37,30,37z M18,13c-2.757,0-5,2.243-5,5v12c0,2.757,2.243,5,5,5h12c2.757,0,5-2.243,5-5V18c0-2.757-2.243-5-5-5H18z"></path>
            </svg>
            `
    ], [
      "x.com", `
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
            <path d="M 11 4 C 7.134 4 4 7.134 4 11 L 4 39 C 4 42.866 7.134 46 11 46 L 39 46 C 42.866 46 46 42.866 46 39 L 46 11 C 46 7.134 42.866 4 39 4 L 11 4 z M 13.085938 13 L 21.023438 13 L 26.660156 21.009766 L 33.5 13 L 36 13 L 27.789062 22.613281 L 37.914062 37 L 29.978516 37 L 23.4375 27.707031 L 15.5 37 L 13 37 L 22.308594 26.103516 L 13.085938 13 z M 16.914062 15 L 31.021484 35 L 34.085938 35 L 19.978516 15 L 16.914062 15 z"></path>
            </svg>
            `
    ]
  ]);

  const SHORTCUT_DELETE_BUTTON_HTML = `
            <button>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px">
                    <path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-12q-15.3 0-25.65-10.29Q192-716.58 192-731.79t10.35-25.71Q212.7-768 228-768h156v-12q0-15.3 10.35-25.65Q404.7-816 420-816h120q15.3 0 25.65 10.35Q576-795.3 576-780v12h156q15.3 0 25.65 10.29Q768-747.42 768-732.21t-10.35 25.71Q747.3-696 732-696h-12v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM419.79-288q15.21 0 25.71-10.35T456-324v-264q0-15.3-10.29-25.65Q435.42-624 420.21-624t-25.71 10.35Q384-603.3 384-588v264q0 15.3 10.29 25.65Q404.58-288 419.79-288Zm120 0q15.21 0 25.71-10.35T576-324v-264q0-15.3-10.29-25.65Q555.42-624 540.21-624t-25.71 10.35Q504-603.3 504-588v264q0 15.3 10.29 25.65Q524.58-288 539.79-288ZM312-696v480-480Z"/>
                </svg>
            </button>
            `;

  // const FAVICON_CANDIDATES = (hostname) => [
  //     `https://${hostname}/apple-touch-icon-180x180.png`,
  //     `https://${hostname}/apple-touch-icon-120x120.png`,
  //     `https://${hostname}/apple-touch-icon.png`
  // ];

  const GOOGLE_FAVICON_API_FALLBACK = (hostname) =>
    `https://s2.googleusercontent.com/s2/favicons?domain_url=https://${hostname}&sz=256`;

  const FAVICON_REQUEST_TIMEOUT = 5000;

  const ADAPTIVE_ICON_CSS = `.shortcutsContainer .shortcuts .shortcutLogoContainer img {
                height: calc(100% / sqrt(2)) !important;
                width: calc(100% / sqrt(2)) !important;
                }`;

  /* ------ Element selectors ------ */

  const shortcuts = document.getElementById("shortcuts-section");
  const aiToolsCont = document.getElementById("aiToolsCont");
  const googleAppsCont = document.getElementById("googleAppsCont");
  const shortcutsCheckbox = document.getElementById("shortcutsCheckbox");
  const proxybypassField = document.getElementById("proxybypassField");
  const proxyinputField = document.getElementById("proxyField");
  const useproxyCheckbox = document.getElementById("useproxyCheckbox");
  const searchsuggestionscheckbox = document.getElementById("searchsuggestionscheckbox");
  const shortcutEditField = document.getElementById("shortcutEditField");
  const adaptiveIconField = document.getElementById("adaptiveIconField");
  const adaptiveIconToggle = document.getElementById("adaptiveIconToggle");
  const aiToolsCheckbox = document.getElementById("aiToolsCheckbox");
  const googleAppsCheckbox = document.getElementById("googleAppsCheckbox");
  const timeformatField = document.getElementById("timeformatField");
  const hourcheckbox = document.getElementById("12hourcheckbox");
  const digitalCheckbox = document.getElementById("digitalCheckbox");
  const fahrenheitCheckbox = document.getElementById("fahrenheitCheckbox");
  const shortcutEditButton = document.getElementById("shortcutEditButton");
  const backButton = document.getElementById("backButton");
  const shortcutSettingsContainer = document.getElementById("shortcutList"); // shortcuts in settings
  const shortcutsContainer = document.getElementById("shortcutsContainer"); // shortcuts in page
  const newShortcutButton = document.getElementById("newShortcutButton");
  const resetShortcutsButton = document.getElementById("resetButton");
  const iconStyle = document.getElementById("iconStyle");

  // const flexMonitor = document.getElementById("flexMonitor"); // monitors whether shortcuts have flex-wrap flexed
  // const defaultHeight = document.getElementById("defaultMonitor").clientHeight; // used to compare to previous
  // element

  /* ------ Helper functions for saving and loading states ------ */

  // Function to save checkbox state to localStorage
  function saveCheckboxState(key, checkbox)
  {
    localStorage.setItem(key, checkbox.checked ? "checked" : "unchecked");
  }

  // Function to load and apply checkbox state from localStorage
  function loadCheckboxState(key, checkbox)
  {
    const savedState = localStorage.getItem(key);
    checkbox.checked = savedState === "checked";
  }

  // Function to save display status to localStorage
  function saveDisplayStatus(key, displayStatus)
  {
    localStorage.setItem(key, displayStatus);
  }

  // Function to load and apply display status from localStorage
  function loadDisplayStatus(key, element)
  {
    const savedStatus = localStorage.getItem(key);
    if(savedStatus === "flex")
    {
      element.style.display = "flex";
    }
    else
    {
      element.style.display = "none";
    }
  }

  // Function to save activeness status to localStorage
  function saveActiveStatus(key, activeStatus)
  {
    localStorage.setItem(key, activeStatus);
  }

  // Function to load and apply activeness status from localStorage
  function loadActiveStatus(key, element)
  {
    const savedStatus = localStorage.getItem(key);
    if(savedStatus === "active")
    {
      element.classList.remove("inactive");
    }
    else
    {
      element.classList.add("inactive");
    }
  }

  // Function to save style data
  function saveIconStyle(key, CSS)
  {
    localStorage.setItem(key, CSS);
  }

  // Function to load style data
  function loadIconStyle(key, element)
  {
    element.innerHTML = localStorage.getItem(key);
  }

  /* ------ Loading shortcuts ------ */

  /**
   * Function to load and apply all shortcut names and URLs from localStorage
   *
   * Iterates through the stored shortcuts and replaces the settings entry for the preset shortcuts with the
   * stored ones.
   * It then calls apply for all the shortcuts, to synchronize the changes settings entries with the actual shortcut
   * container.
   */

  function loadShortcuts()
  {
    let amount = localStorage.getItem("shortcutAmount");

    const presetAmount = SHORTCUT_PRESET_NAMES.length;

    if(amount === null)
    { // first time opening
      amount = presetAmount;
      localStorage.setItem("shortcutAmount", amount.toString());
    }
    else
    {
      amount = parseInt(amount);
    }

    // If we are not allowed to add more shortcuts.
    if(amount >= MAX_SHORTCUTS_ALLOWED)
    {
      newShortcutButton.className = "inactive";
    }

    // If we are not allowed to delete anymore, all delete buttons should be deactivated.
    const deleteInactive = amount <= MIN_SHORTCUTS_ALLOWED;

    for(let i = 0; i < amount; i++)
    {

      const name = localStorage.getItem("shortcutName" + i.toString()) || SHORTCUT_PRESET_NAMES[i];
      const url = localStorage.getItem("shortcutURL" + i.toString()) ||
        [...SHORTCUT_PRESET_URLS_AND_LOGOS.keys()][i];

      const newSettingsEntry = createShortcutSettingsEntry(name, url, deleteInactive, i);

      // Save the index for the future
      newSettingsEntry._index = i;

      shortcutSettingsContainer.appendChild(newSettingsEntry);

      applyShortcut(newSettingsEntry);
    }
  }

  /* ------ Creating shortcut elements ------ */

  /**
   * Function that creates a div to be used in the shortcut edit panel of the settings.
   *
   * @param name The name of the shortcut
   * @param url The URL of the shortcut
   * @param deleteInactive Whether the delete button should be active
   * @param i The index of the shortcut
   * @returns {HTMLDivElement} The div to be used in the settings
   */
  function createShortcutSettingsEntry(name, url, deleteInactive, i)
  {
    const deleteButtonContainer = document.createElement("div");
    deleteButtonContainer.className = "delete";
    deleteButtonContainer.innerHTML = SHORTCUT_DELETE_BUTTON_HTML;

    const deleteButton = deleteButtonContainer.children[0];
    if(deleteInactive)
    {
      deleteButton.className = "inactive";
    }
    deleteButton.addEventListener(
      "click",
      (e) => deleteShortcut(e.target.closest(".shortcutSettingsEntry"))
    );

    const shortcutName = document.createElement("input");
    shortcutName.className = "shortcutName";
    shortcutName.placeholder = SHORTCUT_NAME_PLACEHOLDER;
    shortcutName.value = name;
    const shortcutUrl = document.createElement("input");
    shortcutUrl.className = "URL";
    shortcutUrl.placeholder = SHORTCUT_URL_PLACEHOLDER;
    shortcutUrl.value = url;

    attachEventListenersToInputs([shortcutName, shortcutUrl]);

    const textDiv = document.createElement("div");
    textDiv.append(shortcutName, shortcutUrl);

    const entryDiv = document.createElement("div");
    entryDiv.className = "shortcutSettingsEntry";
    entryDiv.append(textDiv, deleteButtonContainer);

    entryDiv._index = i;

    return entryDiv;
  }

  /**
   * This function creates a shortcut to be used for the shortcut container on the main page.
   *
   * @param shortcutName The name of the shortcut
   * @param shortcutUrl The url of the shortcut
   * @param i The index of the shortcut
   */
  function createShortcutElement(shortcutName, shortcutUrl, i)
  {
    const shortcut = document.createElement("a");
    shortcut.href = shortcutUrl;

    const name = document.createElement("span");
    name.className = "shortcut-name";
    name.textContent = shortcutName;

    let icon = getCustomLogo(shortcutUrl);

    if(!icon)
    { // if we had to pick the fallback, attempt to get a better image in the background.
      icon = getFallbackFavicon(shortcutUrl);
      // getBestIconUrl(shortcutUrl).then((iconUrl) => icon.src = iconUrl).catch();
    }

    const iconContainer = document.createElement("div");
    iconContainer.className = "shortcutLogoContainer";
    iconContainer.appendChild(icon);

    shortcut.append(iconContainer, name);

    const shortcutContainer = document.createElement("div");
    shortcutContainer.className = "shortcuts";
    shortcutContainer.appendChild(shortcut);
    shortcutContainer._index = i;

    return shortcutContainer;
  }

  /* ------ Attaching event listeners to shortcut settings ------ */

  /**
   * Function to attach all required event listeners to the shortcut edit inputs in the settings.
   *
   * It adds three event listeners to each of the two inputs:
   * 1. Blur, to save changes to the shortcut automatically.
   * 2. Focus, to select all text in the input field when it is selected.
   * 3. Keydown, which moves the focus to the URL field when the user presses 'Enter' in the name field,
   * and removes all focus to save the changes when the user presses 'Enter' in the URL field.
   *
   * @param inputs a list of the two inputs these listeners should be applied to.
   */
  function attachEventListenersToInputs(inputs)
  {
    inputs.forEach(input =>
    {
      // save and apply when done
      input.addEventListener("blur", (e) =>
      {
        const shortcut = e.target.closest(".shortcutSettingsEntry");
        saveShortcut(shortcut);
        applyShortcut(shortcut);
      });
      // select all content on click:
      input.addEventListener("focus", (e) => e.target.select());
    });
    inputs[0].addEventListener("keydown", (e) =>
    {
      if(e.key === "Enter")
      {
        inputs[1].focus();  // Move focus to the URL
      }
    });
    inputs[1].addEventListener("keydown", (e) =>
    {
      if(e.key === "Enter")
      {
        e.target.blur();  // Blur the input field
      }
    });
  }

  /* ------ Saving and applying changes to shortcuts ------ */

  /**
   * This function stores a shortcut by saving its values in the settings panel to the local storage.
   *
   * @param shortcut The shortcut to be saved
   */
  function saveShortcut(shortcut)
  {
    const name = shortcut.querySelector("input.shortcutName").value;
    const url = shortcut.querySelector("input.URL").value;

    localStorage.setItem("shortcutName" + shortcut._index, name);
    localStorage.setItem("shortcutURL" + shortcut._index, url);
  }

  /**
   * This function applies a change that has been made in the settings panel to the real shortcut in the container
   *
   * @param shortcut The shortcut to be applied.
   */
  function applyShortcut(shortcut)
  {
    const shortcutName = shortcut.querySelector("input.shortcutName").value;
    let url = shortcut.querySelector("input.URL").value;
    const normalizedUrl = url.startsWith("https://") || url.startsWith("http://") ? url : "https://" + url;

    const i = shortcut._index;

    const shortcutElement = createShortcutElement(shortcutName, normalizedUrl, i);

    if(i < shortcutsContainer.children.length)
    {
      shortcutsContainer.replaceChild(shortcutElement, shortcutsContainer.children[i]);
    }
    else
    {
      shortcutsContainer.appendChild(shortcutElement);
    }
  }

  /* ------ Adding, deleting, and resetting shortcuts ------ */

  /**
   * This function creates a new shortcut in the settings panel, then saves and applies it.
   */
  function newShortcut()
  {
    const currentAmount = parseInt(localStorage.getItem("shortcutAmount"));
    const newAmount = currentAmount + 1;

    if(newAmount > MAX_SHORTCUTS_ALLOWED)
    {
      return;
    }

    // If the delete buttons were deactivated, reactivate them.
    if(currentAmount === MIN_SHORTCUTS_ALLOWED)
    {
      shortcutSettingsContainer.querySelectorAll(".delete button.inactive")
      .forEach(b => b.classList.remove("inactive"));
    }

    // If we have reached the max, deactivate the add button.
    if(newAmount === MAX_SHORTCUTS_ALLOWED)
    {
      newShortcutButton.className = "inactive";
    }

    // Save the new amount
    localStorage.setItem("shortcutAmount", newAmount.toString());

    // create placeholder div
    const shortcut = createShortcutSettingsEntry(
      PLACEHOLDER_SHORTCUT_NAME, PLACEHOLDER_SHORTCUT_URL, false, currentAmount
    );

    shortcutSettingsContainer.appendChild(shortcut);

    saveShortcut(shortcut);
    applyShortcut(shortcut);
  }

  /**
   * This function deletes a shortcut and shifts all indices of the following shortcuts back by one.
   *
   * @param shortcut The shortcut to be deleted.
   */
  function deleteShortcut(shortcut)
  {
    const newAmount = (localStorage.getItem("shortcutAmount") || 0) - 1;
    if(newAmount < MIN_SHORTCUTS_ALLOWED)
    {
      return;
    }

    const i = shortcut._index;

    // If we had previously deactivated it, reactivate the add button
    newShortcutButton.classList.remove("inactive");

    // Remove the shortcut from the DOM
    shortcut.remove();
    shortcutsContainer.removeChild(shortcutsContainer.children[i]);

    // Update localStorage by shifting all the shortcuts after the deleted one and update the index
    for(let j = i; j < newAmount; j++)
    {
      const shortcutEntry = shortcutSettingsContainer.children[j];
      shortcutEntry._index--;
      saveShortcut(shortcutEntry);
    }

    // Remove the last shortcut from storage, as it has now moved up
    localStorage.removeItem("shortcutName" + (newAmount));
    localStorage.removeItem("shortcutURL" + (newAmount));

    // Disable delete buttons if minimum number reached
    if(newAmount === MIN_SHORTCUTS_ALLOWED)
    {
      shortcutSettingsContainer.querySelectorAll(".delete button")
      .forEach(button => button.className = "inactive");
    }

    // Update the shortcutAmount in localStorage
    localStorage.setItem("shortcutAmount", (newAmount).toString());
  }

  /**
   * This function resets shortcuts to their original state, namely the presets.
   *
   * It does this by deleting all shortcut-related data, then reloading the shortcuts.
   */
  function resetShortcuts()
  {
    for(let i = 0; i < (localStorage.getItem("shortcutAmount") || 0); i++)
    {
      localStorage.removeItem("shortcutName" + i);
      localStorage.removeItem("shortcutURL" + i);
    }
    shortcutSettingsContainer.innerHTML = "";
    shortcutsContainer.innerHTML = "";
    localStorage.removeItem("shortcutAmount");
    loadShortcuts();
  }

  /* ------ Shortcut favicon handling ------ */

  /**
   * This function verifies whether a URL for a favicon is valid.
   *
   * It does this by creating an image and setting the URL as the src, as fetch would be blocked by CORS.
   *
   * @param urls the array of potential URLs of favicons
   * @returns {Promise<unknown>}
   */
  // function filterFavicon(urls) {
  //     return new Promise((resolve, reject) => {
  //         let found = false;

  //         for (const url of urls) {
  //             const img = new Image();
  //             img.referrerPolicy = "no-referrer"; // Don't send referrer data
  //             img.src = url;

  //             img.onload = () => {
  //                 if (!found) { // Make sure to resolve only once
  //                     found = true;
  //                     resolve(url);
  //                 }
  //             };
  //         }

  //         // If none of the URLs worked after all have been tried
  //         setTimeout(() => {
  //             if (!found) {
  //                 reject();
  //             }
  //         }, FAVICON_REQUEST_TIMEOUT);
  //     });
  // }

  /**
   * This function returns the url to the favicon of a website, given a URL.
   *
   * @param urlString The url of the website for which the favicon is requested
   * @return {Promise<String>} Potentially the favicon url
   */
  // async function getBestIconUrl(urlString) {
  //     const hostname = new URL(urlString).hostname;
  //     try {
  //         // Wait for filterFavicon to resolve with a valid URL
  //         return await filterFavicon(FAVICON_CANDIDATES(hostname));
  //     } catch (error) {
  //         return Promise.reject();
  //     }
  // }

  /**
   * This function uses Google's API to immediately get a favicon,
   * to be used while loading the real one and as a fallback.
   *
   * @param urlString the url of the website for which the favicon is requested
   * @returns {HTMLImageElement} The img element representing the favicon
   */
  function getFallbackFavicon(urlString)
  {
    const logo = document.createElement("img");

    const hostname = new URL(urlString).hostname;
    if(hostname === "github.com")
    {
      logo.src = "./shortcuts_icons/github-shortcut.svg";
    }
    else
    {
      logo.src = GOOGLE_FAVICON_API_FALLBACK(hostname);

      // Handle image loading error on offline scenario
      logo.onerror = () =>
      {
        logo.src = "./shortcuts_icons/offline.svg";
      };
    }

    return logo;
  }

  /**
   * This function returns the custom logo for the url associated with a preset shortcut.
   *
   * @param url The url of the shortcut.
   * @returns {Element|null} The logo if it was found, otherwise null.
   */
  function getCustomLogo(url)
  {
    const html = SHORTCUT_PRESET_URLS_AND_LOGOS.get(url.replace("https://", ""));
    return html ? document.createRange().createContextualFragment(html).firstElementChild : null;
  }

  /* ------ Proxy ------ */

  /**
   * This function shows the proxy disclaimer.
   */
  function showProxyDisclaimer()
  {
    const message = "All proxy features are off by default.\n\nIf you enable search suggestions and CORS bypass proxy, it is strongly recommended to host your own proxy for enhanced privacy.\n\nBy default, the proxy will be set to https://mynt-proxy.rhythmcorehq.com, meaning all your data will go through this service, which may pose privacy concerns.";

    return confirm(message);
  }

  /* ------ Event Listeners ------ */

  // Add change event listeners for the checkboxes
  shortcutsCheckbox.addEventListener("change", function()
  {
    saveCheckboxState("shortcutsCheckboxState", shortcutsCheckbox);
    if(shortcutsCheckbox.checked)
    {
      shortcuts.style.display = "flex";
      saveDisplayStatus("shortcutsDisplayStatus", "flex");
      shortcutEditField.classList.remove("inactive");
      saveActiveStatus("shortcutEditField", "active");
      adaptiveIconField.classList.remove("inactive");
      saveActiveStatus("adaptiveIconField", "active");
    }
    else
    {
      shortcuts.style.display = "none";
      saveDisplayStatus("shortcutsDisplayStatus", "none");
      shortcutEditField.classList.add("inactive");
      saveActiveStatus("shortcutEditField", "inactive");
      adaptiveIconField.classList.add("inactive");
      saveActiveStatus("adaptiveIconField", "inactive");
    }
  });

  searchsuggestionscheckbox.addEventListener("change", function()
  {
    saveCheckboxState("searchsuggestionscheckboxState", searchsuggestionscheckbox);
    if(searchsuggestionscheckbox.checked)
    {
      proxybypassField.classList.remove("inactive");
      saveActiveStatus("proxybypassField", "active");
    }
    else
    {
      proxybypassField.classList.add("inactive");
      saveActiveStatus("proxybypassField", "inactive");
      useproxyCheckbox.checked = false;
      saveCheckboxState("useproxyCheckboxState", useproxyCheckbox);
      proxyinputField.classList.add("inactive");
      saveActiveStatus("proxyinputField", "inactive");
    }
  });

  if(localStorage.getItem("greetingEnabled") === null)
  {
    localStorage.setItem("greetingEnabled", "true");
  }
  const greetingCheckbox = document.getElementById("greetingcheckbox");
  const greetingField = document.getElementById("greetingField");
  greetingCheckbox.checked = localStorage.getItem("greetingEnabled") === "true";
  greetingCheckbox.disabled = localStorage.getItem("clocktype") !== "digital";

  digitalCheckbox.addEventListener("change", function()
  {
    saveCheckboxState("digitalCheckboxState", digitalCheckbox);
    if(digitalCheckbox.checked)
    {
      timeformatField.classList.remove("inactive");
      greetingField.classList.remove("inactive");
      greetingCheckbox.disabled = false; // Enable greeting toggle
      localStorage.setItem("clocktype", "digital");
      clocktype = localStorage.getItem("clocktype");
      displayClock();
      stopClock();
      saveActiveStatus("timeformatField", "active");
      saveActiveStatus("greetingField", "active");
    }
    else
    {
      timeformatField.classList.add("inactive");
      greetingField.classList.add("inactive");
      greetingCheckbox.disabled = true; // Disable greeting toggle
      localStorage.setItem("clocktype", "analog");
      clocktype = localStorage.getItem("clocktype");
      stopClock();
      startClock();
      displayClock();
      saveActiveStatus("timeformatField", "inactive");
      saveActiveStatus("greetingField", "inactive");
    }
  });

  hourcheckbox.addEventListener("change", function()
  {
    saveCheckboxState("hourcheckboxState", hourcheckbox);
    if(hourcheckbox.checked)
    {
      localStorage.setItem("hourformat", "true");
    }
    else
    {
      localStorage.setItem("hourformat", "false");
    }
  });

  greetingCheckbox.addEventListener("change", () =>
  {
    localStorage.setItem("greetingEnabled", greetingCheckbox.checked);
    updatedigiClock();
  });

  useproxyCheckbox.addEventListener("change", function()
  {
    if(useproxyCheckbox.checked)
    {
      // Show the disclaimer and check the user's choice
      const userConfirmed = showProxyDisclaimer();
      if(userConfirmed)
      {
        // Only enable the proxy if the user confirmed
        saveCheckboxState("useproxyCheckboxState", useproxyCheckbox);
        proxyinputField.classList.remove("inactive");
        saveActiveStatus("proxyinputField", "active");
      }
      else
      {
        // Revert the checkbox state if the user did not confirm
        useproxyCheckbox.checked = false;
      }
    }
    else
    {
      // If the checkbox is unchecked, disable the proxy
      saveCheckboxState("useproxyCheckboxState", useproxyCheckbox);
      proxyinputField.classList.add("inactive");
      saveActiveStatus("proxyinputField", "inactive");
    }
  });

  adaptiveIconToggle.addEventListener("change", function()
  {
    saveCheckboxState("adaptiveIconToggle", adaptiveIconToggle);
    if(adaptiveIconToggle.checked)
    {
      saveIconStyle("iconStyle", ADAPTIVE_ICON_CSS);
      iconStyle.innerHTML = ADAPTIVE_ICON_CSS;
    }
    else
    {
      saveIconStyle("iconStyle", "");
      iconStyle.innerHTML = "";
    }
  });

  aiToolsCheckbox.addEventListener("change", function()
  {
    saveCheckboxState("aiToolsCheckboxState", aiToolsCheckbox);
    if(aiToolsCheckbox.checked)
    {
      aiToolsCont.style.display = "flex";
      saveDisplayStatus("aiToolsDisplayStatus", "flex");
    }
    else
    {
      aiToolsCont.style.display = "none";
      saveDisplayStatus("aiToolsDisplayStatus", "none");
      toggleShortcuts();
    }
  });

  googleAppsCheckbox.addEventListener("change", function()
  {
    saveCheckboxState("googleAppsCheckboxState", googleAppsCheckbox);
    if(googleAppsCheckbox.checked)
    {
      googleAppsCont.style.display = "flex";
      saveDisplayStatus("googleAppsDisplayStatus", "flex");
    }
    else
    {
      googleAppsCont.style.display = "none";
      saveDisplayStatus("googleAppsDisplayStatus", "none");
    }
  });

  fahrenheitCheckbox.addEventListener("change", function()
  {
    saveCheckboxState("fahrenheitCheckboxState", fahrenheitCheckbox);
  });

  newShortcutButton.addEventListener("click", () => newShortcut());

  resetShortcutsButton.addEventListener("click", () => resetShortcuts());

  /* ------ Page Transitions & Animations ------ */

  // When clicked, open new page by sliding it in from the right.
  shortcutEditButton.onclick = () =>
  {
    setTimeout(() =>
    {
      shortcutEditPage.style.display = "block";
    });
    requestAnimationFrame(() =>
    {
      overviewPage.style.transform = "translateX(-120%)";
      overviewPage.style.opacity = "0";
    });
    setTimeout(() =>
    {
      requestAnimationFrame(() =>
      {
        shortcutEditPage.style.transform = "translateX(0)";
        shortcutEditPage.style.opacity = "1";
      });
    }, 50);
    setTimeout(() =>
    {
      overviewPage.style.display = "none";
    }, 650);
  };

  // Close page by sliding it away to the right.
  backButton.onclick = () =>
  {
    setTimeout(() =>
    {
      overviewPage.style.display = "block";
    });
    requestAnimationFrame(() =>
    {
      shortcutEditPage.style.transform = "translateX(120%)";
      shortcutEditPage.style.opacity = "0";
    });
    setTimeout(() =>
    {
      requestAnimationFrame(() =>
      {
        overviewPage.style.transform = "translateX(0)";
        overviewPage.style.opacity = "1";
      });
    }, 50);
    setTimeout(() =>
    {
      shortcutEditPage.style.display = "none";
    }, 650);
  };

  // Rotate reset button when clicked
  const resetButton = document.getElementById("resetButton");
  resetButton.addEventListener("click", () =>
  {
    resetButton.querySelector("svg").classList.toggle("rotateResetButton");
  });

  /* ------ Loading ------ */

  // Load and apply the saved checkbox states and display statuses
  loadCheckboxState("shortcutsCheckboxState", shortcutsCheckbox);
  loadActiveStatus("shortcutEditField", shortcutEditField);
  loadActiveStatus("adaptiveIconField", adaptiveIconField);
  loadCheckboxState("searchsuggestionscheckboxState", searchsuggestionscheckbox);
  loadCheckboxState("useproxyCheckboxState", useproxyCheckbox);
  loadCheckboxState("digitalCheckboxState", digitalCheckbox);
  loadCheckboxState("hourcheckboxState", hourcheckbox);
  loadActiveStatus("proxyinputField", proxyinputField);
  loadActiveStatus("timeformatField", timeformatField);
  loadActiveStatus("greetingField", greetingField);
  loadActiveStatus("proxybypassField", proxybypassField);
  loadCheckboxState("adaptiveIconToggle", adaptiveIconToggle);
  loadIconStyle("iconStyle", iconStyle);
  loadCheckboxState("aiToolsCheckboxState", aiToolsCheckbox);
  loadCheckboxState("googleAppsCheckboxState", googleAppsCheckbox);
  loadDisplayStatus("shortcutsDisplayStatus", shortcuts);
  loadDisplayStatus("aiToolsDisplayStatus", aiToolsCont);
  loadDisplayStatus("googleAppsDisplayStatus", googleAppsCont);
  loadCheckboxState("fahrenheitCheckboxState", fahrenheitCheckbox);
  loadShortcuts();
});

document.addEventListener("DOMContentLoaded", () =>
{
  const sitesContainer = document.getElementById("top-sites");

  chrome.topSites.get((sites) =>
  {
    const topSites = sites.slice(0, 5);

    topSites.forEach((site) =>
    {
      const siteElement = document.createElement("div");
      siteElement.className = "site bgLightTint";

      const url = new URL(site.url);
      const domain = url.hostname;

      // Check if the site is localhost or a private IP
      const isLocal = domain === "localhost" || domain.startsWith("127.") || domain.startsWith("192.")
        || domain.startsWith("10.") || domain.endsWith(".local");

      // Use a placeholder favicon for localhost
      const faviconUrl = isLocal
        ? "assets/browser.png" // Fallback favicon for local URLs
        : `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

      const truncatedTitle = site.title.length > 10 ? site.title.substring(0, 10) + "..." : site.title;

      siteElement.innerHTML = `
        <a href="${site.url}" target="_blank">
          <img src="${faviconUrl}" alt="${truncatedTitle}" />
          <p>${truncatedTitle}</p>
        </a>
      `;

      sitesContainer.appendChild(siteElement);
    });
  });
});
