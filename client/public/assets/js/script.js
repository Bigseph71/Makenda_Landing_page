// Makenda Landing Page JavaScript

document.addEventListener("DOMContentLoaded", function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const navMenu = document.querySelector("nav ul");
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", function() {
            navMenu.classList.toggle("show");
            mobileMenuBtn.classList.toggle("active");
        });
    }
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll("a[href^='#']");
    anchorLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                if (mobileMenuBtn && navMenu && navMenu.classList.contains("show")) {
                    navMenu.classList.remove("show");
                    mobileMenuBtn.classList.remove("active");
                }
                const header = document.querySelector("header");
                const headerHeight = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerHeight - 10;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });

    // ─── Date field: set min = tomorrow, disable weekends ────────────────────
    const dateInput = document.getElementById("preferredDate");
    if (dateInput) {
        // Calculate tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm   = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd   = String(tomorrow.getDate()).padStart(2, '0');
        dateInput.min = yyyy + '-' + mm + '-' + dd;

        // Block weekends on change
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
            const formContainer = contactSection.querySelector(".contact-container");
            if (container && formContainer) {
                container.insertBefore(messageDiv, formContainer);
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
            // Formulaire ausblenden
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

        // Clean URL (keep #contact, remove query params)
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
        document.querySelectorAll(".case-study, .about-content, .testimonial, .cta-content").forEach(el => {
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
});
