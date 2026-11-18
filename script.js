
"use strict";

/* NAV SCROLL */
const nav = document.getElementById("nav");

window.addEventListener(
  "scroll",
  () => nav.classList.toggle("stuck", scrollY > 60),
  { passive: true }
);

nav.classList.toggle("stuck", scrollY > 60);

/* BURGER */
const burger = document.getElementById("burger");
const mob = document.getElementById("mob");

burger.addEventListener("click", () => {
  const o = mob.classList.toggle("open");

  burger.classList.toggle("open", o);
  burger.setAttribute("aria-expanded", String(o));
});

mob.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    mob.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  });
});

/* SCROLL REVEAL */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("on");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".rv,.rv-l,.rv-r").forEach((el, i) => {
  if (
    el.closest(
      ".feat-grid,.rev-grid,.gal-grid,.stats-band__inner,.delivery-band__inner"
    )
  ) {
    el.style.transitionDelay = i * 0.09 + "s";
  }

  observer.observe(el);
});

/* LIGHTBOX */
const lb = document.getElementById("lb");
const lbImg = document.getElementById("lbImg");
const lbX = document.getElementById("lbX");

if (lb && lbImg && lbX) {
  document.querySelectorAll(".gi").forEach((gi) => {
    gi.addEventListener("click", () => {
      lbImg.src = "data:image/jpeg;base64," + gi.dataset.b64;
      lbImg.alt = gi.dataset.alt || "Product image";

      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  const closeLB = () => {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  };

  lbX.addEventListener("click", closeLB);

  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLB();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLB();
  });
}

/* FORM */
const oForm = document.getElementById("oForm");
const oBtn = document.getElementById("oBtn");
const oBtnTxt = document.getElementById("oBtnTxt");
const fmOk = document.getElementById("fmOk");
const fmErr = document.getElementById("fmErr");

/* FREE EXTRA BATTERY */
/* One free battery per pump */
const fq = document.getElementById("fq");
const fcSel = document.getElementById("fc");
const giftNoteTxt = document.getElementById("giftNoteTxt");
const freeGift = document.getElementById("freeGift");

const GIFT_NGN = 40000;
const GIFT_GHS = 265;

function updateGift() {
  const opt = fq.options[fq.selectedIndex];
  const units = parseInt(opt && opt.dataset.units, 10) || 0;
  const n = units || 1;
  const country = fcSel.value;

  const ngn =
    "\u20A6" + (GIFT_NGN * n).toLocaleString("en-US");

  const ghs =
    "GH\u20B5" + (GIFT_GHS * n).toLocaleString("en-US");

  const worth =
    country === "Nigeria"
      ? ngn
      : country === "Ghana"
        ? ghs
        : ngn + " / " + ghs;

  const label =
    n === 1
      ? "1 FREE extra battery"
      : n + " FREE extra batteries";

  giftNoteTxt.innerHTML = units
    ? "You get <b>" +
      label +
      "</b> with your order (worth " +
      worth +
      ")."
    : "Every pump comes with a <b>FREE extra battery</b> (worth " +
      worth +
      ").";

  freeGift.value =
    n +
    (n === 1 ? " Extra Battery" : " Extra Batteries") +
    " (free, worth " +
    worth +
    ")";
}

fq.addEventListener("change", updateGift);
fcSel.addEventListener("change", updateGift);

/* FORM VALIDATION */
function validate() {
  if (!document.getElementById("fn").value.trim()) {
    alert("Please enter your name.");
    return false;
  }

  if (!document.getElementById("fp").value.trim()) {
    alert("Please enter your phone number.");
    return false;
  }

  if (!fcSel.value) {
    alert("Please select your country.");
    return false;
  }

  if (!document.getElementById("fr").value.trim()) {
    alert("Please enter your region/state.");
    return false;
  }

  if (!fq.value) {
    alert("Please select your quantity/package.");
    return false;
  }

  if (!document.getElementById("fa").value.trim()) {
    alert("Please enter your delivery address.");
    return false;
  }

  return true;
}

/* ORDER SUBMISSION */
oForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!validate()) return;

  updateGift();

  oBtn.disabled = true;
  oBtnTxt.textContent = "Submitting...";

  try {
    const response = await fetch(this.action, {
      method: this.method,
      body: new FormData(this),
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      /* Read submitted order details */
      const selectedOption = fq.options[fq.selectedIndex];
      const units = Number(selectedOption?.dataset.units);
      const country = fcSel.value;

      /* Correct selling prices */
      const prices = {
        Nigeria: {
          currency: "NGN",
          unitPrice: 60000,
        },
        Ghana: {
          currency: "GHS",
          unitPrice: 500,
        },
      };

      const price = prices[country];

      /* Save order value for Meta Lead tracking */
      try {
        if (price && [1, 2].includes(units)) {
          sessionStorage.setItem(
            "voltedgeOrder",
            JSON.stringify({
              value: price.unitPrice * units,
              currency: price.currency,
            })
          );
        } else {
          sessionStorage.removeItem("voltedgeOrder");
        }
      } catch (error) {
        console.warn(
          "Order tracking storage is unavailable."
        );
      }

      /* Redirect after successful Formspree submission */
      window.location.href = "thankyou.html";
    } else {
      /* Formspree rejected the submission */
      fmErr.style.display = "flex";
      oBtn.disabled = false;
      oBtnTxt.textContent = "Confirm My Order";
    }
  } catch (err) {
    /* Network or submission error */
    fmErr.style.display = "flex";
    oBtn.disabled = false;
    oBtnTxt.textContent = "Confirm My Order";
  }
});

/* YEAR */
document.getElementById("yr").textContent =
  new Date().getFullYear();