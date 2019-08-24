import { gql } from "apollo-server-express";

export default gql`
  extend type Query {
     me: User
     serverTime: String
  }
  type User {
     id: ID!
     username: String!
  }
`;