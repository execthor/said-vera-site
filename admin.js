
import {
  auth,
  db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const pageSize = 25;

function publishBadge(isPublished) {
  return `
    <span class="text-xs font-black px-3 py-1 rounded-full ${
      isPublished
        ? "bg-emerald-100 text-emerald-700"
        : "bg-rose-100 text-rose-700"
    }">
      ${isPublished ? "Yayında" : "Yayında Değil"}
    </span>
  `;
}

async function publishSingleItem(collectionName, selectedId) {
  const snapshot = await getDocs(collection(db, collectionName));

  const updates = snapshot.docs.map((docSnap) => {
    return setDoc(
      doc(db, collectionName, docSnap.id),
      { published: docSnap.id === selectedId },
      { merge: true }
    );
  });

  await Promise.all(updates);
}

async function togglePublished(collectionName, id, value) {
  await setDoc(
    doc(db, collectionName, id),
    { published: value },
    { merge: true }
  );
}


function normalizeText(value) {
  return (value || "")
    .toString()
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ");
}

async function fileToHash(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function isDuplicateFile(collectionName, fileHash) {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs.some((docSnap) => {
    return docSnap.data().fileHash === fileHash;
  });
}

async function isDuplicateRecord(collectionName, fields) {
  const snapshot = await getDocs(collection(db, collectionName));

  return snapshot.docs.some((docSnap) => {
    const data = docSnap.data();

    return Object.keys(fields).every((key) => {
      return normalizeText(data[key]) === normalizeText(fields[key]);
    });
  });
}


let galleryItems = [];
let galleryPageCurrent = 1;

let storyItems = [];
let storyPageCurrent = 1;

let heroVideoItems = [];
let heroVideoPageCurrent = 1;

let dateItems = [];
let datePageCurrent = 1;

let planItems = [];
let planPageCurrent = 1;

let secretItems = [];
let secretPageCurrent = 1;

let secretQuestionItems = [];
let secretQuestionPageCurrent = 1;

const loginBox = $("loginBox");
const adminBox = $("adminBox");

/* LOGIN */
$("loginBtn")?.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(
      auth,
      $("email")?.value || "",
      $("password")?.value || ""
    );
  } catch (error) {
    alert("Giriş başarısız: " + error.message);
  }
});

onAuthStateChanged(auth, (user) => {
  if (loginBox) loginBox.style.display = user ? "none" : "block";
  if (adminBox) adminBox.style.display = user ? "block" : "none";

  if (user) {
    loadAdminGallery();
    loadAdminStories();
    loadAdminHeroVideos();
    loadAdminDates();
    loadAdminPlans();
    loadAdminSecrets();
    loadAdminSecretQuestions();
    loadContactSettings();
  }
});

/* SAYFA GEÇİŞ */
document.querySelectorAll("[data-page]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.page;

    document.querySelectorAll(".admin-page").forEach((page) => {
      page.classList.add("hidden");
    });

    document.getElementById(target)?.classList.remove("hidden");

    document.querySelectorAll(".menu-btn").forEach((b) => {
      b.classList.remove("active-menu");
    });

    btn.classList.add("active-menu");

    if (target === "videoPage" && typeof loadAdminHeroVideos === "function") loadAdminHeroVideos();
    if (target === "storyPage" && typeof loadAdminStories === "function") loadAdminStories();
    if (target === "galleryPage" && typeof loadAdminGallery === "function") loadAdminGallery();
    if (target === "datesPage" && typeof loadAdminDates === "function") loadAdminDates();
    if (target === "plansPage" && typeof loadAdminPlans === "function") loadAdminPlans();
    if (target === "secretPage" && typeof loadAdminSecrets === "function") loadAdminSecrets();
    if (target === "secretQuestionPage" && typeof loadAdminSecretQuestions === "function") loadAdminSecretQuestions();
  });
});

/* VİDEO YÜKLE */
$("uploadHeroVideoBtn")?.addEventListener("click", async () => {
  const file = $("heroVideoFile")?.files[0];

  if (!file) return alert("Video seç");

  const fileHash = await fileToHash(file);

  if (await isDuplicateFile("heroVideos", fileHash)) {
    alert("Bu video zaten eklenmiş");
    return;
  }

  alert("Video yükleniyor...");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "saidvera_video");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dosgbutzh/video/upload",
    { method: "POST", body: formData }
  );

  const data = await response.json();

  if (!data.secure_url) {
    console.log(data);
    return alert("Video yüklenemedi");
  }

  await addDoc(collection(db, "heroVideos"), {
    videoUrl: data.secure_url,
    fileHash,
    published: false,
    createdAt: serverTimestamp()
  });

  if ($("heroVideoFile")) $("heroVideoFile").value = "";

  alert("Video arşive eklendi");
  loadAdminHeroVideos();
});

/* HİKAYE EKLE */
$("saveStoryBtn")?.addEventListener("click", async () => {
  const storyTitle = $("storyTitleInput")?.value || "";
  const storyText = $("storyTextInput")?.value || "";

  if (await isDuplicateRecord("stories", { storyTitle, storyText })) {
    alert("Bu hikaye zaten eklenmiş");
    return;
  }

  await addDoc(collection(db, "stories"), {
    storyTitle,
    storyText,
    published: false,
    createdAt: serverTimestamp()
  });

  if ($("storyTitleInput")) $("storyTitleInput").value = "";
  if ($("storyTextInput")) $("storyTextInput").value = "";

  alert("Hikaye listeye eklendi");
  loadAdminStories();
});

/* FOTOĞRAF YÜKLE */
$("uploadPhotoBtn")?.addEventListener("click", async () => {
  const file = $("photoFile")?.files[0];
  const title = $("photoTitle")?.value || "";

  if (!file) return alert("Fotoğraf seç");

  const fileHash = await fileToHash(file);

  if (await isDuplicateFile("gallery", fileHash)) {
    alert("Bu fotoğraf zaten eklenmiş");
    return;
  }

  alert("Fotoğraf yükleniyor...");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "saidvera");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dosgbutzh/image/upload",
    { method: "POST", body: formData }
  );

  const data = await response.json();

  if (!data.secure_url) {
    console.log(data);
    return alert("Fotoğraf yüklenemedi");
  }

  await addDoc(collection(db, "gallery"), {
    title,
    imageUrl: data.secure_url,
    fileHash,
    published: false,
    createdAt: serverTimestamp()
  });

  if ($("photoFile")) $("photoFile").value = "";
  if ($("photoTitle")) $("photoTitle").value = "";

  alert("Fotoğraf yüklendi");
  loadAdminGallery();
});

/* TARİH EKLE */
$("addDateBtn")?.addEventListener("click", async () => {
  const title = $("dateTitle")?.value || "";
  const date = $("dateValue")?.value || "";
  const text = $("dateText")?.value || "";

  if (await isDuplicateRecord("dates", { title, date, text })) {
    alert("Bu tarih zaten eklenmiş");
    return;
  }

  await addDoc(collection(db, "dates"), {
    title,
    date,
    text,
    published: false,
    createdAt: serverTimestamp()
  });

  if ($("dateTitle")) $("dateTitle").value = "";
  if ($("dateValue")) $("dateValue").value = "";
  if ($("dateText")) $("dateText").value = "";

  alert("Tarih eklendi");
  loadAdminDates();
});

/* PLAN EKLE */
$("addPlanBtn")?.addEventListener("click", async () => {
  const title = $("planTitle")?.value || "";
  const text = $("planText")?.value || "";
  const type = $("planType")?.value || "near";

  if (await isDuplicateRecord("plans", { title, text, type })) {
    alert("Bu plan zaten eklenmiş");
    return;
  }

  await addDoc(collection(db, "plans"), {
    title,
    text,
    type,
    done: false,
    published: false,
    createdAt: serverTimestamp()
  });

  if ($("planTitle")) $("planTitle").value = "";
  if ($("planText")) $("planText").value = "";

  alert("Plan eklendi");
  if (typeof loadAdminPlans === "function") loadAdminPlans();
});

/* SPOTIFY PLAYLIST */
$("saveSpotifyPlaylistBtn")?.addEventListener("click", async () => {
  const url = $("spotifyPlaylistUrl")?.value.trim() || "";

  if (!url.includes("spotify.com") || !url.includes("playlist")) {
    alert("Geçerli Spotify playlist linki gir");
    return;
  }

  await setDoc(
    doc(db, "siteSettings", "main"),
    {
      spotifyPlaylistUrl: url
    },
    { merge: true }
  );

  alert("Spotify playlist linki kaydedildi");
});

/* GİZLİ MESAJ */
$("saveSecretBtn")?.addEventListener("click", async () => {
  const secretMessage = $("secretMessageInput")?.value || "";

  if (await isDuplicateRecord("secretMessages", { secretMessage })) {
    alert("Bu gizli mesaj zaten eklenmiş");
    return;
  }

  await addDoc(collection(db, "secretMessages"), {
    secretMessage,
    published: false,
    createdAt: serverTimestamp()
  });

  if ($("secretMessageInput")) $("secretMessageInput").value = "";

  alert("Gizli mesaj listeye eklendi");
  loadAdminSecrets();
});


/* GİZLİ SORU VE CEVAP */
$("saveSecretQuestionBtn")?.addEventListener("click", async () => {
  const question = $("secretQuestionInput")?.value.trim() || "";
  const answer = $("secretAnswerInput")?.value.trim() || "";

  if (!question || !answer) {
    alert("Soru ve cevap boş olamaz");
    return;
  }

  if (await isDuplicateRecord("secretQuestions", {
    secretQuestion: question,
    secretAnswer: answer
  })) {
    alert("Bu soru ve cevap zaten eklenmiş");
    return;
  }

  await addDoc(collection(db, "secretQuestions"), {
    secretQuestion: question,
    secretAnswer: answer.toLocaleLowerCase("tr-TR"),
    published: false,
    createdAt: serverTimestamp()
  });

  if ($("secretQuestionInput")) $("secretQuestionInput").value = "";
  if ($("secretAnswerInput")) $("secretAnswerInput").value = "";

  alert("Soru ve cevap listeye eklendi");
  loadAdminSecretQuestions();
});

/* ÇIKIŞ */
$("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
});

/* GALERİ LİSTE */
async function loadAdminGallery() {
  const list = $("galleryAdminList");
  if (!list) return;

  const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  galleryItems = [];

  snapshot.forEach((docSnap) => {
    galleryItems.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderGalleryPage();
}

function renderGalleryPage() {
  const list = $("galleryAdminList");
  const info = $("galleryPageInfo");

  if (!list) return;

  const start = (galleryPageCurrent - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = galleryItems.slice(start, end);

  list.innerHTML = "";

  pageItems.forEach((item) => {
    const isPublished = item.published !== false;

    list.innerHTML += `
      <div class="relative bg-white/70 rounded-3xl overflow-hidden shadow-lg border border-rose-100 group">
        <img 
          src="${item.imageUrl}" 
          class="admin-gallery-img w-full h-40 object-cover cursor-pointer"
          alt="${item.title || "Galeri fotoğrafı"}"
        >

        <div class="p-4">
          <div class="flex items-center justify-between gap-2 mb-3">
            ${publishBadge(isPublished)}

            <label class="flex items-center gap-2 text-sm font-bold text-rose-700 cursor-pointer">
              <input
                type="checkbox"
                class="publishGalleryCheck w-5 h-5 accent-rose-500"
                data-id="${item.id}"
                ${isPublished ? "checked" : ""}
              >
              Yayınla
            </label>
          </div>

          <h3 class="font-bold text-rose-600 text-lg mb-3">
            ${item.title || "Başlıksız"}
          </h3>

          <button 
            class="deleteGalleryBtn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold w-full"
            data-id="${item.id}"
          >
            Sil
          </button>
        </div>
      </div>
    `;
  });

  const totalPages = Math.ceil(galleryItems.length / pageSize) || 1;
  const publishedCount = galleryItems.filter((item) => item.published !== false).length;

  if (info) info.textContent = `${galleryPageCurrent} / ${totalPages} | Yayında: ${publishedCount}`;

  document.querySelectorAll(".publishGalleryCheck").forEach((check) => {
    check.addEventListener("change", async () => {
      await togglePublished("gallery", check.dataset.id, check.checked);
      loadAdminGallery();
    });
  });

  document.querySelectorAll(".deleteGalleryBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (!confirm("Bu fotoğraf silinsin mi?")) return;

      await deleteDoc(doc(db, "gallery", id));

      alert("Fotoğraf silindi");
      loadAdminGallery();
    });
  });
}

$("galleryPrevBtn")?.addEventListener("click", () => {
  if (galleryPageCurrent > 1) {
    galleryPageCurrent--;
    renderGalleryPage();
  }
});

$("galleryNextBtn")?.addEventListener("click", () => {
  const totalPages = Math.ceil(galleryItems.length / pageSize) || 1;

  if (galleryPageCurrent < totalPages) {
    galleryPageCurrent++;
    renderGalleryPage();
  }
});


/* FOTOĞRAF HOVER - STABİL ADMIN */
let adminPhotoHoverTimer = null;
let adminPhotoPreviewOpen = false;

function openAdminPhotoPreview(src) {
  clearTimeout(adminPhotoHoverTimer);

  let preview = document.getElementById("adminPhotoPreview");

  if (!preview) {
    preview = document.createElement("div");
    preview.id = "adminPhotoPreview";
    preview.innerHTML = `
      <div class="admin-photo-preview-box">
        <button id="adminPhotoPreviewClose">×</button>
        <img id="adminPhotoPreviewImg" src="" alt="Fotoğraf önizleme">
      </div>
    `;

    document.body.appendChild(preview);

    document
      .getElementById("adminPhotoPreviewClose")
      ?.addEventListener("click", closeAdminPhotoPreview);

    preview.addEventListener("click", (e) => {
      if (e.target === preview) closeAdminPhotoPreview();
    });
  }

  const img = document.getElementById("adminPhotoPreviewImg");
  if (img) img.src = src;

  adminPhotoPreviewOpen = true;
  preview.classList.add("active");
}

function closeAdminPhotoPreview() {
  clearTimeout(adminPhotoHoverTimer);

  const preview = document.getElementById("adminPhotoPreview");
  const img = document.getElementById("adminPhotoPreviewImg");

  adminPhotoPreviewOpen = false;

  if (preview) preview.classList.remove("active");
  if (img) img.src = "";
}

document.addEventListener("pointerenter", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const img = target.closest(".admin-gallery-img");
  if (!img) return;

  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isFinePointer) return;

  clearTimeout(adminPhotoHoverTimer);

  adminPhotoHoverTimer = setTimeout(() => {
    if (adminPhotoPreviewOpen) return;
    openAdminPhotoPreview(img.src);
  }, 1500);
}, true);

document.addEventListener("pointerleave", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const img = target.closest(".admin-gallery-img");
  if (!img) return;

  if (!adminPhotoPreviewOpen) {
    clearTimeout(adminPhotoHoverTimer);
  }
}, true);

document.addEventListener("click", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  if (target.closest("#adminPhotoPreview")) return;

  const img = target.closest(".admin-gallery-img");
  if (!img) return;

  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (isFinePointer) return;

  openAdminPhotoPreview(img.src);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAdminPhotoPreview();
  }
});


/* HİKAYE LİSTE */
async function loadAdminStories() {
  const list = $("storyAdminList");
  if (!list) return;

  const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  storyItems = [];

  snapshot.forEach((docSnap) => {
    storyItems.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderStoryPage();
}

function renderStoryPage() {
  const list = $("storyAdminList");
  const info = $("storyPageInfo");

  if (!list) return;

  const start = (storyPageCurrent - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = storyItems.slice(start, end);

  list.innerHTML = "";

  pageItems.forEach((item) => {
    const isPublished = item.published === true;

    list.innerHTML += `
      <div class="bg-white/70 rounded-3xl shadow-lg border border-rose-100 p-4">
        <div class="mb-3">
          ${publishBadge(isPublished)}
        </div>

        <h3 class="font-bold text-rose-600 text-lg mb-2">
          ${item.storyTitle || "Başlıksız"}
        </h3>

        <p class="text-sm text-rose-900/80 line-clamp-5 mb-4">
          ${item.storyText || ""}
        </p>

        <button
          class="selectStoryBtn bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-bold w-full mb-2"
          data-id="${item.id}"
        >
          ${isPublished ? "Yayında" : "Yayınla"}
        </button>

        <button
          class="deleteStoryBtn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold w-full"
          data-id="${item.id}"
        >
          Sil
        </button>
      </div>
    `;
  });

  const totalPages = Math.ceil(storyItems.length / pageSize) || 1;
  if (info) info.textContent = `${storyPageCurrent} / ${totalPages}`;

  document.querySelectorAll(".selectStoryBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const selected = storyItems.find((x) => x.id === btn.dataset.id);
      if (!selected) return;

      await publishSingleItem("stories", selected.id);

      await setDoc(
        doc(db, "siteSettings", "main"),
        {
          storyTitle: selected.storyTitle || "",
          storyText: selected.storyText || "",
          storyId: selected.id
        },
        { merge: true }
      );

      alert("Bu hikaye ana sitede yayınlandı");
      loadAdminStories();
    });
  });

  document.querySelectorAll(".deleteStoryBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (!id) return;
      if (!confirm("Bu hikaye silinsin mi?")) return;

      await deleteDoc(doc(db, "stories", id));

      alert("Hikaye silindi");
      loadAdminStories();
    });
  });
}

$("storyPrevBtn")?.addEventListener("click", () => {
  if (storyPageCurrent > 1) {
    storyPageCurrent--;
    renderStoryPage();
  }
});

$("storyNextBtn")?.addEventListener("click", () => {
  const totalPages = Math.ceil(storyItems.length / pageSize) || 1;

  if (storyPageCurrent < totalPages) {
    storyPageCurrent++;
    renderStoryPage();
  }
});

/* VİDEO LİSTE */
async function loadAdminHeroVideos() {
  const list = $("heroVideoAdminList");
  if (!list) return;

  const q = query(collection(db, "heroVideos"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  heroVideoItems = [];

  snapshot.forEach((docSnap) => {
    heroVideoItems.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderHeroVideoPage();
}

function renderHeroVideoPage() {
  const list = $("heroVideoAdminList");
  const info = $("heroVideoPageInfo");

  if (!list) return;

  const start = (heroVideoPageCurrent - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = heroVideoItems.slice(start, end);

  list.innerHTML = "";

  pageItems.forEach((item) => {
    const isPublished = item.published === true;

    list.innerHTML += `
      <div 
        class="admin-video-card bg-white/70 rounded-3xl overflow-hidden shadow-lg border border-rose-100 p-3"
        data-url="${item.videoUrl}"
      >
        <video
          src="${item.videoUrl}"
          class="admin-video-preview w-full h-40 object-cover rounded-2xl mb-3 cursor-pointer"
          muted
          playsinline
        ></video>

        <div class="mb-3">
          ${publishBadge(isPublished)}
        </div>

        <button
          class="selectHeroVideoBtn bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-bold w-full mb-2"
          data-url="${item.videoUrl}"
          data-id="${item.id}"
        >
          ${isPublished ? "Yayında" : "Yayınla"}
        </button>

        <button
          class="deleteHeroVideoBtn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold w-full"
          data-id="${item.id}"
        >
          Sil
        </button>
      </div>
    `;
  });

  const totalPages = Math.ceil(heroVideoItems.length / pageSize) || 1;
  if (info) info.textContent = `${heroVideoPageCurrent} / ${totalPages}`;

  document.querySelectorAll(".selectHeroVideoBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await publishSingleItem("heroVideos", btn.dataset.id);

      await setDoc(
        doc(db, "siteSettings", "main"),
        {
          heroVideo: btn.dataset.url,
          heroVideoId: btn.dataset.id
        },
        { merge: true }
      );

      alert("Video yayınlandı");
      loadAdminHeroVideos();
    });
  });

  document.querySelectorAll(".deleteHeroVideoBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Video silinsin mi?")) return;

      await deleteDoc(doc(db, "heroVideos", btn.dataset.id));

      alert("Video silindi");
      loadAdminHeroVideos();
    });
  });
}

$("heroVideoPrevBtn")?.addEventListener("click", () => {
  if (heroVideoPageCurrent > 1) {
    heroVideoPageCurrent--;
    renderHeroVideoPage();
  }
});

$("heroVideoNextBtn")?.addEventListener("click", () => {
  const totalPages = Math.ceil(heroVideoItems.length / pageSize) || 1;

  if (heroVideoPageCurrent < totalPages) {
    heroVideoPageCurrent++;
    renderHeroVideoPage();
  }
});

/* VİDEO HOVER VE MODAL */
let videoHoverTimer = null;

document.addEventListener("mouseenter", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const card = target.closest(".admin-video-card");

  if (!card) return;

  clearTimeout(videoHoverTimer);

  videoHoverTimer = setTimeout(() => {
    const video = card.querySelector("video");
    if (!video) return;

    video.currentTime = 0;
    video.muted = true;
    video.play().catch(() => {});
  }, 500);
}, true);

document.addEventListener("mouseleave", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  const card = target.closest(".admin-video-card");

  if (!card) return;

  clearTimeout(videoHoverTimer);

  const video = card.querySelector("video");
  if (!video) return;

  video.pause();
  video.currentTime = 0;
}, true);

document.addEventListener("click", (e) => {
  const target = e.target;

  if (!(target instanceof Element)) return;

  if (target.closest("button")) return;

  const card = target.closest(".admin-video-card");

  if (!card) return;

  openAdminVideoModal(card.dataset.url);
});

function openAdminVideoModal(url) {
  let modal = document.getElementById("adminVideoModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "adminVideoModal";
    modal.innerHTML = `
      <div class="admin-video-modal-box">
        <button id="adminVideoModalClose">×</button>
        <video id="adminVideoModalPlayer" controls autoplay playsinline></video>
      </div>
    `;
    document.body.appendChild(modal);

    document
      .getElementById("adminVideoModalClose")
      .addEventListener("click", closeAdminVideoModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeAdminVideoModal();
    });
  }

  const player = document.getElementById("adminVideoModalPlayer");
  player.src = url;
  modal.classList.add("active");
}

function closeAdminVideoModal() {
  const modal = document.getElementById("adminVideoModal");
  const player = document.getElementById("adminVideoModalPlayer");

  if (player) {
    player.pause();
    player.src = "";
  }

  if (modal) {
    modal.classList.remove("active");
  }
}

/* ÖNEMLİ TARİHLER */
function formatDateTRAdmin(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

async function loadAdminDates() {
  const list = $("datesAdminList");
  if (!list) return;

  const q = query(collection(db, "dates"), orderBy("date", "asc"));
  const snapshot = await getDocs(q);

  dateItems = [];

  snapshot.forEach((docSnap) => {
    dateItems.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderDatePage();
}

function renderDatePage() {
  const list = $("datesAdminList");
  const info = $("datesPageInfo");

  if (!list) return;

  const start = (datePageCurrent - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = dateItems.slice(start, end);

  list.innerHTML = "";

  pageItems.forEach((item) => {
    const isPublished = item.published !== false;

    list.innerHTML += `
      <div class="date-admin-card">
        <div class="flex items-center justify-between gap-2 mb-4">
          ${publishBadge(isPublished)}

          <label class="flex items-center gap-2 text-sm font-bold text-white cursor-pointer">
            <input
              type="checkbox"
              class="publishDateCheck w-5 h-5 accent-rose-500"
              data-id="${item.id}"
              ${isPublished ? "checked" : ""}
            >
            Yayınla
          </label>
        </div>

        <h3>${formatDateTRAdmin(item.date)}</h3>
        <h4>${item.title || "Başlıksız"}</h4>
        <p>${item.text || ""}</p>

        <button
          class="deleteDateBtn"
          data-id="${item.id}"
        >
          Sil
        </button>
      </div>
    `;
  });

  const totalPages = Math.ceil(dateItems.length / pageSize) || 1;
  const publishedCount = dateItems.filter((item) => item.published !== false).length;

  if (info) {
    info.textContent = `${datePageCurrent} / ${totalPages} | Yayında: ${publishedCount}`;
  }

  document.querySelectorAll(".publishDateCheck").forEach((check) => {
    check.addEventListener("change", async () => {
      await togglePublished("dates", check.dataset.id, check.checked);
      loadAdminDates();
    });
  });

  document.querySelectorAll(".deleteDateBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Bu tarih silinsin mi?")) return;

      await deleteDoc(doc(db, "dates", btn.dataset.id));

      alert("Tarih silindi");
      loadAdminDates();
    });
  });
}

$("datesPrevBtn")?.addEventListener("click", () => {
  if (datePageCurrent > 1) {
    datePageCurrent--;
    renderDatePage();
  }
});

$("datesNextBtn")?.addEventListener("click", () => {
  const totalPages = Math.ceil(dateItems.length / pageSize) || 1;

  if (datePageCurrent < totalPages) {
    datePageCurrent++;
    renderDatePage();
  }
});

/* PLANLAR LİSTE */
async function loadAdminPlans() {
  const list = $("plansAdminList");
  if (!list) return;

  const q = query(collection(db, "plans"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  planItems = [];

  snapshot.forEach((docSnap) => {
    planItems.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderPlanPage();
}

function renderPlanPage() {
  const list = $("plansAdminList");
  const info = $("plansPageInfo");

  if (!list) return;

  const nearPlans = planItems.filter((item) => item.type !== "dream");
  const dreamPlans = planItems.filter((item) => item.type === "dream");

  function createPlanCard(item) {
    const isPublished = item.published === true;

    return `
      <div class="bg-white/70 rounded-3xl shadow-lg border border-rose-100 p-4">
        <div class="flex items-center justify-between gap-3 mb-3">
          ${publishBadge(isPublished)}

          <label class="flex items-center gap-2 text-sm font-bold text-rose-700 cursor-pointer">
            <input
              type="checkbox"
              class="publishPlanCheck w-5 h-5 accent-rose-500"
              data-id="${item.id}"
              ${isPublished ? "checked" : ""}
            >
            Yayınla
          </label>
        </div>

        <h3 class="font-bold text-rose-600 text-lg mb-2">
          ${item.title || "Başlıksız"}
        </h3>

        <p class="text-sm text-rose-900/80 line-clamp-5 mb-4">
          ${item.text || ""}
        </p>

        <button
          class="deletePlanBtn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold w-full"
          data-id="${item.id}"
        >
          Sil
        </button>
      </div>
    `;
  }

  list.innerHTML = `
    <div class="col-span-full">
      <h3 class="text-2xl font-black text-rose-600 mb-4">
        📝 Planlarımız
      </h3>

      <div class="admin-grid mb-10">
        ${
          nearPlans.length
            ? nearPlans.map(createPlanCard).join("")
            : `<p class="col-span-full text-rose-700 bg-white/60 rounded-2xl p-4">Henüz plan eklenmedi.</p>`
        }
      </div>

      <h3 class="text-2xl font-black text-rose-600 mb-4">
        ✨ Hayallerimiz
      </h3>

      <div class="admin-grid">
        ${
          dreamPlans.length
            ? dreamPlans.map(createPlanCard).join("")
            : `<p class="col-span-full text-rose-700 bg-white/60 rounded-2xl p-4">Henüz hayal eklenmedi.</p>`
        }
      </div>
    </div>
  `;

  const publishedCount = planItems.filter((item) => item.published === true).length;

  if (info) {
    info.textContent = `Toplam: ${planItems.length} / Yayında: ${publishedCount}`;
  }

  document.querySelectorAll(".publishPlanCheck").forEach((check) => {
    check.addEventListener("change", async () => {
      const id = check.dataset.id;
      if (!id) return;

      await setDoc(
        doc(db, "plans", id),
        {
          published: check.checked
        },
        { merge: true }
      );

      loadAdminPlans();
    });
  });

  document.querySelectorAll(".deletePlanBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (!id) return;
      if (!confirm("Bu kayıt silinsin mi?")) return;

      await deleteDoc(doc(db, "plans", id));

      alert("Kayıt silindi");
      loadAdminPlans();
    });
  });
}

$("plansPrevBtn")?.addEventListener("click", () => {
  if (planPageCurrent > 1) {
    planPageCurrent--;
    renderPlanPage();
  }
});

$("plansNextBtn")?.addEventListener("click", () => {
  const totalPages = Math.ceil(planItems.length / pageSize) || 1;

  if (planPageCurrent < totalPages) {
    planPageCurrent++;
    renderPlanPage();
  }
});


async function loadAdminSecrets() {
  const list = $("secretAdminList");
  if (!list) return;

  const q = query(collection(db, "secretMessages"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  secretItems = [];

  snapshot.forEach((docSnap) => {
    secretItems.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderSecretPage();
}

function renderSecretPage() {
  const list = $("secretAdminList");
  const info = $("secretPageInfo");

  if (!list) return;

  const start = (secretPageCurrent - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = secretItems.slice(start, end);

  list.innerHTML = "";

  pageItems.forEach((item) => {
    const isPublished = item.published === true;

    list.innerHTML += `
      <div class="bg-white/70 rounded-3xl shadow-lg border border-rose-100 p-4">
        <div class="mb-3">
          ${publishBadge(isPublished)}
        </div>

        <p class="text-sm text-rose-900/80 line-clamp-6 mb-4">
          ${item.secretMessage || ""}
        </p>

        <button
          class="publishSecretBtn bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-bold w-full mb-2"
          data-id="${item.id}"
        >
          ${isPublished ? "Yayında" : "Yayınla"}
        </button>

        <button
          class="deleteSecretBtn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold w-full"
          data-id="${item.id}"
        >
          Sil
        </button>
      </div>
    `;
  });

  const totalPages = Math.ceil(secretItems.length / pageSize) || 1;
  if (info) info.textContent = `${secretPageCurrent} / ${totalPages}`;

  document.querySelectorAll(".publishSecretBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const selected = secretItems.find((x) => x.id === btn.dataset.id);
      if (!selected) return;

      await publishSingleItem("secretMessages", selected.id);

      await setDoc(
        doc(db, "siteSettings", "main"),
        {
          secretMessage: selected.secretMessage || "",
          secretMessageId: selected.id
        },
        { merge: true }
      );

      alert("Gizli mesaj yayımlandı");
      loadAdminSecrets();
    });
  });

  document.querySelectorAll(".deleteSecretBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Bu gizli mesaj silinsin mi?")) return;

      await deleteDoc(doc(db, "secretMessages", btn.dataset.id));

      alert("Gizli mesaj silindi");
      loadAdminSecrets();
    });
  });
}

$("secretPrevBtn")?.addEventListener("click", () => {
  if (secretPageCurrent > 1) {
    secretPageCurrent--;
    renderSecretPage();
  }
});

$("secretNextBtn")?.addEventListener("click", () => {
  const totalPages = Math.ceil(secretItems.length / pageSize) || 1;

  if (secretPageCurrent < totalPages) {
    secretPageCurrent++;
    renderSecretPage();
  }
});



/* İLETİŞİM AYARLARI */
function renderCurrentContactLinks(data) {
  const box = $("currentContactLinks");
  if (!box) return;

  const saidInstagram = data.saidInstagram || "";
  const veraInstagram = data.veraInstagram || "";

  box.innerHTML = `
    <div class="bg-white/70 rounded-2xl p-4 border border-rose-100">
      <p class="font-bold text-rose-600 mb-1">Muhammed</p>
      ${
        saidInstagram
          ? `<a href="${saidInstagram}" target="_blank" rel="noreferrer" class="underline break-all">${saidInstagram}</a>`
          : `<p class="opacity-70">Instagram linki kayıtlı değil.</p>`
      }
    </div>

    <div class="bg-white/70 rounded-2xl p-4 border border-rose-100">
      <p class="font-bold text-rose-600 mb-1">Vera</p>
      ${
        veraInstagram
          ? `<a href="${veraInstagram}" target="_blank" rel="noreferrer" class="underline break-all">${veraInstagram}</a>`
          : `<p class="opacity-70">Instagram linki kayıtlı değil.</p>`
      }
    </div>
  `;
}

async function loadContactSettings() {
  const saidInput = $("saidInstagramInput");
  const veraInput = $("veraInstagramInput");
  const currentBox = $("currentContactLinks");

  if (!saidInput && !veraInput && !currentBox) return;

  const ref = doc(db, "siteSettings", "main");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    if (currentBox) currentBox.innerHTML = "<p>Kayıtlı iletişim bilgisi yok.</p>";
    return;
  }

  const data = snap.data();

  if (saidInput) saidInput.value = data.saidInstagram || "";
  if (veraInput) veraInput.value = data.veraInstagram || "";

  renderCurrentContactLinks(data);
}

$("saveContactBtn")?.addEventListener("click", async () => {
  const saidInstagram = $("saidInstagramInput")?.value.trim() || "";
  const veraInstagram = $("veraInstagramInput")?.value.trim() || "";

  if (!saidInstagram && !veraInstagram) {
    alert("En az bir Instagram linki gir");
    return;
  }

  if (
    saidInstagram &&
    (!saidInstagram.includes("instagram.com") || !saidInstagram.startsWith("http"))
  ) {
    alert("Muhammed için geçerli Instagram linki gir");
    return;
  }

  if (
    veraInstagram &&
    (!veraInstagram.includes("instagram.com") || !veraInstagram.startsWith("http"))
  ) {
    alert("Vera için geçerli Instagram linki gir");
    return;
  }

  await setDoc(
    doc(db, "siteSettings", "main"),
    {
      saidInstagram,
      veraInstagram
    },
    { merge: true }
  );

  alert("İletişim bilgileri kaydedildi");
  loadContactSettings();
});

$("deleteContactBtn")?.addEventListener("click", async () => {
  if (!confirm("İletişim bilgileri silinsin mi?")) return;

  await setDoc(
    doc(db, "siteSettings", "main"),
    {
      saidInstagram: "",
      veraInstagram: ""
    },
    { merge: true }
  );

  if ($("saidInstagramInput")) $("saidInstagramInput").value = "";
  if ($("veraInstagramInput")) $("veraInstagramInput").value = "";

  renderCurrentContactLinks({
    saidInstagram: "",
    veraInstagram: ""
  });

  alert("İletişim bilgileri silindi");
});

/* GİZLİ SORULAR LİSTE */
async function loadAdminSecretQuestions() {
  const list = $("secretQuestionAdminList");
  if (!list) return;

  const q = query(
    collection(db, "secretQuestions"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  secretQuestionItems = [];

  snapshot.forEach((docSnap) => {
    secretQuestionItems.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderSecretQuestionPage();
}

function renderSecretQuestionPage() {
  const list = $("secretQuestionAdminList");
  const info = $("secretQuestionPageInfo");

  if (!list) return;

  const start = (secretQuestionPageCurrent - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = secretQuestionItems.slice(start, end);

  list.innerHTML = "";

  pageItems.forEach((item) => {
    const isPublished = item.published === true;

    list.innerHTML += `
      <div class="bg-white/70 rounded-3xl shadow-lg border border-rose-100 p-4">
        <div class="mb-3">
          ${publishBadge(isPublished)}
        </div>

        <h3 class="font-bold text-rose-600 text-lg mb-2">
          ${item.secretQuestion || "Sorusu yok"}
        </h3>

        <p class="text-sm text-rose-900/80 mb-4 break-words">
          <strong>Cevap:</strong> ${item.secretAnswer || "-"}
        </p>

        <button
          class="activateSecretQuestionBtn bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-bold w-full mb-2"
          data-id="${item.id}"
        >
          ${isPublished ? "Yayında" : "Yayınla"}
        </button>

        <button
          class="deleteSecretQuestionBtn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold w-full"
          data-id="${item.id}"
        >
          Sil
        </button>
      </div>
    `;
  });

  const totalPages = Math.ceil(secretQuestionItems.length / pageSize) || 1;

  if (info) {
    info.textContent = `${secretQuestionPageCurrent} / ${totalPages}`;
  }

  document.querySelectorAll(".activateSecretQuestionBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const selected = secretQuestionItems.find((x) => x.id === btn.dataset.id);

      if (!selected) return;

      await publishSingleItem("secretQuestions", selected.id);

      await setDoc(
        doc(db, "siteSettings", "main"),
        {
          secretQuestion: selected.secretQuestion || "",
          secretAnswer: selected.secretAnswer || "",
          secretQuestionId: selected.id
        },
        { merge: true }
      );

      alert("Bu soru ve cevap aktif yapıldı");
      loadAdminSecretQuestions();
    });
  });

  document.querySelectorAll(".deleteSecretQuestionBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Bu soru silinsin mi?")) return;

      await deleteDoc(doc(db, "secretQuestions", btn.dataset.id));

      alert("Soru silindi");
      loadAdminSecretQuestions();
    });
  });
}

$("secretQuestionPrevBtn")?.addEventListener("click", () => {
  if (secretQuestionPageCurrent > 1) {
    secretQuestionPageCurrent--;
    renderSecretQuestionPage();
  }
});

$("secretQuestionNextBtn")?.addEventListener("click", () => {
  const totalPages = Math.ceil(secretQuestionItems.length / pageSize) || 1;

  if (secretQuestionPageCurrent < totalPages) {
    secretQuestionPageCurrent++;
    renderSecretQuestionPage();
  }
});
