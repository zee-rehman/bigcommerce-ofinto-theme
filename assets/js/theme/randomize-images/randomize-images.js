function randomizeImages() {
	const $images = $('.js-randomize-images li');
	const imagesLength = $images.length;
	const className = 'is-visible';

	if ($images.length > 3) {
		let indices = [];

		while (indices.length < 3) {
			let randomIndex = Math.floor(Math.random() * $images.length);

			if (!indices.includes(randomIndex)) {
				indices.push(randomIndex);
			}
		}
		
		indices.forEach(function(index) {
			$images.eq(index).addClass(className);
		});
	} else {
		$images.addClass(className);
	}
}

randomizeImages();