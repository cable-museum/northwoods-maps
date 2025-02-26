/*------ COLOR VARIABLES ------*/

const maps = ["balsam", "maple", "redpine", "whitepine", "birch", "aspen", "oak", "oak-g", "maple-g"]
const colors = {}

for (const map of maps) {
    const varName = `--${map}`;  // This creates --maple, --oak, etc.
    const color = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    
    // Check if the color is valid
    if (color) {
        colors[map] = color;
    } else {
        console.warn(`Color variable --${map} not found`);
    }
}

function hexToRgb(hex) {
    // Remove the hash (#) at the start if it's there
    hex = hex.replace('#', '');

    // Convert the hex string into RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
}

function rgbToHex(rgb) {
    const r = rgb.r.toString(16).padStart(2, '0');
    const g = rgb.g.toString(16).padStart(2, '0');
    const b = rgb.b.toString(16).padStart(2, '0');
    
    return `#${r}${g}${b}`;
}

function blendColors(baseHex, accentHex, opacity) {
    // Convert hex to RGB
    const base = hexToRgb(baseHex);
    const accent = hexToRgb(accentHex);

    // Calculate the blended RGB values
    const r = Math.round((1 - opacity) * base.r + opacity * accent.r);
    const g = Math.round((1 - opacity) * base.g + opacity * accent.g);
    const b = Math.round((1 - opacity) * base.b + opacity * accent.b);

    // Return the blended color in RGB format
    return `rgb(${r}, ${g}, ${b})`;
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

function selectCard (card, map){
  card.classList.add("is-selected");
  card.style.borderColor = colors[map];
  card.style.backgroundColor = blendColors('#f5f5ef', colors[map], 0.2);

  const checkIcon = card.querySelector(".check-icon");
  checkIcon.style.color = colors[map];
}

function unselectCard(card) {
  card.classList.remove("is-selected");
  card.style.borderColor = "";
  card.style.backgroundColor = "";
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
            unselectCard(card);
            cardHistory.splice(cardHistory.indexOf(map), 1);

            updateAnimationState();
        } else if (isAddIcon) {
            if (cardHistory.length < 2) {
                cardHistory.push(map);
            } else {
                hideMap(cardHistory[0]);
                unselectCard(document.querySelector(`[data-map="${cardHistory[0]}"]`));
                cardHistory.shift();
                cardHistory.push(map);
            }

            selectCard(card, map);
            showMap(map);

            updateAnimationState();
        } else {
            document.querySelectorAll(".card.is-selected").forEach((card) => {
              unselectCard(card);
            });
            hideAllMaps();
            cardHistory = [map];
            selectCard(card, map);
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

// ------- PWA --------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js") // Use relative path
      .then((reg) => console.log("Service Worker registered!", reg))
      .catch((err) => console.log("Service Worker registration failed:", err));
  });
}


let deferredPrompt;
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;

  document.getElementById("install-btn").style.display = "block";
  
  document.getElementById("install-btn").addEventListener("click", () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      }
      deferredPrompt = null;
    });
  });
});


