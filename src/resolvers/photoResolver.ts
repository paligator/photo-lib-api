import { PhotoService } from "../service";
import { doAuthorization } from "../helpers/authorization";
import { UserRoles } from "../helpers/enums";

export default {
	Query: {
		photo: async (parent: any, { albumId, photoName }: any, context: any) => {
			doAuthorization(context, UserRoles.Guest, "Query.photo");
			return await PhotoService.getPhotoDetails(albumId, photoName);
		},
		photosByTags: async (parent: any, { albumName, tags }: any, context: any) => {
			doAuthorization(context, UserRoles.Guest, "Query.photosByTags");
			return await PhotoService.getPhotosByTags(albumName, tags);
		},
	},

	Mutation: {
		setPhotoTags: async (parent: any, { albumId, photoName, addTags, removeTags }: any, context: any) => {
			doAuthorization(context, UserRoles.Editor, "Mutation.setPhotoTags");
			return await PhotoService.setPhotoTags(albumId, photoName, addTags, removeTags);
		},
		addPhotoComment: async (parent: any, { albumId, photoName, comment }: any, context: any) => {
			doAuthorization(context, UserRoles.Editor, "Mutation.addPhotoComment");
			return await PhotoService.addPhotoComment(context, albumId, photoName, comment);
		},
	}
};