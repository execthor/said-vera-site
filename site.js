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
      max-width: 90vw;
      max-height: 90vh;
      animation: galleryZoomIn 0.25s ease;
    }

    .gallery-photo-modal img {
      max-width: 90vw;
      max-height: 90vh;
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
        max-width: 90vw;
        max-height: 90vh;
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

function createGalleryCard(item, index) {
  const isLandscape = item.orientation === "landscape";

  const imageClass = isLandscape
    ? "gallery-img gallery-img-landscape"
    : "gallery-img gallery-img-vertical";

  return `
    <div
      class="gallery-item"
      data-gallery-index="${index}"
      data-full-src="${item.imageUrl}"
      data-title="${item.title || ""}"
    >
      <img
        src="${item.imageUrl}"
        alt="${item.title || "Galeri fotoğrafı"}"
        class="${imageClass}"
        loading="lazy"
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

  const sortedItems = [...verticalImages, ...landscapeImages];

  window.galleryPreviewItems = sortedItems;

  const verticalCount = verticalImages.length;

  container.innerHTML = `
    <div class="gallery-grid-vertical">
      ${verticalImages.map((item, index) => createGalleryCard(item, index)).join("")}
    </div>

    ${
      landscapeImages.length
        ? `
          <h3 class="gallery-group-title">Yatay Fotoğraflar</h3>
          <div class="gallery-grid-landscape">
            ${landscapeImages
              .map((item, index) => createGalleryCard(item, verticalCount + index))
              .join("")}
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




function addGalleryProfessionalPreviewStyles() {
  if (document.getElementById("galleryProfessionalPreviewStyles")) return;

  const style = document.createElement("style");
  style.id = "galleryProfessionalPreviewStyles";
  style.textContent = `
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
      background: rgba(0,0,0,0.78);
      backdrop-filter: blur(9px);
      padding: 24px;
    }

    .gallery-photo-modal.active {
      display: flex;
    }

    .gallery-photo-modal-box {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      animation: galleryZoomIn 0.25s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .gallery-photo-modal img {
      max-width: 90vw;
      max-height: 82vh;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 24px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.6);
      background: rgba(0,0,0,0.25);
    }

    .gallery-photo-modal-title {
      color: white;
      font-size: 16px;
      font-weight: 800;
      text-align: center;
      min-height: 22px;
    }

    .gallery-photo-modal-counter {
      color: rgba(255,255,255,0.78);
      font-size: 13px;
      font-weight: 700;
      text-align: center;
    }

    .gallery-photo-modal-close,
    .gallery-photo-modal-prev,
    .gallery-photo-modal-next {
      border: none;
      border-radius: 999px;
      background: linear-gradient(135deg, #fb7185, #ec4899);
      color: white;
      cursor: pointer;
      box-shadow: 0 12px 30px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gallery-photo-modal-close {
      position: absolute;
      top: -14px;
      right: -14px;
      width: 42px;
      height: 42px;
      font-size: 28px;
      z-index: 3;
    }

    .gallery-photo-modal-prev,
    .gallery-photo-modal-next {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      width: 48px;
      height: 48px;
      font-size: 34px;
      z-index: 3;
    }

    .gallery-photo-modal-prev {
      left: 24px;
    }

    .gallery-photo-modal-next {
      right: 24px;
    }

    @keyframes galleryZoomIn {
      from { transform: scale(0.86); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @media (max-width: 768px) {
      .gallery-photo-modal {
        padding: 14px;
      }

      .gallery-photo-modal img {
        max-width: 92vw;
        max-height: 78vh;
      }

      .gallery-photo-modal-prev,
      .gallery-photo-modal-next {
        width: 42px;
        height: 42px;
        font-size: 28px;
      }

      .gallery-photo-modal-prev {
        left: 10px;
      }

      .gallery-photo-modal-next {
        right: 10px;
      }
    }
  `;

  document.head.appendChild(style);
}

addGalleryProfessionalPreviewStyles();


let galleryHoverTimer = null;
let galleryModalOpen = false;
let currentGalleryIndex = 0;

function getGalleryItems() {
  return Array.isArray(window.galleryPreviewItems)
    ? window.galleryPreviewItems
    : [];
}

function renderGalleryModalContent() {
  const items = getGalleryItems();
  const item = items[currentGalleryIndex];

  if (!item) return;

  const img = document.getElementById("galleryPhotoModalImg");
  const title = document.getElementById("galleryPhotoModalTitle");
  const counter = document.getElementById("galleryPhotoModalCounter");

  if (img) img.src = item.imageUrl;
  if (title) title.textContent = item.title || "";
  if (counter) counter.textContent = `${currentGalleryIndex + 1} / ${items.length}`;
}

function openGalleryPhotoModal(index) {
  clearTimeout(galleryHoverTimer);

  const items = getGalleryItems();
  if (!items.length) return;

  currentGalleryIndex = Number(index || 0);

  if (currentGalleryIndex < 0) currentGalleryIndex = 0;
  if (currentGalleryIndex >= items.length) currentGalleryIndex = items.length - 1;

  let modal = document.getElementById("galleryPhotoModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "galleryPhotoModal";
    modal.className = "gallery-photo-modal";
    modal.innerHTML = `
      <button class="gallery-photo-modal-prev" id="galleryPhotoModalPrev">‹</button>
      <div class="gallery-photo-modal-box">
        <button class="gallery-photo-modal-close" id="galleryPhotoModalClose">×</button>
        <img id="galleryPhotoModalImg" src="" alt="Galeri fotoğrafı">
        <div class="gallery-photo-modal-title" id="galleryPhotoModalTitle"></div>
        <div class="gallery-photo-modal-counter" id="galleryPhotoModalCounter"></div>
      </div>
      <button class="gallery-photo-modal-next" id="galleryPhotoModalNext">›</button>
    `;

    document.body.appendChild(modal);

    document.getElementById("galleryPhotoModalClose")
      ?.addEventListener("click", (e) => {
        e.stopPropagation();
        closeGalleryPhotoModal();
      });

    document.getElementById("galleryPhotoModalPrev")
      ?.addEventListener("click", (e) => {
        e.stopPropagation();
        showPreviousGalleryPhoto();
      });

    document.getElementById("galleryPhotoModalNext")
      ?.addEventListener("click", (e) => {
        e.stopPropagation();
        showNextGalleryPhoto();
      });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeGalleryPhotoModal();
    });
  }

  galleryModalOpen = true;
  modal.classList.add("active");
  renderGalleryModalContent();
}

function closeGalleryPhotoModal() {
  clearTimeout(galleryHoverTimer);

  const modal = document.getElementById("galleryPhotoModal");
  const img = document.getElementById("galleryPhotoModalImg");

  galleryModalOpen = false;

  if (modal) modal.classList.remove("active");
  if (img) img.src = "";
}

function showPreviousGalleryPhoto() {
  const items = getGalleryItems();
  if (!items.length) return;

  currentGalleryIndex = (currentGalleryIndex - 1 + items.length) % items.length;
  renderGalleryModalContent();
}

function showNextGalleryPhoto() {
  const items = getGalleryItems();
  if (!items.length) return;

  currentGalleryIndex = (currentGalleryIndex + 1) % items.length;
  renderGalleryModalContent();
}

// Tek ve stabil hover sistemi: pointerenter/pointerleave kullanır.
// Modal açıldıktan sonra pointerleave kapatmaz.
document.addEventListener("pointerenter", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const card = target.closest(".gallery-item");
  if (!card) return;

  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isFinePointer) return;

  clearTimeout(galleryHoverTimer);

  galleryHoverTimer = setTimeout(() => {
    if (galleryModalOpen) return;

    const index = Number(card.dataset.galleryIndex || 0);
    openGalleryPhotoModal(index);
  }, 1500);
}, true);

document.addEventListener("pointerleave", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const card = target.closest(".gallery-item");
  if (!card) return;

  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isFinePointer) return;

  if (!galleryModalOpen) {
    clearTimeout(galleryHoverTimer);
  }
}, true);

document.addEventListener("click", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  if (target.closest(".gallery-photo-modal")) return;

  const card = target.closest(".gallery-item");
  if (!card) return;

  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (isFinePointer) return;

  const index = Number(card.dataset.galleryIndex || 0);
  openGalleryPhotoModal(index);
});

document.addEventListener("keydown", (e) => {
  if (!galleryModalOpen) return;

  if (e.key === "Escape") closeGalleryPhotoModal();
  if (e.key === "ArrowLeft") showPreviousGalleryPhoto();
  if (e.key === "ArrowRight") showNextGalleryPhoto();
});


loadSettings();
loadGallery();
loadDates();
loadPlans();
loadMusic();
