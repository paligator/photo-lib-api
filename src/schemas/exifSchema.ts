import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    exif(albumId: ID!, photoName: String!): Exif
  }

  type Exif {
    createDate: DateTime
    orientation: String
    camera: String
	}	
`;