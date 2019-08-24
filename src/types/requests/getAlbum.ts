
import { Schema } from "mongoose";

interface GetAlbumReq {

	_id: { type: Schema.Types.ObjectId; required: true };
	b?: number;
}
