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
}

function showMap(map) {
    document.getElementById(map).classList.add("is-visible");
}

let cardHistory = ["balsam"];
document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", function (event) {
        const isAddIcon = Boolean(event.target.closest(".add-icon"));
        const isAnimation = Boolean(event.target.closest("#animated"));
        const map = card.getAttribute("data-map");
        const isSelected = Boolean(card.classList.contains("is-selected"));

        // Select and deselect cards
        if (isSelected) {
            hideMap(map);
            card.classList.remove("is-selected");
            cardHistory.splice(cardHistory.indexOf(map), 1);
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
        } else {
            document.querySelectorAll(".card.is-selected").forEach((card) => {
                card.classList.remove("is-selected");
            });
            hideAllMaps();
            cardHistory = [map];
            card.classList.add("is-selected");
            showMap(map);
        }

        // // Make the is-addable state match the selections
        // if (document.querySelectorAll(".card.is-selected").length < 2) {
        //     document
        //         .querySelectorAll(".card:not(.is-selected)")
        //         .forEach((card) => {
        //             card.classList.add("is-addable");
        //         });
        // } else {
        //     document
        //         .querySelectorAll(".card:not(.is-selected)")
        //         .forEach((card) => {
        //             card.classList.remove("is-addable");
        //         });
        // }
    });
});

/*------ MAP ANIMATION ------*/

const stopAnimations = new Map();

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

function stopAnimation(id) {
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
}

function stopAllAnimations() {
    // Stop all animations and hide their layers
    document.querySelectorAll(".animation-container").forEach((container) => {
        stopAnimation(container.id);
    });
}

function toggleAnimation(containerId) {
    if (stopAnimations.has(containerId)) {
        stopAnimation(containerId);
    } else {
        stopAnimations.set(containerId, createAnimation(containerId));
    }
}

function showOneAnimation(containerId) {
    stopAllAnimations();
    toggleAnimation(containerId);
}
