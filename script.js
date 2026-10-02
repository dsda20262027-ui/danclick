let score = Number(localStorage.getItem("danclick-score")) || 0;
let clicks = Number(localStorage.getItem("danclick-clicks")) || 0;
let best = Number(localStorage.getItem("danclick-best")) || 0;

const scoreEl = document.querySelector("#score");
const clicksEl = document.querySelector("#clicks");
const bestEl = document.querySelector("#best");

function render() {
  scoreEl.textContent = score;
  clicksEl.textContent = clicks;
  bestEl.textContent = best;
}

document.querySelector("#clickButton").addEventListener("click", () => {
  score++;
  clicks++;
  if (score > best) best = score;
  localStorage.setItem("danclick-score", score);
  localStorage.setItem("danclick-clicks", clicks);
  localStorage.setItem("danclick-best", best);
  render();
});

document.querySelector("#resetButton").addEventListener("click", () => {
  score = 0;
  clicks = 0;
  localStorage.setItem("danclick-score", score);
  localStorage.setItem("danclick-clicks", clicks);
  render();
});

render();