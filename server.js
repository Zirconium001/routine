const express = require("express");
const XLSX = require("xlsx");
const path = require("path");

const app = express();

// Serve static files from "public"
app.use(express.static(path.join(__dirname, "public")));

// -------------------------
// Helper: convert Excel time or "HH:MM" string to today's Date
// -------------------------
function applyTodayTime(timeValue) {
    if (typeof timeValue === "string") {
        const [h, m] = timeValue.split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    }

    if (typeof timeValue === "number") {
        const totalMinutes = Math.round(timeValue * 24 * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d;
    }

    return null;
}

// -------------------------
// Format Date object to "HH:MM"
// -------------------------
function formatTime(dateObj) {
    if (!dateObj) return "";
    const h = String(dateObj.getHours()).padStart(2, '0');
    const m = String(dateObj.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

// -------------------------
// Read today's classes
// -------------------------
function getClasses() {
    const workbook = XLSX.readFile("routine.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Auto-fill missing Day values
    let lastDay = "";
    data.forEach(row => {
        if (row.Day && row.Day.trim() !== "") {
            lastDay = row.Day.trim();
        } else {
            row.Day = lastDay;
        }
    });

    const now = new Date();
    const weekday = now.toLocaleDateString("en-US", { weekday: "long" });

    // Filter today’s classes
    const today = data.filter(row => row.Day === weekday);

    // Convert Start/End to Date objects and overwrite with formatted strings
    today.forEach(row => {
        row.StartTime = applyTodayTime(row.Start);
        row.EndTime = applyTodayTime(row.End);

        // Overwrite Start/End fields with formatted HH:MM
        row.Start = formatTime(row.StartTime);
        row.End = formatTime(row.EndTime);
    });

    const current = today.find(row => row.StartTime <= now && now < row.EndTime) || null;

    const next = today
        .filter(row => row.StartTime > now)
        .sort((a, b) => a.StartTime - b.StartTime)[0] || null;

    return { current, next };
}

// -------------------------
// Routes
// -------------------------
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,  "index.html"));
});

app.get("/api/classes", (req, res) => {
    const data = getClasses();
    res.json(data);
});

// -------------------------
// Start Server (ONLY ONCE)
// -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
