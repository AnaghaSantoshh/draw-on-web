/* ================= Canvas Setup ================= */

const canvas = document.createElement("canvas");
canvas.id = "draw-canvas";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

let enabled = true;
let drawing = false;
let mode = "draw";
let strokeSize = "medium";
let currentColor = "#ff0000";

const STROKE_MAP = {
  draw: { small: 2, medium: 4, large: 7 }
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

ctx.lineCap = "round";

/* ================= Toolbar ================= */

const toolbar = document.createElement("div");
toolbar.id = "draw-toolbar";
toolbar.innerHTML = `
  <button class="toolbar-btn active" id="draw" data-label="Draw">✏️</button>

  <div id="stroke-sizes" class="show">
    <button class="toolbar-btn" id="small">S</button>
    <button class="toolbar-btn active" id="medium">M</button>
    <button class="toolbar-btn" id="large">L</button>
  </div>

  <label class="toolbar-btn" id="color-btn" data-label="Pick color">
  🫟
  <input type="color" id="color-picker" />
</label>


  <button class="toolbar-btn" id="note" data-label="Sticky note">📌</button>
  <button class="toolbar-btn" id="clear" data-label="Clear">❌</button>
  <button class="toolbar-btn" id="disable" data-label="Disable">🚫</button>
  <button class="toolbar-btn" id="help" data-label="Help">💡</button>
`;
document.body.appendChild(toolbar);

/* ================= Color Picker (REAL FIX) ================= */

const colorBtn = document.getElementById("color-btn");
const colorPicker = document.getElementById("color-picker");

colorBtn.style.position = "relative";
colorPicker.style.position = "absolute";
colorPicker.style.inset = "0";
colorPicker.style.opacity = "0";
colorPicker.style.cursor = "pointer";

colorPicker.onchange = e => {
  currentColor = e.target.value;
  colorBtn.style.background = currentColor;
};

/* ================= Tool Actions ================= */

document.getElementById("draw").onclick = () => {
  mode = "draw";
  enabled = true;
  canvas.style.pointerEvents = "auto";
};

document.getElementById("note").onclick = () => {
  mode = "note";
  enabled = false;
  canvas.style.pointerEvents = "none";

  addStickyNote(
    window.scrollX + window.innerWidth / 2 - 90,
    window.scrollY + window.innerHeight / 2 - 70
  );
};

["small", "medium", "large"].forEach(size => {
  document.getElementById(size).onclick = () => {
    strokeSize = size;
    ["small","medium","large"].forEach(s =>
      document.getElementById(s).classList.remove("active")
    );
    document.getElementById(size).classList.add("active");
  };
});

/* ================= Drawing ================= */

canvas.addEventListener("mousedown", e => {
  if (!enabled) return;
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);
});

canvas.addEventListener("mousemove", e => {
  if (!drawing) return;
  ctx.lineWidth = STROKE_MAP.draw[strokeSize];
  ctx.strokeStyle = currentColor;
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
});

canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseleave", () => drawing = false);

/* ================= Sticky Notes ================= */

function addStickyNote(x, y) {
  const note = document.createElement("div");
  note.className = "sticky-note";
  note.style.left = `${x}px`;
  note.style.top = `${y}px`;

  const header = document.createElement("div");
  header.className = "sticky-header";

  const trash = document.createElement("button");
  trash.className = "sticky-delete";
  trash.textContent = "🗑";
  trash.onclick = e => {
    e.stopPropagation();
    note.remove();
  };

  header.appendChild(trash);

  const palette = document.createElement("div");
  palette.className = "sticky-palette";

  ["#FFF9C4","#FFECB3","#E1F5FE","#E8F5E9","#F3E5F5"].forEach(color => {
    const dot = document.createElement("span");
    dot.style.background = color;
    dot.onclick = e => {
      e.stopPropagation();
      note.style.background = color;
    };
    palette.appendChild(dot);
  });

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Type here...";

  note.append(header, palette, textarea);
  document.body.appendChild(note);

  note.onclick = () => textarea.focus();

  /* ====== DRAG (FINAL, STABLE FIX) ====== */
  let dragging = false;
  let startX, startY;

  header.onmousedown = e => {
    e.preventDefault();
    dragging = true;
    note.classList.add("dragging");

    startX = e.pageX - note.offsetLeft;
    startY = e.pageY - note.offsetTop;

    const move = e => {
      if (!dragging) return;
      note.style.left = e.pageX - startX + "px";
      note.style.top = e.pageY - startY + "px";
    };

    const stop = () => {
      dragging = false;
      note.classList.remove("dragging");
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", stop);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop, { once: true });
  };
}

/* ================= Clear / Disable ================= */

document.getElementById("clear").onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.querySelectorAll(".sticky-note").forEach(n => n.remove());
};

document.getElementById("disable").onclick = () => {
  enabled = false;
  canvas.style.pointerEvents = "none";
};

/* ================= Help (Bulb restored) ================= */

document.getElementById("help").onclick = () => {
  const old = document.getElementById("draw-help");
  if (old) return old.remove();

  const help = document.createElement("div");
  help.id = "draw-help";
  help.innerHTML = `
    <b>How to use</b><br><br>
    ✏️ Draw on page<br>
    🫟 Pick drawing color<br>
    📌 Add sticky note<br>
    🟡 Drag by top bar<br>
    🎨 Change note color<br>
    🗑 Delete note<br>
    ❌ Clear all
  `;
  document.body.appendChild(help);
};
