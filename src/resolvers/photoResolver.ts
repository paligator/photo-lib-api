import { PhotoService } from "../service/photoService";
import { doAuthorization } from "../helpers/authorization";
import { UserRoles } from "../helpers/enums";

export default {
	Query: {

	},

	Mutation: {
		setPhotoFavourite: async (parent: any, { albumId, photoName, status }: any, context: any) => {
			doAuthorization(context, UserRoles.Editor, "Mutation.setPhotoFavourite");
			return await PhotoService.setPhotoFavourite(albumId, photoName, status);
		},
	}
};