(function () {
  "use strict";

  const BANK_ACCOUNT = "1234567890";

  const audio = document.getElementById("bg-audio");
  const musicToggle = document.getElementById("music-toggle");
  const iconMusic = document.getElementById("icon-music");
  const iconPause = document.getElementById("icon-pause");

  const btnBuka = document.getElementById("btn-buka");
  const btnLokasi = document.getElementById("btn-lokasi");
  const gateBg = document.getElementById("gate-bg");
  const gateContent = document.getElementById("gate-content");
  const rest = document.getElementById("rest");

  const btnCopy = document.getElementById("btn-copy");
  const iconCopy = document.getElementById("icon-copy");
  const iconOk = document.getElementById("icon-ok");
  const copyMsg = document.getElementById("copy-msg");

  let isPlaying = false;
  let isOpen = false;
  let isOpening = false;

  /* ── Music ── */
  function setPlayingUI(playing) {
    isPlaying = playing;
    if (playing) {
      iconMusic.hidden = true;
      iconPause.hidden = false;
      musicToggle.setAttribute("aria-label", "Jeda musik");
    } else {
      iconMusic.hidden = false;
      iconPause.hidden = true;
      musicToggle.setAttribute("aria-label", "Putar musik");
    }
  }

  function playMusic() {
    if (!audio) return;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => setPlayingUI(true))
        .catch(() => setPlayingUI(false));
    } else {
      setPlayingUI(true);
    }
  }

  function toggleMusic() {
    if (!audio) return;
    if (audio.paused) {
      playMusic();
    } else {
      audio.pause();
      setPlayingUI(false);
    }
  }

  musicToggle.addEventListener("click", toggleMusic);

  // Start the track as soon as the page is ready, but keep it muted until the
  // first real interaction so browsers allow playback without waiting for the
  // invitation button click.
  function startMusicOnLoad() {
    if (!audio) return;
    audio.currentTime = 0;
    audio.muted = true;
    audio.volume = 1;
    playMusic();
  }

  function startOnFirstInteraction() {
    if (!audio) return;
    audio.muted = false;
    playMusic();
    window.removeEventListener("click", startOnFirstInteraction);
    window.removeEventListener("touchstart", startOnFirstInteraction);
    window.removeEventListener("keydown", startOnFirstInteraction);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    window.setTimeout(startMusicOnLoad, 100);
  } else {
    window.addEventListener("load", startMusicOnLoad, { once: true });
  }

  window.addEventListener("click", startOnFirstInteraction);
  window.addEventListener("touchstart", startOnFirstInteraction);
  window.addEventListener("keydown", startOnFirstInteraction);

  /* ── Lock scrolling until the invitation is opened ── */
  function updateScrollLock() {
    document.body.classList.toggle("lock-scroll", !isOpen);
    document.documentElement.classList.toggle("lock-scroll", !isOpen);
  }
  updateScrollLock();

  /* ── Reveal-on-scroll ── */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
  }

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  btnLokasi.addEventListener("click", () => scrollToId("location"));

  /* ── Open invitation (gate transition) ── */
  function openInvitation() {
    if (isOpening || isOpen) return;
    playMusic();

    isOpening = true;
    gateBg.classList.add("gate-opening");
    gateContent.classList.add("gate-opening");
    btnBuka.disabled = true;

    window.setTimeout(() => {
      isOpen = true;
      updateScrollLock();

      // Reveal the rest of the page
      rest.classList.remove("hidden");
      rest.classList.add("opened", "pre-reveal");
      rest.removeAttribute("aria-hidden");
      rest.removeAttribute("inert");

      // Hide the CTA row and show the "Lokasi Acara" header link
      gateContent.style.display = "none";
      btnLokasi.hidden = false;

      initReveal();

      window.setTimeout(() => {
        rest.classList.remove("pre-reveal");
        rest.classList.add("revealed");
      }, 30);

      window.setTimeout(() => scrollToId("verse"), 550);
    }, 700);
  }

  btnBuka.addEventListener("click", openInvitation);

  /* ── Copy bank account number ── */
  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(BANK_ACCOUNT);
      showCopied(true);
    } catch (err) {
      showCopied(false);
    }
  }

  let copyTimeout = null;
  function showCopied(success) {
    if (!success) return;
    iconCopy.hidden = true;
    iconOk.hidden = false;
    copyMsg.textContent = "Nomor rekening telah disalin";
    if (copyTimeout) window.clearTimeout(copyTimeout);
    copyTimeout = window.setTimeout(() => {
      iconCopy.hidden = false;
      iconOk.hidden = true;
      copyMsg.textContent = "";
    }, 2200);
  }

  btnCopy.addEventListener("click", copyAccount);
})();
