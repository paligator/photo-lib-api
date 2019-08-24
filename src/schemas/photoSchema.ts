import { gql } from "apollo-server-express";

export default gql`
  extend type Mutation {
    setPhotoFavourite(albumId: ID!, photoName: String!, status: Boolean!): Boolean
  }

  type Photo {
    isFavourite: Boolean
	}	
`;