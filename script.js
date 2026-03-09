// === DATA ===
let presets = JSON.parse(localStorage.getItem("presets")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

const presetsView = document.getElementById("presets-view");
const workoutView = document.getElementById("workout-view");
const historyView = document.getElementById("history-view");

// === NAVIGATION ===
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

  // === JATKA TRENIÄ NAPPI ===
  const savedWorkout = JSON.parse(localStorage.getItem("currentWorkout"));

  if (savedWorkout) {
    const btn = document.createElement("button");
    btn.textContent = "▶ Jatka treeniä";
    btn.className = "continue-btn";

    btn.onclick = () => startWorkout(savedWorkout, true);

    presetsView.appendChild(btn);
  }

  let tempExercises = [];

  const addDiv = document.createElement("div");

  addDiv.className = "preset";

  addDiv.innerHTML = `
  <h2>Uusi Treeniohjelma</h2>

  Nimi:
  <input id="new-preset-name" class="teksti">

  <h3>Lisää liike</h3>

  Liike
  <input id="new-preset-exercise" class="teksti">

  Setit
  <input type="number" id="new-preset-sets" value="3" min="1">

  <button id="add-exercise-btn">+ Lisää liike</button>

  <ul id="exercise-list"></ul>

  <button id="save-preset-btn">Tallenna</button>
  `;

  presetsView.appendChild(addDiv);

  const list = document.getElementById("exercise-list");

  document.getElementById("add-exercise-btn").onclick = () => {
    const name = document.getElementById("new-preset-exercise").value.trim();
    const sets = parseInt(document.getElementById("new-preset-sets").value);

    if (!name || sets < 1) return;

    tempExercises.push({ name, sets });

    const li = document.createElement("li");
    li.textContent = `${name} (${sets} settiä)`;

    list.appendChild(li);

    document.getElementById("new-preset-exercise").value = "";
  };

  document.getElementById("save-preset-btn").onclick = () => {
    const name = document.getElementById("new-preset-name").value.trim();

    if (!name || tempExercises.length === 0) return;

    presets.push({
      name,
      exercises: tempExercises,
    });

    localStorage.setItem("presets", JSON.stringify(presets));

    renderPresets();
  };

  // === LISTAA PRESETIT ===

  presets.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "preset";

    div.innerHTML = `
    <strong>${p.name}</strong>
    <button class="start-btn">Aloita</button>
    <button class="delete-btn">🗑</button>
    `;

    presetsView.appendChild(div);

    div.querySelector(".start-btn").onclick = () => startWorkout(p);

    div.querySelector(".delete-btn").onclick = () => {
      if (!confirm("Poistetaanko treeniohjelma?")) return;

      presets.splice(i, 1);

      localStorage.setItem("presets", JSON.stringify(presets));

      renderPresets();
    };
  });
}

// === START WORKOUT ===
function startWorkout(preset, resume = false) {
  presetsView.style.display = "none";
  workoutView.style.display = "block";

  workoutView.innerHTML = `<h2>${preset.name}</h2>`;

  let saved = JSON.parse(localStorage.getItem("currentWorkout"));

  // jos ei jatketa treeniä
  if (!saved || !resume) {
    saved = {
      name: preset.name,
      exercises: preset.exercises.map((ex) => ({
        name: ex.name,
        sets: Array(ex.sets)
          .fill()
          .map(() => ({
            weight: 0,
            reps: 0,
          })),
      })),
    };

    localStorage.setItem("currentWorkout", JSON.stringify(saved));
  }

  saved.exercises.forEach((ex, i) => {
    const div = document.createElement("div");
    div.className = "exercise";

    div.innerHTML = `
    <h3>${ex.name}</h3>
    <div id="sets-${i}"></div>
    `;

    workoutView.appendChild(div);

    const setsDiv = div.querySelector(`#sets-${i}`);

    ex.sets.forEach((set, s) => {
      const setDiv = document.createElement("div");

      setDiv.innerHTML = `
      <br>Setti ${s + 1}<br>

      Paino
      <input type="number"
      class="weight"
      value="${set.weight}"
      data-ex="${i}"
      data-set="${s}"> kg

      <br>

      Toistot
      <input type="number"
      class="reps"
      value="${set.reps}"
      data-ex="${i}"
      data-set="${s}">
      `;

      setsDiv.appendChild(setDiv);
    });
  });

  function updateStorage(e) {
    const ex = e.target.dataset.ex;
    const set = e.target.dataset.set;

    let data = JSON.parse(localStorage.getItem("currentWorkout"));

    const weight = document.querySelector(
      `.weight[data-ex="${ex}"][data-set="${set}"]`,
    ).value;

    const reps = document.querySelector(
      `.reps[data-ex="${ex}"][data-set="${set}"]`,
    ).value;

    data.exercises[ex].sets[set] = {
      weight: parseInt(weight) || 0,
      reps: parseInt(reps) || 0,
    };

    localStorage.setItem("currentWorkout", JSON.stringify(data));
  }

  document.querySelectorAll(".weight,.reps").forEach((input) => {
    input.addEventListener("input", updateStorage);
  });

  const finishBtn = document.createElement("button");

  finishBtn.textContent = "Tallenna Treeni";

  workoutView.appendChild(finishBtn);

  finishBtn.onclick = () => {
    const data = JSON.parse(localStorage.getItem("currentWorkout"));

    const workout = {
      date: new Date().toISOString().split("T")[0],
      preset: data.name,
      exercises: data.exercises,
    };

    history.push(workout);

    localStorage.setItem("history", JSON.stringify(history));

    localStorage.removeItem("currentWorkout");

    alert("Treeni tallennettu!");

    workoutView.style.display = "none";
    presetsView.style.display = "block";

    renderPresets();
  };
}

// === HISTORY ===
function renderHistory() {
  historyView.innerHTML = "";

  if (history.length === 0) {
    historyView.innerHTML = "Ei treenejä vielä";

    return;
  }

  history.forEach((h, i) => {
    const div = document.createElement("div");

    div.className = "history-item";

    div.innerHTML = `
    <strong>${h.date} - ${h.preset}</strong>
    <button class="delete-history">🗑</button>
    <br>
    `;

    h.exercises.forEach((ex) => {
      div.innerHTML += `${ex.name}<br>`;

      ex.sets.forEach((s, j) => {
        div.innerHTML += `&nbsp;&nbsp;Setti ${j + 1}: ${s.weight}kg × ${s.reps}<br>`;
      });
    });

    historyView.appendChild(div);

    div.querySelector(".delete-history").onclick = () => {
      if (!confirm("Poistetaanko treeni?")) return;

      history.splice(i, 1);

      localStorage.setItem("history", JSON.stringify(history));

      renderHistory();
    };
  });
}

// INIT
renderPresets();
