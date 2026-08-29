/* =========================================================
   COSMIC WEBTAB - MAIN JAVASCRIPT
   UPDATED LOCAL-FILE VERSION
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
   ========================================================= */

const searchInput =
    document.querySelector(".search_engine input");

if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        function (event) {

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
   ========================================================= */

const quickLaunchMenu =
    document.querySelector(".menu");

if (quickLaunchMenu) {

    quickLaunchMenu.addEventListener(
        "click",
        function (event) {

            const card =
                event.target.closest("[data-url]");

            if (!card) {
                return;
            }

            const url =
                card.dataset.url;

            if (!url) {
                return;
            }

            window.location.href = url;
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

    try {

        localStorage.setItem(
            NOTES_KEY,
            JSON.stringify(notes)
        );

    } catch (error) {

        console.error(
            "Could not save notes:",
            error
        );
    }
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
            .map(function (note) {

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
                        data-id="${escapeHTML(note.id)}"
                    >

                        <button
                            class="delete-note"
                            data-delete-id="${escapeHTML(note.id)}"
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

    const title =
        noteTitle
            ? noteTitle.value.trim()
            : "";

    const text =
        noteText
            ? noteText.value.trim()
            : "";

    if (!text) {

        if (saveStatus) {

            saveStatus.textContent =
                "Write something first.";

            saveStatus.style.color =
                "#ff7ca8";
        }

        if (noteText) {
            noteText.focus();
        }

        return false;
    }

    const notes =
        getNotes();

    notes.push({

        id:
            generateNoteId(),

        title:
            title || "Untitled Note",

        text:
            text,

        createdAt:
            new Date().toISOString()
    });

    saveNotes(notes);

    if (noteTitle) {
        noteTitle.value = "";
    }

    if (noteText) {
        noteText.value = "";
    }

    if (saveStatus) {

        saveStatus.textContent =
            "✓ Note saved successfully";

        saveStatus.style.color =
            "#65e7ad";
    }

    renderNotes();

    return true;
}


if (saveNoteBtn) {

    saveNoteBtn.addEventListener(
        "click",
        saveCurrentNote
    );
}


if (noteText) {

    noteText.addEventListener(
        "keydown",
        function (event) {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key === "Enter"
            ) {

                event.preventDefault();

                saveCurrentNote();
            }
        }
    );
}


/* =========================================================
   CLEAR INPUT
   ========================================================= */

if (clearNoteBtn) {

    clearNoteBtn.addEventListener(
        "click",
        function () {

            if (noteTitle) {
                noteTitle.value = "";
            }

            if (noteText) {
                noteText.value = "";
            }

            if (saveStatus) {

                saveStatus.textContent =
                    "Ready for a new note.";

                saveStatus.style.color =
                    "";
            }
        }
    );
}


/* =========================================================
   DELETE INDIVIDUAL NOTE
   ========================================================= */

if (savedNotesList) {

    savedNotesList.addEventListener(
        "click",
        function (event) {

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
                getNotes().filter(
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
        function () {

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
        function () {

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

            link.href =
                url;

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
   =========================================================

   IMPORTANT:

   We do NOT use JSONP here.

   We first try ipapi.co through normal fetch.
   If that fails, we try ipwho.is.

   This gives the browser multiple chances to obtain
   the public IP and location information.

   ========================================================= */

async function loadPublicActivity() {

    setText(
        "activityIP",
        "Detecting..."
    );

    setText(
        "activityLocation",
        "Detecting..."
    );

    setText(
        "activityOrg",
        "Detecting..."
    );

    setText(
        "activityTimezone",
        "Detecting..."
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

    let data = null;


    /* -----------------------------------------------------
       SOURCE 1 - IPAPI
       ----------------------------------------------------- */

    try {

        const response =
            await fetch(
                "https://ipapi.co/json/",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (response.ok) {

            const result =
                await response.json();

            if (result && result.ip) {

                data = normalizeIPData(
                    result,
                    "ipapi"
                );
            }
        }

    } catch (error) {

        console.warn(
            "ipapi.co failed:",
            error
        );
    }


    /* -----------------------------------------------------
       SOURCE 2 - IPWHO
       ----------------------------------------------------- */

    if (!data) {

        try {

            const response =
                await fetch(
                    "https://ipwho.is/",
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );

            if (response.ok) {

                const result =
                    await response.json();

                if (
                    result &&
                    result.success !== false &&
                    result.ip
                ) {

                    data = normalizeIPData(
                        result,
                        "ipwho"
                    );
                }
            }

        } catch (error) {

            console.warn(
                "ipwho.is failed:",
                error
            );
        }
    }


    /* -----------------------------------------------------
       IF BOTH SOURCES FAILED
       ----------------------------------------------------- */

    if (!data) {

        showActivityError();

        /*
         * Try weather from browser geolocation
         * if the user gives permission.
         */
        requestBrowserWeather();

        return;
    }


    /* -----------------------------------------------------
       DISPLAY IP INFORMATION
       ----------------------------------------------------- */

    updatePublicActivity(data);


    /* -----------------------------------------------------
       WEATHER
       ----------------------------------------------------- */

    if (
        isValidCoordinate(data.latitude) &&
        isValidCoordinate(data.longitude)
    ) {

        await loadWeather(
            data.latitude,
            data.longitude,
            data.city,
            data.country
        );

    } else {

        requestBrowserWeather();
    }
}


/* =========================================================
   NORMALIZE IP DATA
   ========================================================= */

function normalizeIPData(data, source) {

    let organization =
        data.org ||
        data.organization ||
        "";

    let country =
        data.country_name ||
        data.country ||
        data.countryName ||
        "";

    let city =
        data.city ||
        "";

    let region =
        data.region ||
        data.region_name ||
        data.regionName ||
        "";

    let timezone =
        data.timezone ||
        "";

    if (
        typeof timezone === "object" &&
        timezone !== null
    ) {
        timezone =
            timezone.id ||
            timezone.name ||
            "";
    }

    let latitude =
        data.latitude;

    let longitude =
        data.longitude;


    /* IPWHO has connection information */

    if (
        !organization &&
        data.connection
    ) {

        organization =
            data.connection.org ||
            data.connection.isp ||
            data.connection.domain ||
            "";
    }


    /* IPWHO may use capitalized fields */

    if (
        latitude === undefined &&
        data.latitude !== undefined
    ) {
        latitude = data.latitude;
    }

    if (
        longitude === undefined &&
        data.longitude !== undefined
    ) {
        longitude = data.longitude;
    }


    return {

        ip:
            data.ip || "",

        city:
            city,

        region:
            region,

        country:
            country,

        organization:
            organization,

        timezone:
            timezone,

        latitude:
            Number(latitude),

        longitude:
            Number(longitude),

        source:
            source,

        isp:
            data.isp ||
            (
                data.connection
                    ? data.connection.isp
                    : ""
            ) ||
            organization,

        asn:
            data.asn ||
            (
                data.connection
                    ? data.connection.asn
                    : ""
            ) ||
            ""
    };
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
            data.country
        ]
        .filter(Boolean)
        .join(", ");


    setText(
        "activityLocation",
        location || "Unavailable"
    );


    /*
     * Organization can be unavailable from some IP
     * providers. Use ISP as a secondary source.
     */

    const organization =
        data.organization ||
        data.isp ||
        "Unavailable";


    setText(
        "activityOrg",
        organization
    );


    setText(
        "activityTimezone",
        data.timezone ||
        Intl.DateTimeFormat()
            .resolvedOptions()
            .timeZone ||
        "Unavailable"
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


    /*
     * Optional deeper information.
     *
     * These IDs are only updated if they exist in
     * your HTML. Therefore they will not break
     * older designs.
     */

    setTextIfExists(
        "activityISP",
        data.isp || data.organization || "Unavailable"
    );

    setTextIfExists(
        "activityASN",
        data.asn || "Unavailable"
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
            .timeZone ||
        "Unavailable"
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

    setTextIfExists(
        "activityISP",
        "Unavailable"
    );

    setTextIfExists(
        "activityASN",
        "Unavailable"
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
   OPTIONAL TEXT SETTER
   ========================================================= */

function setTextIfExists(id, value) {

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


    if (
        /Edg\//i.test(ua)
    ) {
        return "Microsoft Edge";
    }


    if (
        /OPR\//i.test(ua)
    ) {
        return "Opera";
    }


    if (
        /Chrome\//i.test(ua) &&
        !/Edg\//i.test(ua)
    ) {
        return "Google Chrome";
    }


    if (
        /Firefox\//i.test(ua)
    ) {
        return "Firefox";
    }


    if (
        /Safari\//i.test(ua) &&
        !/Chrome\//i.test(ua)
    ) {
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


    if (
        /Macintosh|Mac OS/i.test(ua)
    ) {
        return "macOS";
    }


    if (/Android/i.test(ua)) {
        return "Android";
    }


    if (
        /iPhone|iPad|iPod/i.test(ua)
    ) {
        return "iOS";
    }


    if (/Linux/i.test(ua)) {
        return "Linux";
    }


    return "Unknown";
}


/* =========================================================
   COORDINATE VALIDATION
   ========================================================= */

function isValidCoordinate(value) {

    return (
        typeof value === "number" &&
        Number.isFinite(value) &&
        value >= -90 &&
        value <= 90
    );
}


/* =========================================================
   BROWSER GEOLOCATION FALLBACK
   =========================================================

   This is particularly useful when the IP provider
   cannot supply coordinates.

   The browser asks the user for permission.

   If permission is granted, weather is obtained from
   the actual device location.

   ========================================================= */

function requestBrowserWeather() {

    if (
        !navigator.geolocation
    ) {

        loadFallbackWeather();

        return;
    }


    setWeatherLoading(
        "Getting your location..."
    );


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            loadWeather(
                latitude,
                longitude,
                "Your location",
                ""
            );
        },


        function (error) {

            console.warn(
                "Browser geolocation failed:",
                error
            );

            loadFallbackWeather();
        },


        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
        }
    );
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
        !isValidCoordinate(latitude) ||
        !isValidCoordinate(longitude)
    ) {

        loadFallbackWeather();

        return;
    }


    setWeatherLoading(
        "Loading weather..."
    );


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


        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                function () {
                    controller.abort();
                },
                12000
            );


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    cache: "no-store",
                    signal: controller.signal
                }
            );


        clearTimeout(timeout);


        if (!response.ok) {

            throw new Error(
                `Weather HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        if (
            !data ||
            !data.current
        ) {

            throw new Error(
                "Invalid weather response"
            );
        }


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


        /*
         * Do NOT keep the card stuck on Loading.
         */

        showWeatherUnavailable();
    }
}


/* =========================================================
   FALLBACK WEATHER
   =========================================================

   IMPORTANT:
   We no longer use New York as fake weather.

   If the user's real location cannot be detected,
   the card says unavailable instead of showing
   misleading weather.

   ========================================================= */

function loadFallbackWeather() {

    showWeatherUnavailable();
}


/* =========================================================
   WEATHER UNAVAILABLE
   ========================================================= */

function showWeatherUnavailable() {

    setText(
        "weatherTemp",
        "--"
    );

    setText(
        "weatherFeels",
        "--"
    );

    setText(
        "weatherHumidity",
        "--"
    );

    setText(
        "weatherWind",
        "--"
    );

    setText(
        "weatherCondition",
        "Weather unavailable"
    );

    setText(
        "weatherIcon",
        "🌡️"
    );

    setText(
        "weatherCity",
        "Location unavailable"
    );

    setText(
        "weatherCountry",
        ""
    );

    setText(
        "clothingText",
        "Weather information could not be loaded."
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
        loading.style.display = "none";
    }


    if (content) {
        content.style.display = "flex";
    }
}


/* =========================================================
   WEATHER LOADING
   ========================================================= */

function setWeatherLoading(message) {

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
            "block";

        loading.textContent =
            message;
    }


    if (content) {

        content.style.display =
            "none";
    }
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

        showWeatherUnavailable();

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
        country
            ? `· ${country}`
            : ""
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


    if (
        snowy ||
        feels <= 0
    ) {

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
