document.addEventListener('DOMContentLoaded', () => {

    // --- Landing Animation Logic ---
    const introOverlay = document.getElementById('intro-overlay');

    if (introOverlay) {
        setTimeout(() => {
            introOverlay.classList.add('hidden');
            setTimeout(() => {
                introOverlay.style.display = 'none';
            }, 800);
        }, 2000);
    }


    // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    const htmlElement = document.documentElement;

    // localStorage can throw (private mode / blocked storage), so keep it guarded
    function readTheme() {
        try {
            return localStorage.getItem('theme');
        } catch (e) {
            return null;
        }
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            /* ignore */
        }
    }

    const savedTheme = readTheme();
    if (savedTheme === 'dark' || savedTheme === 'light') {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateIcon(savedTheme);
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-theme', newTheme);
        saveTheme(newTheme);
        updateIcon(newTheme);
    });

    function updateIcon(theme) {
        if (theme === 'dark') {
            themeIcon.classList.remove('ri-moon-line');
            themeIcon.classList.add('ri-sun-line');
        } else {
            themeIcon.classList.remove('ri-sun-line');
            themeIcon.classList.add('ri-moon-line');
        }
    }

    // --- Mobile Menu Toggle ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');

    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (sidebar.classList.contains('active')) {
            icon.classList.remove('ri-menu-line');
            icon.classList.add('ri-close-line');
        } else {
            icon.classList.remove('ri-close-line');
            icon.classList.add('ri-menu-line');
        }
    });

    // Close Sidebar on Link Click
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('ri-close-line');
                icon.classList.add('ri-menu-line');
            }
        });
    });

    function closeSidebar() {
        sidebar.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        icon.classList.remove('ri-close-line');
        icon.classList.add('ri-menu-line');
    }

    // Tap on the page (or press Esc) closes the open mobile menu
    document.querySelector('.main-content').addEventListener('click', () => {
        if (sidebar.classList.contains('active')) closeSidebar();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) closeSidebar();
    });

    // Rotating the phone / resizing to desktop must not leave the menu in a stuck state
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar.classList.contains('active')) closeSidebar();
        updateActiveLink();
    });

    // --- Active Link Highlighter ---
    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        const scrollPos = window.scrollY;
        let current = sections.length ? sections[0].getAttribute('id') : '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPos >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        // At the very bottom of the page, the last section should be active
        const atBottom = window.innerHeight + scrollPos >= document.documentElement.scrollHeight - 2;
        if (atBottom && sections.length) {
            current = sections[sections.length - 1].getAttribute('id');
        }

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();

    // --- Typing Effect ---
    const textElement = document.getElementById('typing-text');
    const phrases = ["Spring Boot Developer", "Backend Engineer", "Problem Solver"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    if (textElement) {
        type();
    }

    // --- Contact Form Submission ---
    const form = document.getElementById('contact-form');
    const formStatus = document.querySelector('.form-status');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const button = form.querySelector('button');
            const originalText = button.innerText;

            button.innerText = 'Sending...';
            button.disabled = true;
            formStatus.innerText = '';

            const formData = new FormData(form);

            try {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    formStatus.innerText = "Message sent successfully!";
                    formStatus.style.color = "var(--text-main)";
                    form.reset();
                } else {
                    formStatus.innerText = data.message || "Something went wrong.";
                    formStatus.style.color = "#ef4444";
                }
            } catch (error) {
                console.error(error);
                formStatus.innerText = "Network error or Invalid Key.";
                formStatus.style.color = "#ef4444";
            } finally {
                button.innerText = originalText;
                button.disabled = false;
                setTimeout(() => {
                    formStatus.innerText = '';
                }, 5000);
            }
        });
    }
});
