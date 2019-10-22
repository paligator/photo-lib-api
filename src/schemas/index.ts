import { gql } from "apollo-server-express";
import albumSchema from "./albumSchema";
import exifSchema from "./exifSchema";
import photoSchema from "./photoSchema";

const linkSchema = gql`
  
  # Without this in schema type DateTime couldn't be used
  scalar DateTime

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }  

`;

export default [linkSchema, albumSchema, exifSchema, photoSchema];