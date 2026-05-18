async function loadSchedule() {

  try {

    const response = await fetch(
      `schedule.json?v=${Date.now()}`
    );

    const data = await response.json();

    const scheduleList = document.getElementById("scheduleList");

    scheduleList.innerHTML = "";

    const days = [
      ["MON", data.mon],
      ["TUE", data.tue],
      ["WED", data.wed],
      ["THU", data.thu],
      ["FRI", data.fri],
      ["SAT", data.sat],
      ["SUN", data.sun]
    ];

    days.forEach(([day, game]) => {

      const row = document.createElement("div");

      row.className = "schedule-item";

      row.innerHTML = `
        <div class="day">${day}</div>
        <div class="game">${game}</div>
      `;

      scheduleList.appendChild(row);

    });

  } catch (err) {

    console.log("Schedule failed to load", err);

  }
}

loadSchedule();

setInterval(loadSchedule, 30000);