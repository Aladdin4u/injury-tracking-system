const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQlError, GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");

let reports = [
  {
    name: "Arto Hellas",
    date: "10/16/2023",
    bodymap: "left hand",
    details: "my left hand got hurt",
    id: "3d594650-3436-11e9-bc57-8b80ba54c431",
  },
  {
    name: "Matti Luukkainen",
    date: "10/17/2023",
    bodymap: "right hand",
    details: "my right hand got hurt",
    id: "3d599470-3436-11e9-bc57-8b80ba54c431",
  },
  {
    name: "Venla Ruuska",
    date: "10/18/2023",
    bodymap: "left leg",
    details: "my left leg got hurt",
    id: "3d599471-3436-11e9-bc57-8b80ba54c431",
  },
];

const typeDefs = `
    scalar Date

    type Report {
      name: String!
      date: Date!
      bodymap: String! 
      details: String! 
      id: ID!
    }
  
    type Query {
      ReportCount: Int!
      allreports: [Report!]!
      findReport(name: String!): Report
    }

    type Mutation {
      addReport(
        name: String!
        date: Date!
        bodymap: String! 
        details: String! 
        id: ID! 
      ): Report
      editReport(
        name: String!
        date: Date!
        bodymap: String!
        details: String! 
        id: ID! 
      ): Report
    }
`;

const resolvers = {
  Query: {
    ReportCount: () => reports.length,
    allreports: () => reports,
    findReport: (root, args) => reports.find((r) => r.name === args.name),
  },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return new Date(value).toDateString(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return ast.value; // ast value is always in string format
      }
      return null;
    },
  }),
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 400 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
