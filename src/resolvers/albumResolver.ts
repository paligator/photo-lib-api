import { PhotoService } from "../service";
import { doAuthorization } from "../helpers/authorization";
import { UserRoles } from "../helpers/enums";

export default {
	Query: {
		albums: async (parent: any, args: any, context: any) => {
			doAuthorization(context, UserRoles.Guest, "Query.albums");
			return await PhotoService.getAlbums();
		},
		album: async (parent: any, { id, name }: any, context: any) => {
			doAuthorization(context, UserRoles.Guest, "Query.album");
			return await PhotoService.getAlbum(id, name);
		}
	},
};