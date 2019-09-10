import { Path, POST, QueryParam, Security } from "typescript-rest";
import * as fs from "../helpers/fs";
import * as C from "../helpers/common";
import config from "config";
import path from "path";
import sharp from "sharp";
import { resizePhoto } from "../helpers/photoUtils";
import { UserRoles } from "../helpers/enums";
import { PhotoService } from "../service";

@Path("/preview")
class PreviewRoute {

	@Path("generate")
	@POST
	@Security(UserRoles.Admin)
	public async generateAlbumPreviews(@QueryParam("id") albumId: string): Promise<any> {

		try {

			C.logI(`generateAlbumPreviews for albumId ${albumId}`);

			const album = await PhotoService.getAlbum(albumId, true);
			const folder = path.join(config.get("paths.photoFolder"), album.path);
			const filesForPrew = await fs.getImages(folder);
			const prevFolder = path.join(folder, "prevs");
			const thumbFolder = path.join(folder, "thumbs");

			fs.mkdir(prevFolder);
			fs.mkdir(thumbFolder);

			const startTime = new Date().getTime();

			//genereate prew in groups of several images, becuase I don't want run it paralel for all images
			const filesCount = filesForPrew.length;
			const paralelPromises = 10;
			for (let i = 0; i < filesCount; i += paralelPromises) {
				const nextGroup = filesForPrew.slice(i, i + paralelPromises);
				await this.generatePreviewsForGroup(nextGroup, folder, prevFolder, thumbFolder);
				C.logI(`${i + 1}-${i + nextGroup.length}/${filesCount} previews are finished.`);
			}

			C.logI(`finished in ${(new Date().getTime() - startTime) / 1000} seconds`);

			return C.sendData();
		} catch (err) {
			throw new C.PhotoError("Error generate preview", err);
		}
	}

	private async generatePreviewsForGroup(list: any[], folder: string, prevFolder: string, thumbFolder: string): Promise<any> {
		await Promise.all(
			list.map(async (file: string) => {
				await this.generatePhotoPreviews(file, folder, prevFolder, thumbFolder);
			})
		);
	}

	private async generatePhotoPreviews(file: string, folder: string, prevFolder: string, thumbFolder: string) {

		try {
			const imageUrl = path.join(folder, file);
			const prevPath = path.join(prevFolder, file);
			const thumbPath = path.join(thumbFolder, file);
			const prevPathExists = fs.exists(prevPath);
			const thumbPathExists = fs.exists(thumbPath);

			if (prevPathExists && thumbPathExists) {
				return;
			}

			const image = sharp(imageUrl);

			if (!prevPathExists) {
				const status = await resizePhoto(file, image, prevPath, 1920, 1080);
				if (status !== "success") { /* TODO: I should do something */ }
			}

			if (!thumbPathExists) {
				const status = await resizePhoto(file, image, thumbPath, 150, 100);
				if (status !== "success") { /* TODO: I shoul'd do something */ }
			}

			C.logD(`${file} prews generated`);

		} catch (e) {
			C.logE(`${file} previews there was en error to generate previews`, e);
		}
	}
}


export default PreviewRoute;
