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

// When a user clicks... 
// - Get the data-map values
// - Check for classes
// IF card "is-selected"... 
// - remove "is-selected" from card
// - remove "is-visisble" from data-map
// - IF another map "is-visisble"...
// - - add "is-addable" too all other cards in same parent card-container
// ELSE IF card is "is-addable"
// - add "is-selected" to card
// - add "is-visisble" to data-map
// - remove "is-addable" from all cards
// ELSE --- THIS IS WRONG!
// - add "is-selected" to card
// - add "is-visible" to data-map
// - add "is-addable" to all other cards in same parent card-container

function hideMap(map) {
  document.getElementById(map).classList.remove("is-visible");
}

function hideAllMaps() {
  document.querySelectorAll(".overlay").forEach(map => {
    map.classList.remove("is-visible");
  });
}

function showMap(map) {
  document.getElementById(map).classList.add("is-visible");
}

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", function(event) {
    const clickedCard = event.currentTarget; // Parent .card div clicked on
    const allCardsInSection = [...card.parentElement.children]; // All cards in same card-container
    const allCards =  document.querySelectorAll(".card.is-selected");
    const map = card.getAttribute("data-map");
    
    if (clickedCard.classList.contains("is-selected")) {
      clickedCard.classList.remove("is-selected");
      hideMap(map);

      // If there is another selected card, add "is-addable" to all others
      if (allCardsInSection.find(card => card.classList.contains("is-selected"))) {
        allCardsInSection.forEach(card => {
          if (!card.classList.contains("is-selected")) {
            card.classList.add("is-addable");
          }
        });
      }
      else {
        allCardsInSection.forEach(card => {
          card.classList.remove("is-addable");
      });
      }

    }
    else if (card.classList.contains("is-addable")) {
      clickedCard.classList.add("is-selected");
      clickedCard.classList.remove("is-addable");
      showMap(map);

      // Remove "is-addable" to all cards in section
      allCardsInSection.forEach(card => {
        if (card.classList.contains("is-addable")) {
          card.classList.remove("is-addable");
        }
      });
    }
    else {
      // Hide all maps Remove any cards with class "is-selected" in both sections
      hideAllMaps();
      allCards.forEach(card => {
        card.classList.remove("is-selected")
      });
      
      clickedCard.classList.add("is-selected");
      showMap(map);
      
      // Add "is-addable" to other cards sections
      allCardsInSection.forEach(card => {
        if (card !== clickedCard) {
          card.classList.add("is-addable");
        }
      });

    }
  });
});


// function buttonClick(event) {
//   event.preventDefault();
//   console.log('#### event', event.target);
//     // const button = document.querySelector(`[data-map="${name}"]`);
//     // const map = document.getElementById(name);
//     // console.log(button);
//     // console.log(map);
// }

// document
//     .querySelector('.card')
//     .addEventListener("click", (event) => buttonClick(event));

/*------ MAP ANIMATION ------*/

const containerIds = ["animated-redoak", "animated-maple"];
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

function stopAnimation(containerId) {
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
    containerIds.forEach((id) => {
        stopAnimation(id);
    });
}

function toggleAnimation(containerId) {
    if (stopAnimations.has(containerId)) {
        stopAnimation(containerId);
    } else {
        stopAnimations.set(containerId, createAnimation(containerId));
    }
}

document
    .querySelector('[data-map="oak-g"]')
    .addEventListener("click", () => toggleAnimation("animated-redoak"));

document
    .querySelector('[data-map="maple-g"]')
    .addEventListener("click", () => toggleAnimation("animated-maple"));
