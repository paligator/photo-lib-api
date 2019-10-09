import { AlbumService } from "../service";
import { doAuthorization } from "../helpers/authorization";
import { UserRoles } from "../helpers/enums";

export default {
	Query: {
		albums: async (parent: any, args: any, context: any) => {
			doAuthorization(context, UserRoles.Guest, "Query.albums");
			return await AlbumService.getAlbums();
		},
		album: async (parent: any, { id, name }: any, context: any) => {
			doAuthorization(context, UserRoles.Guest, "Query.album");
			if (id) {
				return await AlbumService.getAlbum(id, true);
			} else {
				return await AlbumService.getAlbumByName(name, true);
			}
		}
	},
};