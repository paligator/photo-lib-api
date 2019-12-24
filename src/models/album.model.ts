import mongoose, { Schema, Document } from "mongoose";

export interface IAlbum extends Document {
	continent: string;
	year: number;
	month: number;
	name: string;
	path: string;
	//FIXME: Do I really neeed files?
	files: string[];
	photos: IPhoto[];
}

export interface IPhoto {
	name: string;
	tags: string[];
	comments: IComment[];
}

export interface IComment {
	username: string;
	userEmail: string;
	// createDate: Date;
	// modifyDate: Date;
	comment: string;
}

export const AlbumSchema = new Schema({
	continent: { type: String, required: true, max: 20 },
	year: { type: Number, required: true },
	month: { type: Number, required: true },
	name: { type: String, unique: true, index: true, required: true, max: 50 },
	path: { type: String, required: true, max: 350 },
	countries: { type: Array },
	photos: [
		{
			_id: false,
			name: { type: String, unique: true, index: true },
			tags: [],
			comments: [
				{
					_id: false,
					username: { type: String, required: true },
					userEmail: { type: String, required: true },
					// createDate: { type: Date, required: false, default: moment() },
					// modifyDate: { type: Date },
					comment: { type: String, required: true, max: 300 }
				}
			],
		}
	]
}, { timestamps: true });

//module.exports = mongoose.model("Albums", AlbumSchema);
const Album = mongoose.model<IAlbum>("Album", AlbumSchema);

export default Album;
