import { db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function formatDateTR(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

async function loadSettings() {
  const ref = doc(db, "siteSettings", "main");
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  if (data.heroVideo) {
    const mainSource = document.getElementById("heroVideoSource");
    const blurSource = document.getElementById("heroVideoBlurSource");

    const mainVideo = document.getElementById("heroVideo");
    const blurVideo = document.getElementById("heroVideoBlur");

    if (mainSource && blurSource && mainVideo && blurVideo) {
      const videoUrl = data.heroVideo + "?t=" + Date.now();

      mainSource.src = videoUrl;
      blurSource.src = videoUrl;

      mainVideo.load();
      blurVideo.load();

      blurVideo.muted = true;
      blurVideo.play().catch(() => {});
    }
  }

  if (document.getElementById("storyTitle")) {
    document.getElementById("storyTitle").textContent =
      data.storyTitle || "Hikayemiz";
  }

  if (document.getElementById("storyText")) {
    document.getElementById("storyText").textContent =
      data.storyText || "";
  }

window.savedSecretMessage = data.secretMessage || "";

window.savedSecretQuestion = data.secretQuestion || "İlk buluştuğumuz yer";
window.savedSecretAnswer = (data.secretAnswer || "afyon").toLocaleLowerCase("tr-TR");

const secretPass = document.getElementById("secretPass");

if (secretPass) {
  secretPass.placeholder = window.savedSecretQuestion;
}

const secretMessageBox = document.getElementById("secretMessage");

if (secretMessageBox) {
  secretMessageBox.textContent = "";
  secretMessageBox.classList.add("hidden");
}

  const saidInstagramLink = document.getElementById("saidInstagramLink");
const veraInstagramLink = document.getElementById("veraInstagramLink");

if (saidInstagramLink && data.saidInstagram) {
  saidInstagramLink.href = data.saidInstagram;
}

if (veraInstagramLink && data.veraInstagram) {
  veraInstagramLink.href = data.veraInstagram;
}
}


function addGallerySizeStyles() {
  if (document.getElementById("gallerySizeStyles")) return;

  const style = document.createElement("style");
  style.id = "gallerySizeStyles";
  style.textContent = `
    #galleryContainer {
      align-items: stretch;
    }

    .gallery-item {
      width: 100%;
      overflow: hidden;
      border-radius: 18px;
    }

    .gallery-item img,
    .gallery-img {
      width: 100%;
      object-fit: cover;
      display: block;
      border-radius: 18px;
    }

    .gallery-item-vertical {
      height: 360px;
    }

    .gallery-img-vertical {
      height: 315px;
    }

    .gallery-item-landscape {
      height: 270px;
    }

    .gallery-img-landscape {
      height: 225px;
    }

    .gallery-item p {
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 8px 6px;
    }

    @media (max-width: 768px) {
      .gallery-item-vertical,
      .gallery-item-landscape {
        height: 300px;
      }

      .gallery-img-vertical,
      .gallery-img-landscape {
        height: 255px;
      }
    }
  `;

  document.head.appendChild(style);
}

addGallerySizeStyles();

function getImageOrientation(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      if (img.naturalWidth > img.naturalHeight) {
        resolve("landscape");
      } else {
        resolve("vertical");
      }
    };

    img.onerror = () => {
      resolve("vertical");
    };

    img.src = imageUrl;
  });
}

async function loadGallery() {
  const container = document.getElementById("galleryContainer");
  if (!container) return;

  const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  const items = [];

  for (const docSnap of snapshot.docs) {
    const item = docSnap.data();
    const orientation = await getImageOrientation(item.imageUrl);

    items.push({
      ...item,
      orientation
    });
  }

  const verticalImages = items.filter((item) => item.orientation !== "landscape");
  const landscapeImages = items.filter((item) => item.orientation === "landscape");

  const sortedItems = [...verticalImages, ...landscapeImages];

  container.innerHTML = "";

  sortedItems.forEach((item) => {
    const isLandscape = item.orientation === "landscape";

    const cardClass = isLandscape
      ? "gallery-item gallery-item-landscape md:col-span-2"
      : "gallery-item gallery-item-vertical";

    const imageClass = isLandscape
      ? "gallery-img gallery-img-landscape"
      : "gallery-img gallery-img-vertical";

    container.innerHTML += `
      <div class="${cardClass}">
        <img
          src="${item.imageUrl}"
          alt="${item.title || "Galeri fotoğrafı"}"
          class="${imageClass}"
        >
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
      <div class="date-card-custom">
        <h3>${formatDateTR(item.date)}</h3>
        <h4>${item.title || ""}</h4>
        <p>${item.text || ""}</p>
      </div>
    `;
  });
}

async function loadPlans() {
  const container = document.getElementById("plansContainer");
  if (!container) return;

  const q = query(collection(db, "plans"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  const plans = [];

  snapshot.forEach((doc) => {
    plans.push(doc.data());
  });

  const nearPlans = plans.filter((x) => x.type !== "dream");
  const dreamPlans = plans.filter((x) => x.type === "dream");

  container.innerHTML = `
    <div class="plans-box-custom">
      <h3>Yakın Planlar</h3>
      <div class="plans-list-custom" id="nearPlansList"></div>
    </div>

    <div class="plans-box-custom">
      <h3>Hayal Listesi</h3>
      <div class="plans-list-custom" id="dreamPlansList"></div>
    </div>
  `;

  const nearList = document.getElementById("nearPlansList");
  const dreamList = document.getElementById("dreamPlansList");

  nearPlans.forEach((item) => {
    nearList.innerHTML += `
      <div class="plan-item-custom">
        <span>✓</span>
        <p>${item.title || item.text || ""}</p>
      </div>
    `;
  });

  dreamPlans.forEach((item) => {
    dreamList.innerHTML += `
      <div class="plan-item-custom">
        <span>☆</span>
        <p>${item.title || item.text || ""}</p>
      </div>
    `;
  });
}

async function loadMusic() {
  const container = document.getElementById("musicContainer");
  if (!container) return;

  const ref = doc(db, "siteSettings", "main");
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  if (!data.spotifyPlaylistUrl) {
    container.innerHTML = "<p>Spotify playlist linki eklenmedi.</p>";
    return;
  }

  const playlistMatch = data.spotifyPlaylistUrl.match(/playlist\/([a-zA-Z0-9]+)/);
  const playlistId = playlistMatch ? playlistMatch[1] : "";
  const embedUrl = playlistId
    ? `https://open.spotify.com/embed/playlist/${playlistId}`
    : data.spotifyPlaylistUrl
        .replace("open.spotify.com/playlist/", "open.spotify.com/embed/playlist/")
        .replace("open.spotify.com/intl-tr/playlist/", "open.spotify.com/embed/playlist/")
        .split("?")[0];

  container.innerHTML = `
    <iframe
      style="border-radius:18px"
      src="${embedUrl}?utm_source=generator&theme=0"
      width="100%"
      height="650"
      frameborder="0"
      allowfullscreen=""
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy">
    </iframe>
  `;
}
loadSettings();
loadGallery();
loadDates();
loadPlans();
loadMusic();
