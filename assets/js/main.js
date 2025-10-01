/* ----- NAVIGATION BAR FUNCTION ----- */
function myMenuFunction() {
  var menuBtn = document.getElementById("myNavMenu");

  if (menuBtn.className === "nav-menu") {
    menuBtn.className += " responsive";
  } else {
    menuBtn.className = "nav-menu";
  }
}

/* ----- ADD SHADOW ON NAVIGATION BAR WHILE SCROLLING ----- */
window.onscroll = function () {
  headerShadow();
};

function headerShadow() {
  const navHeader = document.getElementById("header");

  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    navHeader.style.boxShadow = "0 1px 6px rgba(0, 0, 0, 0.1)";
    navHeader.style.height = "70px";
    navHeader.style.lineHeight = "70px";
  } else {
    navHeader.style.boxShadow = "none";
    navHeader.style.height = "90px";
    navHeader.style.lineHeight = "90px";
  }
}

/* ----- TYPING EFFECT ----- */
var typingEffect = new Typed(".typedText", {
  strings: ["Data Analyst", "Graduate Student"],
  loop: true,
  typeSpeed: 100,
  backSpeed: 80,
  backDelay: 2000,
});

/* ----- ## -- SCROLL REVEAL ANIMATION -- ## ----- */
const sr = ScrollReveal({
  origin: "top",
  distance: "80px",
  duration: 2000,
  reset: true,
});

/* -- HOME -- */
sr.reveal(".featured-text-card", {});
sr.reveal(".featured-name", { delay: 100 });
sr.reveal(".featured-text-info", { delay: 200 });
sr.reveal(".featured-text-btn", { delay: 200 });
sr.reveal(".social_icons", { delay: 200 });
sr.reveal(".featured-image", { delay: 300 });
/* -- PROJECT BOX -- */
sr.reveal(".project-box", { interval: 200 });
/* -- HEADINGS -- */
sr.reveal(".top-header", {});

/* ----- ## -- SCROLL REVEAL LEFT_RIGHT ANIMATION -- ## ----- */
/* -- ABOUT INFO & CONTACT INFO -- */
const srLeft = ScrollReveal({
  origin: "left",
  distance: "80px",
  duration: 2000,
  reset: true,
});

srLeft.reveal(".about-info", { delay: 100 });
srLeft.reveal(".contact-info", { delay: 100 });

/* -- ABOUT SKILLS & FORM BOX -- */
const srRight = ScrollReveal({
  origin: "right",
  distance: "80px",
  duration: 2000,
  reset: true,
});

srRight.reveal(".skills-box", { delay: 100 });
srRight.reveal(".form-control", { delay: 100 });

/* ----- CHANGE ACTIVE LINK ----- */
const sections = document.querySelectorAll("section[id]");
function scrollActive() {
  const scrollY = window.scrollY;
  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight,
      sectionTop = current.offsetTop - 50,
      sectionId = current.getAttribute("id");
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      document
        .querySelector(".nav-menu a[href*=" + sectionId + "]")
        .classList.add("active-link");
    } else {
      document
        .querySelector(".nav-menu a[href*=" + sectionId + "]")
        .classList.remove("active-link");
    }
  });
}
window.addEventListener("scroll", scrollActive);

/* === Swiper & Projects Filter === */
let swiper;

document.addEventListener("DOMContentLoaded", () => {
  // Swiper başlatma
  swiper = new Swiper(".myProjectsSwiper", {
    loop: true, // loop açık
    spaceBetween: 24,
    grabCursor: true,

    slidesPerView: 3,
    breakpoints: {
      0: { slidesPerView: 1 },
      640: { slidesPerView: 1.2 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      dynamicBullets: true,
    },

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  // Filtreleme butonları
  const filterButtons = document.querySelectorAll(".pf-btn");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Aktif buton güncellemesi
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const cat = btn.dataset.filter;

      // Tüm slide'ları al
      const slides = document.querySelectorAll(".swiper-slide");

      // Slide'ları filtrele
      slides.forEach((slide) => {
        const card = slide.querySelector(".project-card");
        if (!card) return;

        const cats = card.dataset.cat ? card.dataset.cat.split(" ") : [];
        const show = cat === "all" || cats.includes(cat);

        // Slide'ı gizle/göster
        if (show) {
          slide.style.display = "";
        } else {
          slide.style.display = "none";
        }
      });

      // Swiper'ı güncelle ve yeniden başlat
      if (swiper) {
        swiper.update();
        swiper.slideTo(0);
      }
    });
  });
});
