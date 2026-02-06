let canvas = document.createElement("canvas");
canvas.id = "draw-canvas";
document.body.appendChild(canvas);

let ctx = canvas.getContext("2d");
let drawing = false;
let mode = "draw"; // draw | highlight
let enabled = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

ctx.lineCap = "round";

function startDraw(e) {
  if (!enabled) return;
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);
}

function draw(e) {
  if (!drawing || !enabled) return;

  ctx.lineWidth = mode === "highlight" ? 20 : 3;
  ctx.strokeStyle =
    mode === "highlight"
      ? "rgba(255, 255, 0, 0.4)"
      : "red";

  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke();
}

function stopDraw() {
  drawing = false;
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseleave", stopDraw);

/* Messages from popup */
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "enable") {
    enabled = true;
    canvas.style.pointerEvents = "auto";
  }

  if (msg.action === "disable") {
    enabled = false;
    canvas.style.pointerEvents = "none";
  }

  if (msg.action === "clear") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  if (msg.action === "mode") {
    mode = msg.value;
  }
});
