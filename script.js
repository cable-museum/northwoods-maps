
function isImageHidden(imgElement) {
	const style = window.getComputedStyle(imgElement);
	return style.display === 'none';
}

function toggleSVG(treeName) {
	const img = document.getElementById(treeName);
	const button = document.querySelector(`button[data-tree="${treeName}"]`);

	if (isImageHidden(img)) {
		button.classList.remove('off');
		img.style.display = "block";

	} else {
		button.classList.add('off');
		img.style.display = "none";

	}
}

