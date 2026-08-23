/* =========================================================
   COSMIC WEBTAB - MAIN JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hourAngle =
        ((hours % 12) * 30) +
        (minutes * 0.5);

    const minuteAngle =
        (minutes * 6) +
        (seconds * 0.1);

    const secondAngle =
        seconds * 6;

    const hourHand =
        document.querySelector(".hourHand");

    const minuteHand =
        document.querySelector(".minuteHand");

    const secondHand =
        document.querySelector(".secondHand");

    if (hourHand) {
        hourHand.style.transform =
            `rotate(${hourAngle}deg)`;
    }

    if (minuteHand) {
        minuteHand.style.transform =
            `rotate(${minuteAngle}deg)`;
    }

    if (secondHand) {
        secondHand.style.transform =
            `rotate(${secondAngle}deg)`;
    }

    const timeElement =
        document.querySelector(".time");

    if (timeElement) {

        let h = hours % 12;

        if (h === 0) {
            h = 12;
        }

        const hh =
            String(h).padStart(2, "0");

        const mm =
            String(minutes).padStart(2, "0");

        const ss =
            String(seconds).padStart(2, "0");

        const ampm =
            hours >= 12 ? "PM" : "AM";

        timeElement.innerHTML =
            `<small>${hh}:${mm}:${ss} ${ampm}</small>`;
    }
}

updateClock();

setInterval(updateClock, 1000);


/* =========================================================
   SEARCH BAR
   KEEPING YOUR ORIGINAL SEARCH DESIGN
========================================================= */

const searchInput =
    document.querySelector(
        ".search_engine input"
    );

if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key !== "Enter") {
                return;
            }

            const query =
                searchInput.value.trim();

            if (!query) {
                return;
            }

            window.location.href =
                "https://www.google.com/search?q=" +
                encodeURIComponent(query);
        }
    );
}


/* =========================================================
   QUICK-LAUNCH CARDS
   (ChatGPT / MoviesMod / YouTube / etc.)
========================================================= */

const quickLaunchMenu =
    document.querySelector(".menu");

if (quickLaunchMenu) {

    quickLaunchMenu.addEventListener(
        "click",
        function(event) {

            const card =
                event.target.closest(
                    "[data-url]"
                );

            if (!card) {
                return;
            }

            const url =
                card.dataset.url;

            if (!url) {
                return;
            }

            window.location.href =
                url;
        }
    );
}


/* =========================================================
   LOCAL NOTES STORAGE
========================================================= */

const NOTES_KEY =
    "cosmic_webtab_notes_v1";


function getNotes() {

    try {

        const stored =
            localStorage.getItem(NOTES_KEY);

        if (!stored) {
            return [];
        }

        const notes =
            JSON.parse(stored);

        return Array.isArray(notes)
            ? notes
            : [];

    } catch (error) {

        console.error(
            "Could not read notes:",
            error
        );

        return [];
    }
}


function saveNotes(notes) {

    localStorage.setItem(
        NOTES_KEY,
        JSON.stringify(notes)
    );
}


function generateNoteId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2)
    );
}


/* =========================================================
   NOTE ELEMENTS
========================================================= */

const noteTitle =
    document.getElementById("noteTitle");

const noteText =
    document.getElementById("noteText");

const saveNoteBtn =
    document.getElementById("saveNoteBtn");

const clearNoteBtn =
    document.getElementById("clearNoteBtn");

const savedNotesList =
    document.getElementById("savedNotesList");

const noteCount =
    document.getElementById("noteCount");

const saveStatus =
    document.getElementById("saveStatus");

const exportNotesBtn =
    document.getElementById("exportNotesBtn");

const clearAllNotesBtn =
    document.getElementById("clearAllNotesBtn");


/* =========================================================
   RENDER NOTES
========================================================= */

function renderNotes() {

    if (!savedNotesList) {
        return;
    }

    const notes =
        getNotes();

    if (noteCount) {
        noteCount.textContent =
            notes.length;
    }

    if (notes.length === 0) {

        savedNotesList.innerHTML = `
            <div class="empty-notes">
                No saved notes yet.<br>
                Write something above.
            </div>
        `;

        return;
    }

    savedNotesList.innerHTML =
        notes
            .slice()
            .reverse()
            .map(function(note) {

                const safeTitle =
                    escapeHTML(
                        note.title ||
                        "Untitled Note"
                    );

                const safeText =
                    escapeHTML(
                        note.text ||
                        ""
                    );

                const date =
                    new Date(
                        note.createdAt
                    );

                return `
                    <div
                        class="saved-note"
                        data-id="${note.id}"
                    >

                        <button
                            class="delete-note"
                            data-delete-id="${note.id}"
                            title="Delete note"
                        >
                            ×
                        </button>

                        <div class="saved-note-title">
                            ${safeTitle}
                        </div>

                        <div class="saved-note-preview">
                            ${safeText}
                        </div>

                        <div class="saved-note-date">
                            ${formatDate(date)}
                        </div>

                    </div>
                `;

            })
            .join("");
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date) {

    if (
        !date ||
        Number.isNaN(date.getTime())
    ) {
        return "Unknown date";
    }

    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   SAVE NOTE
========================================================= */

function saveCurrentNote() {

    const title = noteTitle ? noteTitle.value.trim() : "";
    const text = noteText ? noteText.value.trim() : "";

    if (!text) {
        if (saveStatus) {
            saveStatus.textContent = "Write something first.";
            saveStatus.style.color = "#ff7ca8";
        }
        if (noteText) noteText.focus();
        return false;
    }

    const notes = getNotes();
    notes.push({
        id: generateNoteId(),
        title: title || "Untitled Note",
        text: text,
        createdAt: new Date().toISOString()
    });

    saveNotes(notes);
    if (noteTitle) noteTitle.value = "";
    if (noteText) noteText.value = "";

    if (saveStatus) {
        saveStatus.textContent = "✓ Note saved successfully";
        saveStatus.style.color = "#65e7ad";
    }

    renderNotes();
    return true;
}

if (saveNoteBtn) {
    saveNoteBtn.addEventListener("click", saveCurrentNote);
}

if (noteText) {
    noteText.addEventListener("keydown", function(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            saveCurrentNote();
        }
    });
}


/* =========================================================
   CLEAR INPUT
========================================================= */

if (clearNoteBtn) {

    clearNoteBtn.addEventListener(
        "click",
        function() {

            noteTitle.value = "";
            noteText.value = "";

            saveStatus.textContent =
                "Ready for a new note.";

            saveStatus.style.color =
                "";
        }
    );
}


/* =========================================================
   DELETE INDIVIDUAL NOTE
========================================================= */

if (savedNotesList) {

    savedNotesList.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    "[data-delete-id]"
                );

            if (!button) {
                return;
            }

            const id =
                button.dataset.deleteId;

            const notes =
                getNotes()
                    .filter(
                        note =>
                            note.id !== id
                    );

            saveNotes(notes);

            renderNotes();
        }
    );
}


/* =========================================================
   DELETE ALL NOTES
========================================================= */

if (clearAllNotesBtn) {

    clearAllNotesBtn.addEventListener(
        "click",
        function() {

            const notes =
                getNotes();

            if (!notes.length) {
                return;
            }

            const confirmed =
                confirm(
                    "Delete all saved notes?"
                );

            if (!confirmed) {
                return;
            }

            localStorage.removeItem(
                NOTES_KEY
            );

            renderNotes();

            if (saveStatus) {

                saveStatus.textContent =
                    "All notes deleted.";

                saveStatus.style.color =
                    "#ff7ca8";
            }
        }
    );
}


/* =========================================================
   EXPORT NOTES AS JSON
========================================================= */

if (exportNotesBtn) {

    exportNotesBtn.addEventListener(
        "click",
        function() {

            const notes =
                getNotes();

            const data =
                JSON.stringify(
                    {
                        application:
                            "Cosmic WebTab",

                        exportedAt:
                            new Date()
                                .toISOString(),

                        notes:
                            notes
                    },
                    null,
                    2
                );

            const blob =
                new Blob(
                    [data],
                    {
                        type:
                            "application/json"
                    }
                );

            const url =
                URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                "cosmic-webtab-notes.json";

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            URL.revokeObjectURL(url);
        }
    );
}


renderNotes();


/* =========================================================
   PUBLIC IP / LOCATION
   JSONP VERSION

   IMPORTANT:
   DO NOT USE fetch() HERE.

   JSONP works even when index.html is opened
   using file://
========================================================= */

function loadPublicActivity() {

    window.cosmicIPCallback =
        function(data) {

            try {

                if (!data || !data.ip) {

                    throw new Error(
                        "Invalid IP data"
                    );
                }

                updatePublicActivity(
                    data
                );

                loadWeather(
                    data.latitude,
                    data.longitude,
                    data.city,
                    data.country_name
                );

            } catch (error) {

                console.error(
                    "Public activity data error:",
                    error
                );

                showActivityError();
            }

        };


    const script =
        document.createElement("script");

    script.src =
        "https://ipapi.co/jsonp/?callback=cosmicIPCallback";

    script.async = true;

    script.onerror =
        function() {

            console.error(
                "Could not load IP location service."
            );

            showActivityError();

            loadFallbackWeather();
        };

    document.head.appendChild(
        script
    );
}


/* =========================================================
   UPDATE PUBLIC ACTIVITY
========================================================= */

function updatePublicActivity(data) {

    setText(
        "activityIP",
        data.ip || "Unavailable"
    );

    const location =
        [
            data.city,
            data.region,
            data.country_name
        ]
        .filter(Boolean)
        .join(", ");

    setText(
        "activityLocation",
        location || "Unavailable"
    );

    setText(
        "activityOrg",
        data.org || "Unavailable"
    );

    setText(
        "activityTimezone",
        data.timezone || "Unavailable"
    );

    setText(
        "activityBrowser",
        detectBrowser()
    );

    setText(
        "activityPlatform",
        detectPlatform()
    );

    setText(
        "activityScreen",
        `${window.screen.width} × ${window.screen.height}`
    );
}


/* =========================================================
   ACTIVITY ERROR
========================================================= */

function showActivityError() {

    setText(
        "activityIP",
        "Unavailable"
    );

    setText(
        "activityLocation",
        "Unavailable"
    );

    setText(
        "activityOrg",
        "Unavailable"
    );

    setText(
        "activityTimezone",
        Intl.DateTimeFormat()
            .resolvedOptions()
            .timeZone
    );

    setText(
        "activityBrowser",
        detectBrowser()
    );

    setText(
        "activityPlatform",
        detectPlatform()
    );

    setText(
        "activityScreen",
        `${screen.width} × ${screen.height}`
    );

    setText(
        "weatherCity",
        "Weather unavailable"
    );
}


/* =========================================================
   SAFE TEXT SETTER
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value;
    }
}


/* =========================================================
   BROWSER DETECTION
========================================================= */

function detectBrowser() {

    const ua =
        navigator.userAgent;

    if (/Edg\//.test(ua)) {
        return "Microsoft Edge";
    }

    if (/Chrome\//.test(ua)) {
        return "Google Chrome";
    }

    if (/Firefox\//.test(ua)) {
        return "Firefox";
    }

    if (/Safari\//.test(ua)) {
        return "Safari";
    }

    return "Unknown browser";
}


/* =========================================================
   PLATFORM DETECTION
========================================================= */

function detectPlatform() {

    const ua =
        navigator.userAgent;

    if (/Windows/i.test(ua)) {
        return "Windows";
    }

    if (/Mac OS/i.test(ua)) {
        return "macOS";
    }

    if (/Android/i.test(ua)) {
        return "Android";
    }

    if (/iPhone|iPad/i.test(ua)) {
        return "iOS";
    }

    if (/Linux/i.test(ua)) {
        return "Linux";
    }

    return "Unknown";
}


/* =========================================================
   WEATHER
   OPEN-METEO
========================================================= */

async function loadWeather(
    latitude,
    longitude,
    city,
    country
) {

    if (
        latitude === undefined ||
        longitude === undefined
    ) {

        loadFallbackWeather();

        return;
    }

    try {

        const url =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${encodeURIComponent(latitude)}` +
            `&longitude=${encodeURIComponent(longitude)}` +
            "&current=" +
            [
                "temperature_2m",
                "apparent_temperature",
                "relative_humidity_2m",
                "precipitation",
                "weather_code",
                "wind_speed_10m"
            ].join(",") +
            "&timezone=auto";

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Weather HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        updateWeather(
            data,
            city,
            country
        );

    } catch (error) {

        console.error(
            "Weather lookup failed:",
            error
        );

        loadFallbackWeather();
    }
}


/* =========================================================
   FALLBACK WEATHER
========================================================= */

function loadFallbackWeather() {

    /*
       New York fallback only prevents the card
       from looking broken if an API is unavailable.

       It is NOT presented as your actual location.
    */

    loadWeather(
        40.7128,
        -74.0060,
        "Weather unavailable",
        ""
    );
}


/* =========================================================
   UPDATE WEATHER UI
========================================================= */

function updateWeather(
    data,
    city,
    country
) {

    const current =
        data.current;

    if (!current) {
        return;
    }

    const temperature =
        Math.round(
            current.temperature_2m
        );

    const feels =
        Math.round(
            current.apparent_temperature
        );

    const humidity =
        Math.round(
            current.relative_humidity_2m
        );

    const wind =
        Math.round(
            current.wind_speed_10m
        );

    const weatherCode =
        current.weather_code;

    const weather =
        getWeatherDescription(
            weatherCode
        );

    setText(
        "weatherTemp",
        temperature
    );

    setText(
        "weatherFeels",
        `${feels}°`
    );

    setText(
        "weatherHumidity",
        `${humidity}%`
    );

    setText(
        "weatherWind",
        `${wind} km/h`
    );

    setText(
        "weatherCondition",
        weather.text
    );

    setText(
        "weatherIcon",
        weather.icon
    );

    setText(
        "weatherCity",
        city || "Your location"
    );

    setText(
        "weatherCountry",
        country ? `· ${country}` : ""
    );

    setText(
        "clothingText",
        getClothingAdvice(
            temperature,
            feels,
            weatherCode,
            current.precipitation
        )
    );

    const loading =
        document.getElementById(
            "weatherLoading"
        );

    const content =
        document.getElementById(
            "weatherContent"
        );

    if (loading) {
        loading.style.display =
            "none";
    }

    if (content) {
        content.style.display =
            "flex";
    }
}


/* =========================================================
   WEATHER CODE
   WMO WEATHER CODES
========================================================= */

function getWeatherDescription(code) {

    if (code === 0) {

        return {
            text: "Clear sky",
            icon: "☀️"
        };
    }

    if (
        code === 1 ||
        code === 2
    ) {

        return {
            text: "Partly cloudy",
            icon: "🌤️"
        };
    }

    if (code === 3) {

        return {
            text: "Overcast",
            icon: "☁️"
        };
    }

    if (
        code === 45 ||
        code === 48
    ) {

        return {
            text: "Foggy",
            icon: "🌫️"
        };
    }

    if (
        code >= 51 &&
        code <= 57
    ) {

        return {
            text: "Drizzle",
            icon: "🌦️"
        };
    }

    if (
        code >= 61 &&
        code <= 67
    ) {

        return {
            text: "Rain",
            icon: "🌧️"
        };
    }

    if (
        code >= 71 &&
        code <= 77
    ) {

        return {
            text: "Snow",
            icon: "❄️"
        };
    }

    if (
        code >= 80 &&
        code <= 82
    ) {

        return {
            text: "Rain showers",
            icon: "🌦️"
        };
    }

    if (
        code === 85 ||
        code === 86
    ) {

        return {
            text: "Snow showers",
            icon: "🌨️"
        };
    }

    if (
        code >= 95 &&
        code <= 99
    ) {

        return {
            text: "Thunderstorm",
            icon: "⛈️"
        };
    }

    return {
        text: "Unknown",
        icon: "🌡️"
    };
}


/* =========================================================
   CLOTHING ADVICE
========================================================= */

function getClothingAdvice(
    temperature,
    feels,
    weatherCode,
    precipitation
) {

    const rainy =
        (
            weatherCode >= 51 &&
            weatherCode <= 67
        ) ||
        (
            weatherCode >= 80 &&
            weatherCode <= 82
        );

    const snowy =
        weatherCode >= 71 &&
        weatherCode <= 86;

    const storm =
        weatherCode >= 95;

    if (storm) {

        return "Rain jacket + waterproof shoes. Stay protected from the storm.";
    }

    if (snowy || feels <= 0) {

        return "Heavy coat, warm layers, gloves and insulated shoes.";
    }

    if (feels <= 8) {

        return rainy
            ? "Warm jacket + waterproof shoes. Bring an umbrella."
            : "Warm jacket, long trousers and closed shoes.";
    }

    if (feels <= 15) {

        return rainy
            ? "Light jacket + waterproof layer. An umbrella is useful."
            : "Light jacket or hoodie with long trousers.";
    }

    if (feels <= 22) {

        return rainy
            ? "Light clothes with a rain jacket or umbrella."
            : "Comfortable shirt with light trousers or jeans.";
    }

    if (feels <= 28) {

        return rainy
            ? "Light clothes + rain protection."
            : "T-shirt and comfortable lightweight trousers.";
    }

    return "Light breathable clothes, shorts if comfortable, and stay hydrated.";
}


/* =========================================================
   START PUBLIC ACTIVITY
========================================================= */

loadPublicActivity();