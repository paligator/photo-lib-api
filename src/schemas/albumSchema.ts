import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
    albums: [Album!]
    album(id: ID, name: String): Album
  }

  type Album {
    id: ID!
    continent: String
    year: Int!
    month: Int!
    name: String!
    path: String!
    favourites: [String]
    files: [String]
    countries: [String]
  }
`;