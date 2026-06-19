// Makenda Landing Page JavaScript
// Robust init: works on Strato and all static hosts

(function () {
    "use strict";

    // ─── Core init function ──────────────────────────────────────────────────
    function init() {

        // ─── Mobile Menu Toggle (hamburger ↔ X) ─────────────────────────────
        var mobileMenuBtn = document.querySelector(".mobile-menu-btn");
        var navMenu = document.querySelector("nav ul");

        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener("click", function () {
                var isOpen = navMenu.classList.toggle("show");
                mobileMenuBtn.classList.toggle("active", isOpen);
                mobileMenuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
                mobileMenuBtn.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
            });

            document.addEventListener("click", function (e) {
                if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove("show");
                    mobileMenuBtn.classList.remove("active");
                    mobileMenuBtn.setAttribute("aria-expanded", "false");
                    mobileMenuBtn.setAttribute("aria-label", "Menü öffnen");
                }
            });
        }

        // ─── Smooth scrolling for anchor links ───────────────────────────────
        var anchorLinks = document.querySelectorAll("a[href^='#']");
        for (var i = 0; i < anchorLinks.length; i++) {
            anchorLinks[i].addEventListener("click", function (e) {
                var targetId = this.getAttribute("href");
                if (targetId === "#") return;
                var targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    if (mobileMenuBtn && navMenu && navMenu.classList.contains("show")) {
                        navMenu.classList.remove("show");
                        mobileMenuBtn.classList.remove("active");
                        mobileMenuBtn.setAttribute("aria-expanded", "false");
                        mobileMenuBtn.setAttribute("aria-label", "Menü öffnen");
                    }
                    var header = document.querySelector("header");
                    var headerHeight = header ? header.offsetHeight : 0;
                    var elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    var offsetPosition = elementPosition - headerHeight - 10;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
            });
        }

        // ─── Contact / Booking Tabs ───────────────────────────────────────────
        var tabBtns = document.querySelectorAll(".tab-btn");
        var tabContents = document.querySelectorAll(".tab-content");

        if (tabBtns.length > 0) {
            for (var t = 0; t < tabBtns.length; t++) {
                tabBtns[t].addEventListener("click", function () {
                    var targetTab = this.getAttribute("data-tab");

                    // Deactivate all
                    for (var j = 0; j < tabBtns.length; j++) {
                        tabBtns[j].classList.remove("active");
                        tabBtns[j].setAttribute("aria-selected", "false");
                    }
                    for (var k = 0; k < tabContents.length; k++) {
                        tabContents[k].classList.remove("active");
                    }

                    // Activate selected
                    this.classList.add("active");
                    this.setAttribute("aria-selected", "true");
                    var targetContent = document.getElementById(targetTab);
                    if (targetContent) {
                        targetContent.classList.add("active");
                    }
                });
            }
        }

        // ─── FAQ Accordion ────────────────────────────────────────────────────
        var faqQuestions = document.querySelectorAll(".faq-question");

        if (faqQuestions.length > 0) {
            for (var f = 0; f < faqQuestions.length; f++) {
                faqQuestions[f].addEventListener("click", function () {
                    var answer = this.nextElementSibling;
                    var isExpanded = this.getAttribute("aria-expanded") === "true";

                    // Close all others
                    for (var q = 0; q < faqQuestions.length; q++) {
                        if (faqQuestions[q] !== this) {
                            faqQuestions[q].setAttribute("aria-expanded", "false");
                            var otherAnswer = faqQuestions[q].nextElementSibling;
                            if (otherAnswer) otherAnswer.classList.remove("open");
                        }
                    }

                    // Toggle current
                    this.setAttribute("aria-expanded", isExpanded ? "false" : "true");
                    if (answer) {
                        if (isExpanded) {
                            answer.classList.remove("open");
                        } else {
                            answer.classList.add("open");
                        }
                    }
                });
            }
        }

        // ─── Date field: set min = tomorrow, disable weekends ────────────────
        var dateInput = document.getElementById("preferredDate");
        if (dateInput) {
            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            var yyyy = tomorrow.getFullYear();
            var mm = String(tomorrow.getMonth() + 1).padStart("0", 2);
            var dd = String(tomorrow.getDate()).padStart("0", 2);
            // Use standard padStart
            mm = (tomorrow.getMonth() + 1 < 10 ? "0" : "") + (tomorrow.getMonth() + 1);
            dd = (tomorrow.getDate() < 10 ? "0" : "") + tomorrow.getDate();
            dateInput.min = yyyy + "-" + mm + "-" + dd;

            dateInput.addEventListener("change", function () {
                if (!this.value) return;
                var chosen = new Date(this.value + "T00:00:00");
                var dow = chosen.getDay();
                if (dow === 0 || dow === 6) {
                    this.setCustomValidity("Bitte wählen Sie einen Werktag (Montag–Freitag).");
                    this.reportValidity();
                    this.value = "";
                } else {
                    this.setCustomValidity("");
                }
            });
        }

        // ─── Contact Form – Success/Error messages from PHP redirect ─────────
        var urlParams = new URLSearchParams(window.location.search);
        var formStatus = urlParams.get("status");
        var formMsg = urlParams.get("msg");
        var contactSection = document.getElementById("contact");

        if (contactSection && formStatus) {
            var messageDiv = document.getElementById("form-status-message");
            if (!messageDiv) {
                messageDiv = document.createElement("div");
                messageDiv.id = "form-status-message";
                var container = contactSection.querySelector(".container");
                var tabsEl = contactSection.querySelector(".contact-tabs");
                if (container && tabsEl) {
                    container.insertBefore(messageDiv, tabsEl);
                } else if (container) {
                    container.prepend(messageDiv);
                }
            }

            if (formStatus === "success") {
                messageDiv.innerHTML =
                    "<strong style='font-size:1.1rem;'>&#10003; Vielen Dank f&#252;r Ihre Nachricht!</strong><br><br>" +
                    "Wir haben Ihre Anfrage erhalten und melden uns innerhalb von 1&#8211;2 Werktagen.<br>" +
                    "<em>Eine Best&#228;tigung wurde an Ihre E-Mail-Adresse gesendet.</em>";
                messageDiv.setAttribute("style",
                    "display:block; padding:22px 24px; margin:0 0 28px; " +
                    "border:2px solid #28a745; border-radius:8px; " +
                    "background:#d4edda; color:#155724; " +
                    "font-size:1rem; line-height:1.7; text-align:center; " +
                    "box-shadow:0 2px 8px rgba(40,167,69,0.15);");
                // Switch to form tab and hide form
                var formTabBtn = document.querySelector('[data-tab="form-tab"]');
                if (formTabBtn) formTabBtn.click();
                var form = document.getElementById("contactForm");
                if (form) form.style.display = "none";
            } else if (formStatus === "error") {
                var detail = formMsg ? decodeURIComponent(formMsg) : "";
                messageDiv.innerHTML =
                    "<strong>&#10007; Fehler beim Senden.</strong>" +
                    (detail
                        ? "<br><small>" + detail + "</small>"
                        : "<br>Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt unter " +
                          "<a href='mailto:kontakt@makenda.digital'>kontakt@makenda.digital</a>.");
                messageDiv.setAttribute("style",
                    "display:block; padding:18px 20px; margin:0 0 24px; " +
                    "border:2px solid #dc3545; border-radius:8px; " +
                    "background:#f8d7da; color:#721c24; " +
                    "font-size:1rem; line-height:1.6; text-align:center;");
                var formTabBtn2 = document.querySelector('[data-tab="form-tab"]');
                if (formTabBtn2) formTabBtn2.click();
            }

            setTimeout(function () {
                contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 200);

            if (window.history && window.history.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname + "#contact");
            }
        }

        // ─── Client-side form validation ─────────────────────────────────────
        var contactForm = document.getElementById("contactForm");
        if (contactForm) {
            contactForm.addEventListener("submit", function (e) {
                var emailInput = document.getElementById("email");
                if (emailInput && !isValidEmail(emailInput.value)) {
                    e.preventDefault();
                    emailInput.setCustomValidity("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
                    emailInput.reportValidity();
                    emailInput.focus();
                    return;
                }
                if (emailInput) emailInput.setCustomValidity("");
            });
        }

        // ─── Testimonial slider (mobile only) ────────────────────────────────
        var testimonials = document.querySelectorAll(".testimonial");
        var currentTestimonial = 0;
        if (testimonials.length > 1 && window.innerWidth < 768) {
            for (var ts = 0; ts < testimonials.length; ts++) {
                if (ts !== 0) testimonials[ts].style.display = "none";
            }
            setInterval(function () {
                if (document.hidden) return;
                testimonials[currentTestimonial].style.display = "none";
                currentTestimonial = (currentTestimonial + 1) % testimonials.length;
                testimonials[currentTestimonial].style.display = "block";
            }, 5000);
        }

        // ─── Animate on scroll ───────────────────────────────────────────────
        function animateOnScroll() {
            var els = document.querySelectorAll(".case-study, .about-content, .testimonial, .faq-item");
            for (var a = 0; a < els.length; a++) {
                if (els[a].getBoundingClientRect().top < window.innerHeight - 100) {
                    els[a].classList.add("animate");
                }
            }
        }
        window.addEventListener("scroll", animateOnScroll);
        animateOnScroll();

        // ─── Impressum & Datenschutz Modals – Escape key ─────────────────────
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                var impressum = document.getElementById("impressum-modal");
                if (impressum) impressum.classList.remove("active");
                var datenschutz = document.getElementById("datenschutz-modal");
                if (datenschutz) datenschutz.classList.remove("active");
            }
        });

        // ─── URL hash: direct link to booking tab (#booking) ─────────────────
        if (window.location.hash === "#booking") {
            var bookingTabBtn = document.querySelector('[data-tab="booking-tab"]');
            if (bookingTabBtn) bookingTabBtn.click();
            var contactEl = document.getElementById("contact");
            if (contactEl) {
                setTimeout(function () {
                    var header = document.querySelector("header");
                    var headerHeight = header ? header.offsetHeight : 0;
                    var pos = contactEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
                    window.scrollTo({ top: pos, behavior: "smooth" });
                }, 100);
            }
        }
    } // end init()

    // ─── Robust DOM-ready detection ──────────────────────────────────────────
    // Works even if DOMContentLoaded already fired (Strato may inject scripts late)
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        // DOM already ready (script loaded at bottom of body or deferred)
        init();
    }

    // Extra safety: also run on window load in case DOMContentLoaded was missed
    window.addEventListener("load", function () {
        // Only re-run if FAQ buttons still have no listeners (idempotent check)
        var firstFaq = document.querySelector(".faq-question");
        if (firstFaq && firstFaq.getAttribute("aria-expanded") === null) {
            init();
        }
    });

})();

// ─── Helper ──────────────────────────────────────────────────────────────────
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
