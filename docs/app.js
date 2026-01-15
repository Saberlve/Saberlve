"use strict";

const root = document.documentElement;
const body = document.body;

const navToggle = document.querySelector(".nav-toggle");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    body.classList.toggle("nav-open");
  });
}

let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let glowX = targetX;
let glowY = targetY;

window.addEventListener("mousemove", (event) => {
  targetX = event.clientX;
  targetY = event.clientY;
});

const tickGlow = () => {
  glowX += (targetX - glowX) * 0.08;
  glowY += (targetY - glowY) * 0.08;
  root.style.setProperty("--mx", `${glowX}px`);
  root.style.setProperty("--my", `${glowY}px`);
  requestAnimationFrame(tickGlow);
};
requestAnimationFrame(tickGlow);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const counters = Array.from(document.querySelectorAll("[data-counter]")).map((el) => ({
  el,
  base: Number(el.getAttribute("data-base")) || 0,
}));

if (counters.length) {
  setInterval(() => {
    counters.forEach((counter) => {
      const jitter = Math.floor(Math.random() * 7) - 3;
      const next = Math.max(0, counter.base + jitter);
      counter.el.textContent = next;
    });
  }, 1200);
}

const nodes = Array.from(document.querySelectorAll(".pipeline-node"));
if (nodes.length) {
  let index = 0;
  setInterval(() => {
    nodes.forEach((node) => node.classList.remove("active"));
    nodes[index].classList.add("active");
    index = (index + 1) % nodes.length;
  }, 1100);
}

document.querySelectorAll(".tilt").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -8;
    const ry = ((x / rect.width) - 0.5) * 8;
    card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
  });

  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  });
});

const canvas = document.getElementById("field");
const ctx = canvas ? canvas.getContext("2d") : null;
const particles = [];
const particleCount = 70;
const maxDist = 140;
const mouse = { x: targetX, y: targetY };

const resizeCanvas = () => {
  if (!canvas || !ctx) {
    return;
  }
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
};

const seedParticles = () => {
  particles.length = 0;
  for (let i = 0; i < particleCount; i += 1) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: 1.2 + Math.random() * 1.6,
    });
  }
};

const animateField = () => {
  if (!ctx) {
    return;
  }
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = "rgba(30, 41, 59, 0.18)";

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < maxDist) {
        const alpha = 1 - dist / maxDist;
        ctx.strokeStyle = `rgba(11, 87, 208, ${alpha * 0.28})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  particles.forEach((p) => {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < maxDist) {
      const alpha = 1 - dist / maxDist;
      ctx.strokeStyle = `rgba(14, 165, 233, ${alpha * 0.35})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }
  });

  requestAnimationFrame(animateField);
};

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

window.addEventListener("resize", () => {
  resizeCanvas();
  seedParticles();
});

resizeCanvas();
seedParticles();
requestAnimationFrame(animateField);
