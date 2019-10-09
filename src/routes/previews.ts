import { Path, POST, QueryParam, Security } from "typescript-rest";
import * as fs from "../helpers/fs";
import * as C from "../helpers/common";
import config from "config";
import path from "path";
import sharp from "sharp";
import { resizePhoto } from "../helpers/photoUtils";
import { UserRoles } from "../helpers/enums";
import { AlbumService, GeneratePrevsService } from "../service";
import { IAlbum } from "../models/album.model";

@Path("/preview")
class PreviewRoute {

	@Path("generate")
	@POST
	@Security(UserRoles.Admin)
	public async generateAlbumPreviews(@QueryParam("id") albumId: string, @QueryParam("recreate") recreate: boolean): Promise<any> {

		C.logI(`generateAlbumPreviews for albumId ${albumId}`);

		const album = await AlbumService.getAlbum(albumId, false);
		await GeneratePrevsService.generateAlbumPreviews(album, recreate);

	}

	@Path("generate/all")
	@POST
	@Security(UserRoles.Admin)
	public async generateAllAlbumPreviews(@QueryParam("recreate") recreate: boolean): Promise<any> {

		C.logI("generateAlbumPreviews START for all albums");

		const albums = await AlbumService.getAlbums();
		// albums.forEach(async (album: IAlbum) => {
		// 	await GeneratePrevsService.generateAlbumPreviews(album, recreate);
		// });

		for (var i = 0; i < albums.length; i++) {
			await GeneratePrevsService.generateAlbumPreviews(albums[i], recreate);
		}

		C.logI("generateAlbumPreviews FINISHED for all albums");

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

			//first must generate thumb then prev, because there is a problem, 
			//I want generate thumbs without metadata(exif), but as i keep the same instance of sharp and call method withMetadata than metadata are in thumb too 
			if (!thumbPathExists) {
				const status = await resizePhoto(file, image, thumbPath, false, 150, 100);
				if (status !== "success") { /* TODO: I shoul'd do something */ }
			}

			if (!prevPathExists) {
				const status = await resizePhoto(file, image, prevPath, true, 1920, 1080);
				if (status !== "success") { /* TODO: I should do something */ }
			}

			C.logD(`${file} prews generated`);

		} catch (e) {
			C.logE(`${file} previews there was en error to generate previews`, e);
		}
	}
}


export default PreviewRoute;
