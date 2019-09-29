import sharp, { } from "sharp";
import * as C from "./common";

function resizePhoto(imageName: string, photo: sharp.Sharp, outPath: string, keepMetadata: boolean, width: number, height: number) {

	return new Promise((resolve): void => {

		//TODO really?, there isn't better way how to do it, so much duplicates
		if (keepMetadata === true) {
			photo
				.withMetadata()
				.resize(null, null, { width, height, fit: sharp.fit.inside })
				.rotate()
				.toFile(outPath)
				.then((): void => {
					resolve("success");
				}).catch(e => {
					C.logE(`Error resize image ${imageName} : `, e);
					resolve("error");
				}
				);
		} else {
			photo
				.resize(null, null, { width, height, fit: sharp.fit.inside })
				.rotate()
				.toFile(outPath)
				.then((): void => {
					resolve("success");
				}).catch(e => {
					C.logE(`Error resize image ${imageName} : `, e);
					resolve("error");
				}
				);
		}

	});
}

export {
	resizePhoto
};