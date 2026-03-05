// === DATA ===
let presets = JSON.parse(localStorage.getItem("presets")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

// === VIEWS ===
const presetsView = document.getElementById("presets-view");
const workoutView = document.getElementById("workout-view");
const historyView = document.getElementById("history-view");

// NAV BUTTONS
document.getElementById("view-presets-btn").addEventListener("click", () => {
  presetsView.style.display = "block";
  workoutView.style.display = "none";
  historyView.style.display = "none";
  renderPresets();
});
document.getElementById("view-history-btn").addEventListener("click", () => {
  presetsView.style.display = "none";
  workoutView.style.display = "none";
  historyView.style.display = "block";
  renderHistory();
});

// === RENDER PRESETS ===
function renderPresets() {
  presetsView.innerHTML = "";
  let tempExercises = [];

  const addDiv = document.createElement("div");
  addDiv.className = "preset";
  addDiv.innerHTML = `
    <h2>Uusi Preset</h2>
    Nimi: <input type="text"class="teksti" id="new-preset-name" ><br>
    Liike: <input type="text"class="teksti" id="new-preset-exercise">
    Setit: <input type="number"class="teksti" id="new-preset-sets" value="3" min="1">
    <button id="add-exercise-btn">+ Lisää liike</button><p>Liikkeet:</p>
    <ul id="exercise-list"></ul>
    
    <button id="save-preset-btn">Tallenna Preset</button>
  `;
  presetsView.appendChild(addDiv);

  const liikkeet = document.getElementById("exercise-list");

  document.getElementById("add-exercise-btn").addEventListener("click", () => {
    const exName = document.getElementById("new-preset-exercise").value.trim();
    const exSets = parseInt(document.getElementById("new-preset-sets").value);
    if (!exName || isNaN(exSets) || exSets < 1)
      return alert("Täytä kentät oikein!");
    tempExercises.push({ name: exName, sets: exSets });
    const li = document.createElement("li");
    li.textContent = `${exName} (${exSets} settiä)`;
    liikkeet.appendChild(li);
    document.getElementById("new-preset-exercise").value = "";
  });

  document.getElementById("save-preset-btn").addEventListener("click", () => {
    const name = document.getElementById("new-preset-name").value.trim();
    if (!name || tempExercises.length === 0)
      return alert("Anna nimi ja lisää vähintään yksi liike!");
    presets.push({ name, exercises: tempExercises });
    localStorage.setItem("presets", JSON.stringify(presets));
    tempExercises = [];
    renderPresets();
  });

  // Näytä olemassa olevat presetit
  presets.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "preset";
    div.innerHTML = `
      <strong>${p.name}</strong>
      <button data-index="${i}" class="start-btn">Aloita</button>
      <button data-index="${i}" class="edit-btn">✏️ Muokkaa</button>
      <button data-index="${i}" class="delete-btn">🗑 Poista</button>
    `;
    presetsView.appendChild(div);

    // Aloita treeni
    div
      .querySelector(".start-btn")
      .addEventListener("click", () => startWorkout(presets[i]));

    // Poista preset
    div.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm("Haluatko varmasti poistaa tämän presetin?")) {
        presets.splice(i, 1);
        localStorage.setItem("presets", JSON.stringify(presets));
        renderPresets();
      }
    });

    // Muokkaa preset
    div.querySelector(".edit-btn").addEventListener("click", () => {
      document.getElementById("new-preset-name").value = p.name;
      tempExercises = [...p.exercises];
      liikkeet.innerHTML = "";
      tempExercises.forEach((ex) => {
        const li = document.createElement("li");
        li.textContent = `${ex.name} (${ex.sets} settiä)`;
        liikkeet.appendChild(li);
      });
      document.getElementById("save-preset-btn").onclick = () => {
        const name = document.getElementById("new-preset-name").value.trim();
        if (!name || tempExercises.length === 0)
          return alert("Anna nimi ja lisää vähintään yksi liike!");
        presets[i] = { name, exercises: tempExercises };
        localStorage.setItem("presets", JSON.stringify(presets));
        tempExercises = [];
        renderPresets();
      };
    });
  });
}

// === START WORKOUT ===
function startWorkout(preset) {
  presetsView.style.display = "none";
  workoutView.style.display = "block";
  workoutView.innerHTML = `<h2>${preset.name}</h2>`;

  preset.exercises.forEach((ex, i) => {
    const div = document.createElement("div");
    div.className = "exercise";
    div.innerHTML = `<h3>${ex.name}</h3><div class="sets" id="sets-${i}"></div>`;
    workoutView.appendChild(div);

    const setsDiv = div.querySelector(`#sets-${i}`);
    for (let s = 0; s < ex.sets; s++) {
      const setDiv = document.createElement("div");
      setDiv.innerHTML = `Setti ${s + 1}: Paino <input type="number" value="0" class="weight">kg Reps <input type="number" value="0" class="reps">`;
      setsDiv.appendChild(setDiv);
    }
  });

  const finishBtn = document.createElement("button");
  finishBtn.textContent = "Tallenna Treeni";
  workoutView.appendChild(finishBtn);

  finishBtn.addEventListener("click", () => {
    const workoutData = {
      date: new Date().toISOString().split("T")[0],
      preset: preset.name,
      exercises: preset.exercises.map((ex, i) => {
        const setsDiv = document.getElementById(`sets-${i}`);
        const sets = Array.from(setsDiv.querySelectorAll("div")).map((d) => {
          const weight = parseInt(d.querySelector(".weight").value) || 0;
          const reps = parseInt(d.querySelector(".reps").value) || 0;
          return { weight, reps };
        });
        return { name: ex.name, sets };
      }),
    };
    history.push(workoutData);
    localStorage.setItem("history", JSON.stringify(history));
    alert("Treenisi tallennettu!");
    workoutView.style.display = "none";
    presetsView.style.display = "block";
    renderPresets();
  });
}

// === RENDER HISTORY ===
function renderHistory() {
  historyView.innerHTML = "";
  if (history.length === 0)
    return (historyView.innerHTML = "<p>Ei treenihistoriaa vielä.</p>");
  history.forEach((h, i) => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `<strong>${h.date} - ${h.preset}</strong>
      <button data-index="${i}" class="delete-history-btn">🗑 Poista</button><br>`;
    h.exercises.forEach((ex) => {
      div.innerHTML += `${ex.name}:<br>`;
      ex.sets.forEach((s, j) => {
        div.innerHTML += `&nbsp;&nbsp;Setti ${j + 1}: ${s.weight}kg × ${s.reps}<br>`;
      });
    });
    historyView.appendChild(div);

    div.querySelector(".delete-history-btn").addEventListener("click", () => {
      if (confirm("Haluatko varmasti poistaa tämän treenin?")) {
        history.splice(i, 1);
        localStorage.setItem("history", JSON.stringify(history));
        renderHistory();
      }
    });
  });
}

// INIT
renderPresets();

