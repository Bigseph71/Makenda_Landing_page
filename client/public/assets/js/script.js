// Makenda Landing Page JavaScript

document.addEventListener("DOMContentLoaded", function() {

    // ─── Mobile Menu Toggle (hamburger ↔ X) ─────────────────────────────────
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const navMenu = document.querySelector("nav ul");

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", function() {
            const isOpen = navMenu.classList.toggle("show");
            mobileMenuBtn.classList.toggle("active", isOpen);
            // Update aria-expanded for accessibility
            mobileMenuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
            mobileMenuBtn.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
        });

        // Close menu when clicking outside
        document.addEventListener("click", function(e) {
            if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove("show");
                mobileMenuBtn.classList.remove("active");
                mobileMenuBtn.setAttribute("aria-expanded", "false");
                mobileMenuBtn.setAttribute("aria-label", "Menü öffnen");
            }
        });
    }

    // ─── Smooth scrolling for anchor links ───────────────────────────────────
    const anchorLinks = document.querySelectorAll("a[href^='#']");
    anchorLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                // Close mobile menu if open
                if (mobileMenuBtn && navMenu && navMenu.classList.contains("show")) {
                    navMenu.classList.remove("show");
                    mobileMenuBtn.classList.remove("active");
                    mobileMenuBtn.setAttribute("aria-expanded", "false");
                    mobileMenuBtn.setAttribute("aria-label", "Menü öffnen");
                }
                const header = document.querySelector("header");
                const headerHeight = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerHeight - 10;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });

    // ─── Contact/Booking Tabs ─────────────────────────────────────────────────
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(function(btn) {
        btn.addEventListener("click", function() {
            const targetTab = this.getAttribute("data-tab");

            // Deactivate all tabs
            tabBtns.forEach(function(b) {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            tabContents.forEach(function(c) {
                c.classList.remove("active");
            });

            // Activate selected tab
            this.classList.add("active");
            this.setAttribute("aria-selected", "true");
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add("active");
            }
        });
    });

    // ─── FAQ Accordion ────────────────────────────────────────────────────────
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach(function(question) {
        question.addEventListener("click", function() {
            const answer = this.nextElementSibling;
            const isExpanded = this.getAttribute("aria-expanded") === "true";

            // Close all other open answers
            faqQuestions.forEach(function(q) {
                if (q !== question) {
                    q.setAttribute("aria-expanded", "false");
                    const a = q.nextElementSibling;
                    if (a) a.classList.remove("open");
                }
            });

            // Toggle current
            this.setAttribute("aria-expanded", isExpanded ? "false" : "true");
            if (answer) {
                answer.classList.toggle("open", !isExpanded);
            }
        });
    });

    // ─── Date field: set min = tomorrow, disable weekends ────────────────────
    const dateInput = document.getElementById("preferredDate");
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm   = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd   = String(tomorrow.getDate()).padStart(2, '0');
        dateInput.min = yyyy + '-' + mm + '-' + dd;

        dateInput.addEventListener("change", function() {
            if (!this.value) return;
            const chosen = new Date(this.value + 'T00:00:00');
            const dow = chosen.getDay(); // 0=Sun, 6=Sat
            if (dow === 0 || dow === 6) {
                this.setCustomValidity("Bitte wählen Sie einen Werktag (Montag–Freitag).");
                this.reportValidity();
                this.value = '';
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // ─── Contact Form – Success/Error messages from PHP redirect ─────────────
    const urlParams    = new URLSearchParams(window.location.search);
    const formStatus   = urlParams.get("status");
    const formMsg      = urlParams.get("msg");
    const contactSection = document.getElementById("contact");

    if (contactSection && formStatus) {
        let messageDiv = document.getElementById("form-status-message");
        if (!messageDiv) {
            messageDiv = document.createElement("div");
            messageDiv.id = "form-status-message";
            const container = contactSection.querySelector(".container");
            const tabsEl = contactSection.querySelector(".contact-tabs");
            if (container && tabsEl) {
                container.insertBefore(messageDiv, tabsEl);
            } else if (container) {
                container.prepend(messageDiv);
            }
        }

        if (formStatus === "success") {
            messageDiv.innerHTML =
                '<strong style="font-size:1.1rem;">&#10003; Vielen Dank f&#252;r Ihre Nachricht!</strong><br><br>' +
                'Wir haben Ihre Anfrage erhalten und melden uns innerhalb von 1&#8211;2 Werktagen.<br>' +
                '<em>Eine Best&#228;tigung wurde an Ihre E-Mail-Adresse gesendet.</em>';
            messageDiv.setAttribute("style",
                "display:block; padding:22px 24px; margin:0 0 28px; " +
                "border:2px solid #28a745; border-radius:8px; " +
                "background:#d4edda; color:#155724; " +
                "font-size:1rem; line-height:1.7; text-align:center; " +
                "box-shadow:0 2px 8px rgba(40,167,69,0.15);");
            // Hide the form after success
            const form = document.getElementById("contactForm");
            if (form) form.style.display = "none";
        } else if (formStatus === "error") {
            const detail = formMsg ? decodeURIComponent(formMsg) : '';
            messageDiv.innerHTML =
                '<strong>&#10007; Fehler beim Senden.</strong>' +
                (detail
                    ? '<br><small>' + detail + '</small>'
                    : '<br>Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt unter ' +
                      '<a href="mailto:kontakt@makenda.digital">kontakt@makenda.digital</a>.');
            messageDiv.setAttribute("style",
                "display:block; padding:18px 20px; margin:0 0 24px; " +
                "border:2px solid #dc3545; border-radius:8px; " +
                "background:#f8d7da; color:#721c24; " +
                "font-size:1rem; line-height:1.6; text-align:center;");
        }

        // Scroll to contact section
        setTimeout(function() {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);

        // Clean URL
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname + '#contact');
        }
    }

    // ─── Client-side form validation ─────────────────────────────────────────
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function(e) {
            const emailInput = document.getElementById("email");
            if (emailInput && !isValidEmail(emailInput.value)) {
                e.preventDefault();
                emailInput.setCustomValidity("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
                emailInput.reportValidity();
                emailInput.focus();
                return;
            }
            if (emailInput) emailInput.setCustomValidity('');
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ─── Testimonial slider (mobile only) ────────────────────────────────────
    const testimonials = document.querySelectorAll(".testimonial");
    let currentTestimonial = 0;
    if (testimonials.length > 1 && window.innerWidth < 768) {
        testimonials.forEach((t, i) => { if (i !== 0) t.style.display = "none"; });
        setInterval(() => {
            if (document.hidden) return;
            testimonials[currentTestimonial].style.display = "none";
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            testimonials[currentTestimonial].style.display = "block";
        }, 5000);
    }

    // ─── Animate on scroll ───────────────────────────────────────────────────
    const animateOnScroll = function() {
        document.querySelectorAll(".case-study, .about-content, .testimonial, .faq-item").forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight - 100) {
                el.classList.add("animate");
            }
        });
    };
    window.addEventListener("scroll", animateOnScroll);
    animateOnScroll();

    // ─── Impressum & Datenschutz Modals – Escape key ─────────────────────────
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var impressum = document.getElementById('impressum-modal');
            if (impressum) impressum.classList.remove('active');
            var datenschutz = document.getElementById('datenschutz-modal');
            if (datenschutz) datenschutz.classList.remove('active');
        }
    });

    // ─── Check URL for tab parameter (e.g., #contact?tab=booking) ────────────
    // Allow direct linking to booking tab via URL hash
    if (window.location.hash === '#booking') {
        const bookingTabBtn = document.querySelector('[data-tab="booking-tab"]');
        if (bookingTabBtn) bookingTabBtn.click();
        const contactEl = document.getElementById('contact');
        if (contactEl) {
            setTimeout(function() {
                const header = document.querySelector("header");
                const headerHeight = header ? header.offsetHeight : 0;
                const pos = contactEl.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
                window.scrollTo({ top: pos, behavior: "smooth" });
            }, 100);
        }
    }
});
