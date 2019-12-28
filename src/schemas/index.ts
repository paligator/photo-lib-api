import { gql } from "apollo-server-express";
import albumSchema from "./albumSchema";
import exifSchema from "./exifSchema";
import photoSchema from "./photoSchema";

const linkSchema = gql`
  
  directive @constraint(
    maxLength: Int
  ) on FIELD_DEFINITION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

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