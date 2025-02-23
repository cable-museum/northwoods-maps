function isImageHidden(imgElement) {
    const style = window.getComputedStyle(imgElement);
    return style.display === "none";
}

function toggleSVG(treeName) {
    const img = document.getElementById(treeName);
    const button = document.querySelector(`button[data-tree="${treeName}"]`);

    if (isImageHidden(img)) {
        button.classList.remove("off");
        img.style.display = "block";
    } else {
        button.classList.add("off");
        img.style.display = "none";
    }
}

/*------ MAP ANIMATION ------*/

function createAnimation(containerId) {
    const animationContainer = document.getElementById(containerId);
    const layers = animationContainer.querySelectorAll(".overlay");
    let currentIndex = 0;
    let animationId;
    let lastTime = 0;
    const FRAME_DURATION = 1000; // 1 second per frame

    // Hide all layers initially
    layers.forEach((layer) => {
        layer.classList.remove("is-visible");
    });

    // Show first frame immediately
    layers[currentIndex].classList.add("is-visible");
    currentIndex = (currentIndex + 1) % layers.length;

    function showNextLayer(timestamp) {
        if (!lastTime) lastTime = timestamp;

        const elapsed = timestamp - lastTime;

        if (elapsed >= FRAME_DURATION) {
            // Hide previous layer
            if (currentIndex > 0) {
                layers[currentIndex - 1].classList.remove("is-visible");
            } else if (currentIndex === 0 && layers.length > 0) {
                layers[layers.length - 1].classList.remove("is-visible");
            }

            // Show current layer
            layers[currentIndex].classList.add("is-visible");

            // Set up next iteration
            currentIndex = (currentIndex + 1) % layers.length;

            lastTime = timestamp;
        }

        // Continue animation
        animationId = requestAnimationFrame(showNextLayer);
    }

    animationId = requestAnimationFrame(showNextLayer);
    return () => cancelAnimationFrame(animationId); // Return stop function
}

const containerIds = ["animated-redoak", "animated-maple"];
const stopAnimations = new Map();
function toggleAnimation(containerId) {
    // Check before we clear everything
    const shouldTurnOn = !stopAnimations.has(containerId);

    // Stop all animations and hide their layers
    containerIds.forEach((id) => {
        if (stopAnimations.has(id)) {
            const stopFn = stopAnimations.get(id);
            stopFn();
            stopAnimations.delete(id);
        }
        const container = document.getElementById(id);
        const layers = container.querySelectorAll(".overlay");
        layers.forEach((layer) => {
            layer.classList.remove("is-visible");
        });
    });

    // Should turn on the animation
    if (shouldTurnOn) {
        stopAnimations.set(containerId, createAnimation(containerId));
    }
}

document
    .querySelector('[data-map="oak-g"]')
    .addEventListener("click", () => toggleAnimation("animated-redoak"));

document
    .querySelector('[data-map="maple-g"]')
    .addEventListener("click", () => toggleAnimation("animated-maple"));
