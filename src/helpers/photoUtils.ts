import sharp, { } from "sharp";
import * as C from "./common";

function resizePhoto(image: sharp.Sharp, outPath: string, width: number, height: number) {

	return new Promise((resolve, reject): void => {

		image
			.resize(null, null, { width, height, fit: sharp.fit.inside })
			.rotate()
			.toFile(outPath)
			.then((): void => {
				resolve("success");
			}).catch(e => {
				C.logE(`Error resize image ${image.options.input.file} : `, e);
				resolve("error");
			}
			);
	});
}

export {
	resizePhoto
};