import { gql } from "apollo-server-express";

export default gql`
  extend type Mutation {
    setPhotoTags(albumId: ID!, photoName: String!, addTags: [String], removeTags: [String]): Boolean
    addPhotoComment(albumId: ID!, photoName: String!, comment: String!): ID
    deletePhotoComment(albumId: ID!, photoName: String!, commentId: ID!): Boolean
  }

  extend type Query {
    photo(albumId: ID!, photoName: String!): Photo
    photosByTags(albumName: String!, tags: [String]): [TagPhotoGroup]
  }

  type Photo {
    tags: [String]
    comments: [Comment]
	}	

  type Comment {
    _id: ID!
    username: String!
    userEmail: String!
    comment: String! @constraint(maxLength: 300)
    createDate: DateTime!
  }

  type TagPhotoGroup {
    tag: String,
    photos: [String],
  }

`;