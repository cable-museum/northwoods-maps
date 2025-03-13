/*------ COLOR VARIABLES ------*/

const maps = ["balsam", "maple", "birch", "hemlock", "glacier", "loon", "oak", "whitepine"]
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

function showMap(map) {
    document.getElementById(map).classList.add("is-visible");
    checkResetButtonState();
}

function hideMap(map) {
    document.getElementById(map).classList.remove("is-visible");
    checkResetButtonState();
}

function resetAll() {
    document.querySelectorAll(".card.is-selected").forEach((card) => {
        unselectCard(card);
      });

    document.querySelectorAll(".overlay").forEach((map) => {
        map.classList.remove("is-visible");
    });

    document.querySelectorAll(".animation-container").forEach((container) => {
        container.classList.remove("is-visible");
    });
    checkResetButtonState();

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

function checkResetButtonState() {
    const resetButton = document.getElementById("reset-button");
    
    if (countMapsSelected() <= 1) {
      resetButton.style.display = "none";
    }
    else {
      resetButton.style.display = "flex";
    }
}

function countMapsSelected() {
    const count = document.querySelectorAll(`.card.is-selected`).length;
    return count
}


document.getElementById("reset-button").addEventListener("click", function() {
  resetAll();
});

let sectionActive = "default";

document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", function (event) {
        const map = card.getAttribute("data-map");
        const isSelected = Boolean(card.classList.contains("is-selected"));
        const sectionID = this.closest(".card-container").id;

        // Unselected card
        if (isSelected) {
            unselectCard(card);
            hideMap(map);
            updateAnimationState();
        } 
        // Selected Card
        else {
             if (sectionActive !== sectionID) {
                // Reset if in a different section
                resetAll();
            }
            selectCard(card, map);
            showMap(map);
            updateAnimationState();
        }

        sectionActive = sectionID;
    });
});

/*------ MAP ANIMATION ------*/

let animationId = null;
let lastAnimationTime = 0;
let currentFrameIndex = 0;
const FRAME_DURATION = 750; // 0.75 second per frame

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

// ------- TIMEOUT RESET --------
//TODO: show #reset-warning with countdown
//TODO: make warning not move when it changes the number
// let timeout;

// function handleActivity() {
//     clearTimeout(timeout); // Reset the timer
//     timeout = setTimeout(() => {
//         console.log("No activity for 30 seconds, resetting Map...");
//         resetAll();
//     }, 30000); // 30-second delay
// }

// // Example: Listen for keypresses or mouse movements
// document.addEventListener("mousemove", handleActivity);
// document.addEventListener("keypress", handleActivity);


// // ------- PWA --------
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker.register("./service-worker.js") // Use relative path
//       .then((reg) => console.log("Service Worker registered!", reg))
//       .catch((err) => console.log("Service Worker registration failed:", err));
//   });
// }


