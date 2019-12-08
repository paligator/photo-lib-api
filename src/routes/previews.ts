import { Path, POST, QueryParam, Security } from "typescript-rest";
import * as C from "../helpers/common";
import { UserRoles } from "../helpers/enums";
import { AlbumService, GeneratePrevsService } from "../service";

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

		for (let i = 0; i < albums.length; i++) {
			await GeneratePrevsService.generateAlbumPreviews(albums[i], recreate);
		}

		C.logI("generateAlbumPreviews FINISHED for all albums");

	}

}


export default PreviewRoute;
