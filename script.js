gsap.registerPlugin(ScrollTrigger);

// Flutter logo zoom effect with pinning
gsap.fromTo("#flutter-logo",
    { scale: 5 },  // Start at 500% zoom
    {
        scale: 1, // Scale down to original size
        ease: "power2.inOut", // Smoother easing function
        scrollTrigger: {
            trigger: "#flutter-container",
            start: "top top",
            end: "bottom top",
            scrub: 1,  // Smooth transition
            pin: true,  // Pin the section while the animation is in progress
            pinSpacing: false  // Remove extra spacing after pinning
        }
    }
);

// Dart logo zoom effect with pinning
gsap.fromTo("#dart-logo",
    { scale: 5 },  // Start at 500% zoom
    {
        scale: 1, // Scale down to original size
        ease: "power2.inOut", // Smoother easing function
        scrollTrigger: {
            trigger: "#dart-container",
            start: "top top",
            end: "bottom top",
            scrub: 1,  // Smooth transition
            pin: true,  // Pin the section while the animation is in progress
            pinSpacing: false  // Remove extra spacing after pinning
        }
    }
);