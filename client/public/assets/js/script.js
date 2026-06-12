// Makenda Landing Page JavaScript

document.addEventListener("DOMContentLoaded", function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const navMenu = document.querySelector("nav ul");
    
    if (mobileMenuBtn && navMenu) { // Check if both elements exist
        mobileMenuBtn.addEventListener("click", function() {
            navMenu.classList.toggle("show");
            mobileMenuBtn.classList.toggle("active"); // Toggle 'active' on the button itself
        });
    }
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll("a[href^='#']");
    
    anchorLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return; // Ignore links that are just #
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault(); // Prevent default jump only if target exists
                
                // Close mobile menu if open
                if (mobileMenuBtn && navMenu && navMenu.classList.contains("show")) { // Check elements exist
                    navMenu.classList.remove("show");
                    mobileMenuBtn.classList.remove("active"); // Also remove 'active' from button
                }
                
                // Calculate offset dynamically based on header height
                const header = document.querySelector("header");
                const headerHeight = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerHeight - 10; // Adjusted offset with buffer

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
    
    // Contact Form - Display Success/Error Messages from PHP redirect
    const urlParams = new URLSearchParams(window.location.search);
    const formStatus = urlParams.get("status");
    const contactSection = document.getElementById("contact");

    if (contactSection && formStatus) {
        let messageDiv = document.getElementById("form-status-message");
        if (!messageDiv) {
            messageDiv = document.createElement("div");
            messageDiv.id = "form-status-message";
            // Insert the message div before the form container
            const formContainer = contactSection.querySelector(".contact-container");
            if (formContainer) {
                contactSection.querySelector(".container").insertBefore(messageDiv, formContainer);
            }
        }
        
        if (formStatus === "success") {
            messageDiv.textContent = "Vielen Dank für Ihre Nachricht! Wir werden uns in Kürze bei Ihnen melden.";
            messageDiv.className = "form-status-success";
        } else if (formStatus === "error") {
            messageDiv.textContent = "Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt.";
            messageDiv.className = "form-status-error";
        }
    }

    // Basic Client-Side Validation
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function(e) {
            // Basic validation
            const emailInput = document.getElementById("email");
            if (emailInput && !isValidEmail(emailInput.value)) {
                e.preventDefault(); // Prevent submission if email is invalid client-side
                alert("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
                emailInput.focus();
                return;
            }
            // Allow native form submission to contact_handler.php
        });
    }
    
    // Email validation helper function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Testimonial slider (simple version - only active on mobile)
    const testimonials = document.querySelectorAll(".testimonial");
    let currentTestimonial = 0;
    
    // Only initialize slider if there are multiple testimonials and we're on mobile
    if (testimonials.length > 1 && window.innerWidth < 768) {
        // Hide all testimonials except the first one
        testimonials.forEach((testimonial, index) => {
            if (index !== 0) {
                testimonial.style.display = "none";
            }
        });
        
        // Auto-rotate testimonials every 5 seconds
        setInterval(() => {
            if (document.hidden) return; // Don't rotate if tab is not visible
            testimonials[currentTestimonial].style.display = "none";
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            testimonials[currentTestimonial].style.display = "block";
        }, 5000);
    }
    
    // Add animation classes when elements come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll(".case-study, .about-content, .testimonial, .cta-content");
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            // Add a class when element is partially in view
            if (elementPosition < windowHeight - 100) {
                element.classList.add("animate");
            }
        });
    };
    
    // Run on scroll
    window.addEventListener("scroll", animateOnScroll);
    
    // Run once on page load
    animateOnScroll();

    // Impressum & Datenschutz Modals — Escape key support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var impressum = document.getElementById('impressum-modal');
            if (impressum) impressum.classList.remove('active');
            var datenschutz = document.getElementById('datenschutz-modal');
            if (datenschutz) datenschutz.classList.remove('active');
        }
    });
});
