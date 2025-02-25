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

/*------ MAP BUTTONS ------*/

function hideMap(map) {
    document.getElementById(map).classList.remove("is-visible");
}

function hideAllMaps() {
    document.querySelectorAll(".overlay").forEach((map) => {
        map.classList.remove("is-visible");
    });

    document.querySelectorAll(".animation-container").forEach((container) => {
        container.classList.remove("is-visible");
    });
}

function showMap(map) {
    document.getElementById(map).classList.add("is-visible");
}

let cardHistory = ["balsam"];
document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", function (event) {
        const isAddIcon = Boolean(event.target.closest(".add-icon"));
        const map = card.getAttribute("data-map");
        const isSelected = Boolean(card.classList.contains("is-selected"));

        // Select and deselect cards
        if (isSelected) {
            hideMap(map);
            card.classList.remove("is-selected");
            cardHistory.splice(cardHistory.indexOf(map), 1);

            updateAnimationState();
        } else if (isAddIcon) {
            if (cardHistory.length < 2) {
                cardHistory.push(map);
            } else {
                hideMap(cardHistory[0]);
                document
                    .querySelector(`[data-map="${cardHistory[0]}"]`)
                    .classList.remove("is-selected");
                cardHistory.shift();
                cardHistory.push(map);
            }

            card.classList.add("is-selected");
            showMap(map);

            updateAnimationState();
        } else {
            document.querySelectorAll(".card.is-selected").forEach((card) => {
                card.classList.remove("is-selected");
            });
            hideAllMaps();
            cardHistory = [map];
            card.classList.add("is-selected");
            showMap(map);

            updateAnimationState();
        }
    });
});

/*------ MAP ANIMATION ------*/

let animationId = null;
let lastAnimationTime = 0;
let currentFrameIndex = 0;
const FRAME_DURATION = 1000; // 1 second per frame

// Function to start the global animation loop
function startAnimation() {
    if (animationId) {
        return;
    }

    lastAnimationTime = 0;
    currentFrameIndex = 0; // Always start at the first frame

    // Initialize all animation containers
    document.querySelectorAll(".animation-container").forEach((container) => {
        const layers = container.querySelectorAll(".overlay");

        // Hide all layers initially
        layers.forEach((layer) => {
            layer.classList.remove("is-visible");
        });

        // Show first frame if container is visible
        if (container.classList.contains("is-visible") && layers.length > 0) {
            layers[0].classList.add("is-visible");
        }
    });

    // Start the animation loop
    animationId = requestAnimationFrame(animationLoop);
}

// Function to stop the animation
function stopAnimation() {
    if (!animationId) {
        return;
    }

    cancelAnimationFrame(animationId);
    animationId = null;
    currentFrameIndex = 0;

    // Reset all animations to hide all frames
    document.querySelectorAll(".animation-container").forEach((container) => {
        const layers = container.querySelectorAll(".overlay");
        layers.forEach((layer) => {
            layer.classList.remove("is-visible");
        });
    });
}

// Find the maximum number of frames across all visible animation containers
function getMaxFrameCount() {
    let maxFrames = 0;

    document
        .querySelectorAll(".animation-container.is-visible")
        .forEach((container) => {
            const frameCount = container.querySelectorAll(".overlay").length;
            maxFrames = Math.max(maxFrames, frameCount);
        });

    return maxFrames || 1; // Return at least 1 to avoid division by zero
}

// The main animation loop that handles all visible animation containers
function animationLoop(timestamp) {
    if (!lastAnimationTime) {
        lastAnimationTime = timestamp;
    }

    const elapsed = timestamp - lastAnimationTime;

    if (elapsed >= FRAME_DURATION) {
        const maxFrames = getMaxFrameCount();

        // Advance the global frame index
        currentFrameIndex = (currentFrameIndex + 1) % maxFrames;

        // Process each animation container
        document
            .querySelectorAll(".animation-container")
            .forEach((container) => {
                const layers = container.querySelectorAll(".overlay");
                if (layers.length === 0) {
                    return;
                }

                // Hide all layers
                layers.forEach((layer) => {
                    layer.classList.remove("is-visible");
                });

                // Show the current frame if it exists for this container
                if (currentFrameIndex < layers.length) {
                    layers[currentFrameIndex].classList.add("is-visible");
                }
            });

        lastAnimationTime = timestamp;
    }

    // Continue animation
    animationId = requestAnimationFrame(animationLoop);
}

// Check if any animation containers are visible and start/stop animation accordingly
function updateAnimationState() {
    const visibleAnimations = document.querySelectorAll(
        ".animation-container.is-visible"
    );

    if (visibleAnimations.length > 0) {
        startAnimation();
    } else {
        stopAnimation();
    }
}
