/* global-sidebar.js - Independent Standalone Mobile Sidebar Injector Framework */

document.addEventListener('DOMContentLoaded', () => {
    async function injectSidebar() {
        const headerInner = document.querySelector('.header-inner');
        const mainNav = document.querySelector('.main-nav');
        
        // Safety exit check if header elements aren't present on the page
        if (!headerInner) return;

        try {
            // Fetch the standalone component file dynamically
            const response = await fetch(window.BASE_URL + 'sidebar/index.html');
            if (!response.ok) throw new Error('Sidebar resource missing or unreachable');
            const htmlString = await response.text();

            // Create temporary memory container parsing nodes cleanly
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');

            const toggleBtn = doc.getElementById('mobile-menu-toggle');
            const sidebarMenu = doc.getElementById('mobile-sidebar-menu');
            const backdropVeil = doc.getElementById('sidebar-backdrop');

            // 1. Automatically place the hamburger icon inside your existing header
            if (toggleBtn) headerInner.insertBefore(toggleBtn, headerInner.firstChild);

            // Fix relative paths using BASE_URL before attaching to document
            if (sidebarMenu) {
                sidebarMenu.querySelectorAll('a').forEach(a => {
                    const href = a.getAttribute('href');
                    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('javascript:')) {
                        a.setAttribute('href', window.BASE_URL + href);
                    }
                });
                
                sidebarMenu.querySelectorAll('img').forEach(img => {
                    const src = img.getAttribute('src');
                    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                        img.setAttribute('src', window.BASE_URL + src);
                    }
                });
            }

            // 2. Safely attach layout overlay screens directly to the active document body container
            if (sidebarMenu) document.body.appendChild(sidebarMenu);
            if (backdropVeil) document.body.appendChild(backdropVeil);

            // Give a utility tag to your existing desktop layout menu navigation bar to cleanly isolate styles
            if (mainNav) mainNav.classList.add('desktop-nav');

            // Find out which page we are currently browsing and auto-assign the 'active' link decoration
            highlightCurrentMobilePage();

            // Attach interactive drawer action event click listeners
            bindSidebarToggleControls();

        } catch (error) {
            console.error("Automated Sidebar Injected Exception Error Log:", error);
        }
    }

    // Handles open, close, and background backdrop dim click dismissals
    function bindSidebarToggleControls() {
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const menuClose = document.getElementById('mobile-menu-close');
        const sidebar = document.getElementById('mobile-sidebar-menu');
        const backdrop = document.getElementById('sidebar-backdrop');

        if (menuToggle && sidebar && backdrop) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.add('open');
                backdrop.classList.add('visible');
                document.body.style.overflow = 'hidden'; // Stop background content from scrolling behind menu
            });
        }

        const closeMobileMenu = () => {
            if (sidebar) sidebar.classList.remove('open');
            if (backdrop) backdrop.classList.remove('visible');
            document.body.style.overflow = ''; // Let background window scrolling function normally again
        };

        if (menuClose) menuClose.addEventListener('click', closeMobileMenu);
        if (backdrop) backdrop.addEventListener('click', closeMobileMenu);
    }

    // Automatically highlights the tab link matches corresponding to the window browser path URL location
    function highlightCurrentMobilePage() {
        let currentUrl = window.location.href.split('?')[0].split('#')[0];
        if (currentUrl.endsWith('index.html')) {
            currentUrl = currentUrl.replace('index.html', '');
        }
        
        const mobileLinks = document.querySelectorAll('.sidebar-nav a');
        
        mobileLinks.forEach(link => {
            let linkUrl = link.href.split('?')[0].split('#')[0];
            if (linkUrl.endsWith('index.html')) {
                linkUrl = linkUrl.replace('index.html', '');
            }
            
            if (linkUrl === currentUrl) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    injectSidebar();
});
