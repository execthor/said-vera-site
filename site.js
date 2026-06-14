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
      display: block !important;
    }

    .gallery-group-title {
      width: 100%;
      margin: 28px 0 18px;
      font-size: 22px;
      font-weight: 900;
      text-align: left;
      color: #fb7185;
    }

    .gallery-grid-vertical {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 20px;
    }

    .gallery-grid-landscape {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
      gap: 20px;
      margin-top: 28px;
    }

    @media (min-width: 640px) {
      .gallery-grid-vertical {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .gallery-grid-vertical {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .gallery-grid-landscape {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .gallery-item {
      width: 100%;
      overflow: hidden;
      border-radius: 18px;
      background: rgba(255,255,255,0.06);
    }

    .gallery-img {
      width: 100%;
      display: block;
      border-radius: 18px;
    }

    .gallery-img-vertical {
      height: 315px;
      object-fit: cover;
    }

    .gallery-img-landscape {
      height: 260px;
      object-fit: contain;
      background: rgba(0,0,0,0.22);
      padding: 6px;
    }

    .gallery-item p {
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 8px 6px;
      margin: 0;
    }

    @media (max-width: 768px) {
      .gallery-img-vertical {
        height: 255px;
      }

      .gallery-img-landscape {
        height: 230px;
      }
    }

    .gallery-item {
      transition: transform 0.35s ease, box-shadow 0.35s ease;
      cursor: pointer;
    }

    @media (hover: hover) and (pointer: fine) {
      .gallery-item:hover {
        transform: scale(1.04);
        z-index: 20;
        position: relative;
        box-shadow: 0 22px 50px rgba(0,0,0,0.45);
      }
    }

    .gallery-photo-modal {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.72);
      backdrop-filter: blur(8px);
      padding: 24px;
    }

    .gallery-photo-modal.active {
      display: flex;
    }

    .gallery-photo-modal-box {
      position: relative;
      max-width: 70vw;
      max-height: 70vh;
      animation: galleryZoomIn 0.25s ease;
    }

    .gallery-photo-modal img {
      max-width: 70vw;
      max-height: 70vh;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 24px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.6);
      background: rgba(0,0,0,0.25);
    }

    .gallery-photo-modal-close {
      position: absolute;
      top: -14px;
      right: -14px;
      width: 42px;
      height: 42px;
      border: none;
      border-radius: 999px;
      background: linear-gradient(135deg, #fb7185, #ec4899);
      color: white;
      font-size: 26px;
      line-height: 42px;
      text-align: center;
      cursor: pointer;
      box-shadow: 0 12px 30px rgba(0,0,0,0.35);
    }

    @keyframes galleryZoomIn {
      from {
        transform: scale(0.86);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    @media (max-width: 1024px) {
      .gallery-photo-modal {
        padding: 16px;
      }

      .gallery-photo-modal-box,
      .gallery-photo-modal img {
        max-width: 70vw;
        max-height: 70vh;
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

function createGalleryCard(item) {
  const isLandscape = item.orientation === "landscape";

  const imageClass = isLandscape
    ? "gallery-img gallery-img-landscape"
    : "gallery-img gallery-img-vertical";

  return `
    <div class="gallery-item" data-full-src="${item.imageUrl}">
      <img
        src="${item.imageUrl}"
        alt="${item.title || "Galeri fotoğrafı"}"
        class="${imageClass}"
      >
      <p>${item.title || ""}</p>
    </div>
  `;
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

  container.innerHTML = `
    <div class="gallery-grid-vertical">
      ${verticalImages.map(createGalleryCard).join("")}
    </div>

    ${
      landscapeImages.length
        ? `
          <h3 class="gallery-group-title">Yatay Fotoğraflar</h3>
          <div class="gallery-grid-landscape">
            ${landscapeImages.map(createGalleryCard).join("")}
          </div>
        `
        : ""
    }
  `;
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

let galleryHoverTimer = null;

function openGalleryPhotoModal(src) {
  let modal = document.getElementById("galleryPhotoModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "galleryPhotoModal";
    modal.className = "gallery-photo-modal";
    modal.innerHTML = `
      <div class="gallery-photo-modal-box">
        <button class="gallery-photo-modal-close" id="galleryPhotoModalClose">×</button>
        <img id="galleryPhotoModalImg" src="" alt="Galeri fotoğrafı">
      </div>
    `;

    document.body.appendChild(modal);

    document
      .getElementById("galleryPhotoModalClose")
      ?.addEventListener("click", closeGalleryPhotoModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeGalleryPhotoModal();
    });
  }

  const img = document.getElementById("galleryPhotoModalImg");
  if (img) img.src = src;

  modal.classList.add("active");
}

function closeGalleryPhotoModal() {
  clearTimeout(galleryHoverTimer);

  const modal = document.getElementById("galleryPhotoModal");
  const img = document.getElementById("galleryPhotoModalImg");

  if (modal) modal.classList.remove("active");
  if (img) img.src = "";
}

document.addEventListener("mouseover", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const card = target.closest(".gallery-item");
  if (!card) return;

  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isFinePointer) return;

  clearTimeout(galleryHoverTimer);

  galleryHoverTimer = setTimeout(() => {
    const img = card.querySelector("img");
    if (!img) return;

    openGalleryPhotoModal(img.src);
  }, 1000);
});

document.addEventListener("mouseout", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const card = target.closest(".gallery-item");
  if (!card) return;

  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isFinePointer) return;

  clearTimeout(galleryHoverTimer);
  closeGalleryPhotoModal();
});

document.addEventListener("click", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const card = target.closest(".gallery-item");
  if (!card) return;

  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (isFinePointer) return;

  const img = card.querySelector("img");
  if (!img) return;

  openGalleryPhotoModal(img.src);
});

loadSettings();
loadGallery();
loadDates();
loadPlans();
loadMusic();
