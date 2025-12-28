(function () {
    'use strict';

    const CONFIG = {
        lerpFactor: 0.08,
        respectReducedMotion: true
    };

    const state = {
        currentScroll: 0,
        targetScroll: 0,
        viewportHeight: window.innerHeight,
        isRunning: false,
        reducedMotion: false,
        layers: []
    };

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function checkReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function init() {
        state.reducedMotion = CONFIG.respectReducedMotion && checkReducedMotion();

        if (state.reducedMotion) {
            return;
        }

        cacheLayers();

        state.currentScroll = window.scrollY;
        state.targetScroll = window.scrollY;

        bindEvents();
        startAnimationLoop();
    }

    function cacheLayers() {
        const layerElements = document.querySelectorAll('.layer[data-speed]');

        state.layers = Array.from(layerElements).map(element => ({
            element: element,
            speed: parseFloat(element.dataset.speed) || 0
        }));
    }

    function bindEvents() {
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
        document.addEventListener('visibilitychange', onVisibilityChange);

        const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionMediaQuery.addEventListener('change', onMotionPreferenceChange);
    }

    function onScroll() {
        state.targetScroll = window.scrollY;
    }

    function onResize() {
        state.viewportHeight = window.innerHeight;
    }

    function onVisibilityChange() {
        if (document.hidden) {
            stopAnimationLoop();
        } else {
            state.currentScroll = window.scrollY;
            state.targetScroll = window.scrollY;
            startAnimationLoop();
        }
    }

    function onMotionPreferenceChange(event) {
        state.reducedMotion = event.matches;

        if (state.reducedMotion) {
            stopAnimationLoop();
            resetLayers();
        } else {
            state.currentScroll = window.scrollY;
            state.targetScroll = window.scrollY;
            startAnimationLoop();
        }
    }

    function startAnimationLoop() {
        if (state.isRunning || state.reducedMotion) return;

        state.isRunning = true;
        requestAnimationFrame(animationLoop);
    }

    function stopAnimationLoop() {
        state.isRunning = false;
    }

    function animationLoop() {
        if (!state.isRunning) return;

        state.currentScroll = lerp(
            state.currentScroll,
            state.targetScroll,
            CONFIG.lerpFactor
        );

        const scrollDelta = Math.abs(state.targetScroll - state.currentScroll);
        if (scrollDelta > 0.1) {
            updateLayers();
        }

        requestAnimationFrame(animationLoop);
    }

    function updateLayers() {
        const scrollProgress = state.currentScroll;

        for (let i = 0; i < state.layers.length; i++) {
            const layer = state.layers[i];
            const yOffset = -(scrollProgress * layer.speed);
            layer.element.style.transform = `translate3d(0, ${yOffset}px, 0)`;
        }
    }

    function resetLayers() {
        for (let i = 0; i < state.layers.length; i++) {
            state.layers[i].element.style.transform = 'translate3d(0, 0, 0)';
        }
    }

    function initSmoothScroll() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');

        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            initSmoothScroll();
        });
    } else {
        init();
        initSmoothScroll();
    }

})();
