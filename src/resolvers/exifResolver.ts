import { PhotoService } from "../service/photoService";
import { doAuthorization } from "../helpers/authorization";
import { UserRoles } from "../helpers/enums";

export default {
	Query: {
		exif: async (parent: any, { albumId, photoName }: any, context: any) => {
			doAuthorization(context, UserRoles.Guest, "Query.exif");
			return await PhotoService.getExifInfo(albumId, photoName);
		},
	}
};