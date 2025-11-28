async function loadClasses() {
    try {
        const res = await fetch("/api/classes");
        const data = await res.json();

        const currentDiv = document.getElementById("current");
        const nextDiv = document.getElementById("next");

        // Current class
        if (data.current) {
            currentDiv.innerHTML = `
                <h2>Current Class</h2>
                <p><strong>${data.current.Subject}</strong></p>
                <p>Room: ${data.current.Room}</p>
                <p>Ends at: ${data.current.End}</p>
            `;
        } else {
            currentDiv.innerHTML = "<h2>No class right now 😊</h2>";
        }

        // Next class
        if (data.next) {
            nextDiv.innerHTML = `
                <h2>Next Class</h2>
                <p><strong>${data.next.Subject}</strong></p>
                <p>Room: ${data.next.Room}</p>
                <p>Starts at: ${data.next.Start}</p>
            `;
        } else {
            nextDiv.innerHTML = "<h2>No more classes today 🎉</h2>";
        }

    } catch (err) {
        console.error("Error loading classes:", err);
    }
}

// Load immediately and refresh every 30 seconds
loadClasses();
setInterval(loadClasses, 30 * 1000);
