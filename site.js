import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadSettings() {
  const ref = doc(db, "siteSettings", "main");
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  if (data.heroVideo) {
    const source = document.getElementById("heroVideoSource");
    const video = document.getElementById("heroVideo");

    if (source && video) {
      source.src = data.heroVideo;
      video.load();
      video.play();
    }
  }

  if (document.getElementById("storyTitle")) {
    document.getElementById("storyTitle").textContent = data.storyTitle || "Hikayemiz";
  }

  if (document.getElementById("storyText")) {
    document.getElementById("storyText").textContent = data.storyText || "";
  }

  if (document.getElementById("secretMessage")) {
    document.getElementById("secretMessage").textContent = data.secretMessage || "";
  }
}

async function loadGallery() {
  const container = document.getElementById("galleryContainer");
  if (!container) return;

  const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  container.innerHTML = "";

  snapshot.forEach((doc) => {
    const item = doc.data();

    container.innerHTML += `
      <div class="gallery-item">
        <img src="${item.imageUrl}" alt="${item.title || "Galeri fotoğrafı"}">
        <p>${item.title || ""}</p>
      </div>
    `;
  });
}

async function loadDates() {
  const container = document.getElementById("datesContainer");
  if (!container) return;

  const q = query(collection(db, "dates"), orderBy("date", "asc"));
  const snapshot = await getDocs(q);

  container.innerHTML = "";

  snapshot.forEach((doc) => {
    const item = doc.data();

    container.innerHTML += `
      <div class="date-card">
        <h3>${item.title}</h3>
        <strong>${item.date}</strong>
        <p>${item.text}</p>
      </div>
    `;
  });
}

async function loadPlans() {
  const container = document.getElementById("plansContainer");
  if (!container) return;

  const q = query(collection(db, "plans"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  container.innerHTML = "";

  snapshot.forEach((doc) => {
    const item = doc.data();

    container.innerHTML += `
      <div class="plan-card">
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </div>
    `;
  });
}

async function loadMusic() {
  const container = document.getElementById("musicContainer");
  if (!container) return;

  const q = query(collection(db, "musicList"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  container.innerHTML = "";

  snapshot.forEach((doc) => {
    const item = doc.data();

    container.innerHTML += `
      <div class="music-card">
        <h3>${item.title}</h3>
        <p>${item.artist}</p>
        <a href="${item.url}" target="_blank">Dinle</a>
      </div>
    `;
  });
}

loadSettings();
loadGallery();
loadDates();
loadPlans();
loadMusic();