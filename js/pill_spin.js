const container = document.querySelector(".section-2");
const row = document.querySelector(".section-2 .row");

let rafId = null;
const EASE_DURATION = 600; // ms

// Must match the CSS: `animation: scroll-left 20s linear infinite;`
const ANIM_DURATION_S = 20;

// Row is 4 duplicated pill sets (matches the CSS keyframe's translateX(-25%)),
// so one full cycle is a quarter of the total scrollWidth.
const ROW_CYCLE_WIDTH = () => row.scrollWidth / 4;

// Derive real scroll speed from the row's actual width and the CSS duration,
// instead of hardcoding a guess that can drift out of sync with the CSS.
const PX_PER_SECOND = () => ROW_CYCLE_WIDTH() / ANIM_DURATION_S;

function getTranslateX(el) {
  const matrix = getComputedStyle(el).transform;
  if (matrix === "none") return 0;
  const values = matrix.match(/matrix.*\((.+)\)/)[1].split(", ");
  return parseFloat(values[4]);
}

// Cubic ease-out: fast start, slows smoothly into the stop
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Cubic ease-in: slow start, ramps up smoothly to full speed — mirror of easeOutCubic
function easeInCubic(t) {
  return t * t * t;
}

function animateEaseToStop(startX, distance, startTime) {
  const elapsed = performance.now() - startTime;
  const t = Math.min(elapsed / EASE_DURATION, 1);
  const eased = easeOutCubic(t);

  row.style.transform = `translateX(${startX + distance * eased}px)`;

  if (t < 1) {
    rafId = requestAnimationFrame(() =>
      animateEaseToStop(startX, distance, startTime),
    );
  } else {
    rafId = null;
  }
}

function animateEaseFromStop(startX, distance, startTime) {
  const elapsed = performance.now() - startTime;
  const t = Math.min(elapsed / EASE_DURATION, 1);
  const eased = easeInCubic(t);

  row.style.transform = `translateX(${startX + distance * eased}px)`;

  if (t < 1) {
    rafId = requestAnimationFrame(() =>
      animateEaseFromStop(startX, distance, startTime),
    );
  } else {
    // Ramp finished at full speed — hand off to the CSS animation with zero visual jump.
    // Figure out what point in the keyframe cycle matches our current position, and
    // start the animation from exactly there via a negative animation-delay.
    const finalX = startX + distance;
    const cycleWidth = ROW_CYCLE_WIDTH();
    const cycleProgress =
      (((-finalX % cycleWidth) + cycleWidth) % cycleWidth) / cycleWidth; // 0–1

    row.style.transform = "";
    row.style.animationDelay = `-${cycleProgress * ANIM_DURATION_S}s`;
    row.classList.remove("is-paused");

    rafId = null;
  }
}

container.addEventListener("mouseenter", () => {
  // Read the live animated position while the CSS animation is still running
  const startX = getTranslateX(row);

  // Remove the animation so our inline transform writes below actually stick
  row.classList.add("is-paused");
  row.style.transform = `translateX(${startX}px)`;

  // Ease from here to a further stop point over EASE_DURATION, same direction as the scroll
  const distance = -((PX_PER_SECOND() * EASE_DURATION) / 1000);

  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() =>
    animateEaseToStop(startX, distance, performance.now()),
  );
});

container.addEventListener("mouseleave", () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  const startX = getTranslateX(row);
  const distance = -((PX_PER_SECOND() * EASE_DURATION) / 1000);

  rafId = requestAnimationFrame(() =>
    animateEaseFromStop(startX, distance, performance.now()),
  );
});