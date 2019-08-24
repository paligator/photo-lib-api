import sharp, { } from "sharp";

function resizePhoto(image: sharp.Sharp, outPath: string, width: number, height: number) {

	return new Promise((resolve): void => {

		image
			.resize(null, null, { width, height, fit: sharp.fit.inside })
			.rotate()
			.toFile(outPath)
			.then((): void => {
				resolve();
			});
	});
}

export {
	resizePhoto
};