import { gql } from "apollo-server-express";

export default gql`
  extend type Mutation {
    setPhotoTags(albumId: ID!, photoName: String!, addTags: [String], removeTags: [String]): Boolean
  }

  extend type Query {
    photo(albumId: ID!, photoName: String!): Photo
    photosByTags(albumName: String!, tags: [String]): [String]
  }

  type Photo {
    tags: [String]
	}	
`;