
// ======================================
// 1. EVENTS ARRAY
// ======================================

const events = [
    {
        id: 1,
        title: "Code Clash",
        type: "competition",
        day: 1,
        time: "10:00",
        venue: "Lab 1",
        seats: 30
    },
    {
        id: 2,
        title: "AI Innovation Workshop",
        type: "workshop",
        day: 1,
        time: "11:00",
        venue: "Lab 2",
        seats: 25
    },
    {
        id: 3,
        title: "Future of Artificial Intelligence",
        type: "talk",
        day: 1,
        time: "12:00",
        venue: "Auditorium",
        seats: 100
    },
    {
        id: 4,
        title: "Web Design Challenge",
        type: "competition",
        day: 1,
        time: "14:00",
        venue: "Lab 3",
        seats: 40
    },
    {
        id: 5,
        title: "Cyber Security Workshop",
        type: "workshop",
        day: 2,
        time: "09:00",
        venue: "Lab 2",
        seats: 25
    },
    {
        id: 6,
        title: "Tech Startup Competition",
        type: "competition",
        day: 2,
        time: "10:00",
        venue: "Main Hall",
        seats: 35
    },
    {
        id: 7,
        title: "Future of Technology",
        type: "talk",
        day: 2,
        time: "11:00",
        venue: "Auditorium",
        seats: 100
    },
    {
        id: 8,
        title: "Mobile App Development",
        type: "workshop",
        day: 2,
        time: "13:00",
        venue: "Lab 1",
        seats: 20
    }
];


// ======================================
// 2. LOCAL STORAGE FUNCTIONS
// ======================================

function getSavedEvents() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("savedEvents") || "[]"
        );

        if (!Array.isArray(saved)) {
            return [];
        }

        return [...new Set(
            saved.filter(id =>
                Number.isInteger(id) &&
                events.some(event => event.id === id)
            )
        )];

    } catch (error) {
        return [];
    }
}

function saveEvents(savedEvents) {
    try {
        localStorage.setItem(
            "savedEvents",
            JSON.stringify(savedEvents)
        );
    } catch (error) {
        console.error("Unable to save events:", error);
    }
}

function updateSavedCount() {
    const countElement = document.getElementById("savedCount");

    if (countElement) {
        countElement.textContent = getSavedEvents().length;
    }
}


// ======================================
// 3. THEME TOGGLE
// ======================================

const themeButton = document.getElementById("themeToggle");

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    if (themeButton) {
        themeButton.textContent =
            theme === "dark" ? "Light Mode" : "Dark Mode";
    }
}

let currentTheme;

try {
    currentTheme = localStorage.getItem("theme");
} catch (error) {
    currentTheme = null;
}

if (currentTheme !== "dark" && currentTheme !== "light") {
    currentTheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches ? "dark" : "light";
}

applyTheme(currentTheme);

if (themeButton) {
    themeButton.addEventListener("click", function () {
        currentTheme =
            currentTheme === "dark" ? "light" : "dark";

        applyTheme(currentTheme);

        try {
            localStorage.setItem("theme", currentTheme);
        } catch (error) {
            console.error("Unable to save theme:", error);
        }
    });
}


// ======================================
// 4. EVENTS PAGE - RENDER CARDS
// ======================================

const eventsContainer = document.getElementById("eventsContainer");

function formatTime(time) {
    const [hours, minutes] = time.split(":");
    const hour = Number(hours);

    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
}

function renderEvents(filteredEvents) {

    if (!eventsContainer) return;

    eventsContainer.replaceChildren();

    filteredEvents.forEach(event => {

        const card = document.createElement("article");
        card.className = "event-card";

        const badge = document.createElement("span");
        badge.className = `category-badge ${event.type}`;
        badge.textContent = event.type;

        const title = document.createElement("h2");
        title.textContent = event.title;

        const day = document.createElement("p");
        day.textContent = `Day: ${event.day}`;

        const time = document.createElement("p");
        time.textContent = `Time: ${formatTime(event.time)}`;

        const venue = document.createElement("p");
        venue.textContent = `Venue: ${event.venue}`;

        const seats = document.createElement("p");
        seats.textContent = `Available Seats: ${event.seats}`;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "save-btn";

        const savedEvents = getSavedEvents();
        const isSaved = savedEvents.includes(event.id);

        button.textContent = isSaved
            ? "★ Remove from my schedule"
            : "★ Add to my schedule";

        button.setAttribute(
            "aria-pressed",
            String(isSaved)
        );

        button.addEventListener("click", function () {

            const currentSaved = getSavedEvents();

            if (currentSaved.includes(event.id)) {

                const updated = currentSaved.filter(
                    id => id !== event.id
                );

                saveEvents(updated);

            } else {

                currentSaved.push(event.id);
                saveEvents(currentSaved);
            }

            updateSavedCount();
            filterEvents();
        });

        card.append(
            badge,
            title,
            day,
            time,
            venue,
            seats,
            button
        );

        eventsContainer.appendChild(card);
    });

    const noEvents = document.getElementById("noEvents");

    if (noEvents) {
        noEvents.hidden = filteredEvents.length !== 0;
    }

    const resultCount = document.getElementById("resultCount");

    if (resultCount) {
        resultCount.textContent =
            `${filteredEvents.length} events found`;
    }
}


// ======================================
// 5. SEARCH AND FILTERS
// ======================================

function filterEvents() {

    if (!eventsContainer) return;

    const searchInput = document.getElementById("searchInput");
    const typeFilter = document.getElementById("typeFilter");

    const searchText = searchInput.value.toLowerCase().trim();
    const selectedType = typeFilter.value;

    const selectedDay = document.querySelector(
        'input[name="dayFilter"]:checked'
    ).value;

    let filteredEvents = events.filter(event => {

        const matchesSearch = event.title
            .toLowerCase()
            .includes(searchText);

        const matchesType =
            selectedType === "all" ||
            event.type === selectedType;

        const matchesDay =
            selectedDay === "all" ||
            event.day === Number(selectedDay);

        return matchesSearch && matchesType && matchesDay;
    });

    filteredEvents.sort((a, b) => {

        if (a.day !== b.day) {
            return a.day - b.day;
        }

        return a.time.localeCompare(b.time);
    });

    renderEvents(filteredEvents);
}

if (eventsContainer) {

    document.getElementById("searchInput")
        .addEventListener("input", filterEvents);

    document.getElementById("typeFilter")
        .addEventListener("change", filterEvents);

    document.querySelectorAll('input[name="dayFilter"]')
        .forEach(radio => {
            radio.addEventListener("change", filterEvents);
        });

    filterEvents();
}


// ======================================
// 6. REGISTRATION EVENT OPTIONS
// ======================================

const eventSelect = document.getElementById("eventSelect");

if (eventSelect) {

    events.forEach(event => {

        const option = document.createElement("option");

        option.value = String(event.id);
        option.textContent = event.title;

        eventSelect.appendChild(option);
    });
}


// ======================================
// 7. REGISTRATION FORM VALIDATION
// ======================================

const registrationForm = document.getElementById(
    "registrationForm"
);

if (registrationForm) {

    registrationForm.addEventListener("submit", function (event) {

        event.preventDefault();

        // Get form values

        const fullName = document.getElementById("fullName")
            .value.trim();

        const email = document.getElementById("email")
            .value.trim();

        const regNumber = document.getElementById("regNumber")
            .value.trim();

        const selectedEvent = document.getElementById("eventSelect")
            .value;

        const teamSize = Number(
            document.getElementById("teamSize").value
        );

        const participation = document.querySelector(
            'input[name="participation"]:checked'
        );

        const tshirt = document.getElementById("tshirt").value;

        const terms = document.getElementById("terms").checked;

        // Clear previous errors

        const errorIds = [
            "nameError",
            "emailError",
            "regNumberError",
            "eventError",
            "teamSizeError",
            "participationError",
            "tshirtError",
            "termsError"
        ];

        errorIds.forEach(id => {
            document.getElementById(id).textContent = "";
        });

        let isValid = true;

        // Full name validation

        if (fullName.length < 3) {

            document.getElementById("nameError").textContent =
                "Please enter your full name (at least 3 characters).";

            isValid = false;
        }

        // Email validation

        const emailPattern = /^[^\s@]+@[^\s@]+\.edu\.pk$/i;

        if (!emailPattern.test(email)) {

            document.getElementById("emailError").textContent =
                "Email must end with .edu.pk.";

            isValid = false;
        }

        // Registration number validation

        const regPattern = /^F2026\d{6}$/;

        if (!regPattern.test(regNumber)) {

            document.getElementById("regNumberError").textContent =
                "Format must be F2026 followed by 6 digits.";

            isValid = false;
        }

        // Event validation

        const chosenEvent = events.find(
            item => item.id === Number(selectedEvent)
        );

        if (!chosenEvent) {

            document.getElementById("eventError").textContent =
                "Please select an event.";

            isValid = false;
        }

        // Team size validation

        if (
            !Number.isInteger(teamSize) ||
            teamSize < 1 ||
            teamSize > 4
        ) {

            document.getElementById("teamSizeError").textContent =
                "Team size must be between 1 and 4.";

            isValid = false;

        } else if (
            participation &&
            participation.value === "individual" &&
            teamSize !== 1
        ) {

            document.getElementById("teamSizeError").textContent =
                "Individual participation requires team size 1.";

            isValid = false;
        }

        // Participation validation

        if (!participation) {

            document.getElementById("participationError").textContent =
                "Please select a participation type.";

            isValid = false;
        }

        // T-shirt validation

        if (!tshirt) {

            document.getElementById("tshirtError").textContent =
                "Please select your T-shirt size.";

            isValid = false;
        }

        // Terms validation

        if (!terms) {

            document.getElementById("termsError").textContent =
                "You must agree to the terms and conditions.";

            isValid = false;
        }

        // Stop if form is invalid

        if (!isValid) {

            const firstError = registrationForm.querySelector(
                ".error:not(:empty)"
            );

            if (firstError) {
                firstError.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

            return;
        }

        // Show registration summary

        const summary = document.getElementById(
            "registrationSummary"
        );

        summary.replaceChildren();

        const details = [
            ["Name", fullName],
            ["Email", email],
            ["Registration Number", regNumber],
            ["Event", chosenEvent.title],
            ["Team Size", teamSize],
            ["Participation", participation.value],
            ["T-shirt Size", tshirt]
        ];

        details.forEach(detail => {

            const paragraph = document.createElement("p");
            const strong = document.createElement("strong");

            strong.textContent = detail[0] + ": ";

            paragraph.append(
                strong,
                document.createTextNode(String(detail[1]))
            );

            summary.appendChild(paragraph);
        });

        registrationForm.hidden = true;

        const successMessage = document.getElementById(
            "successMessage"
        );

        successMessage.hidden = false;

        successMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });


    // Register another event button

    document.getElementById("registerAgain")
        .addEventListener("click", function () {

            registrationForm.reset();

            registrationForm.hidden = false;

            document.getElementById("successMessage").hidden = true;

            registrationForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
}


// ======================================
// 8. UPDATE NAVBAR SAVED COUNT
// ======================================

updateSavedCount();
