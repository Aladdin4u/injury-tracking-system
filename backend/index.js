const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError, GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");

let reports = [
  {
    id: "3d599471-3436-11e9-bc57-8b80ba54c431",
    name: "Venla Ruuska",
    date: "10/18/2023",
    bodyMap: [
      { id: "1", label: 1, details: "Left Hand" },
      { id: "2", label: 2, details: "Left Foot" },
    ],
  },
  {
    id: "3d594650-3436-11e9-bc57-8b80ba54c431",
    name: "Arto Hellas",
    date: "10/16/2023",
    bodyMap: [
      { id: "1", label: 1, details: "right Hand" },
      { id: "2", label: 2, details: "left Foot" },
    ],
  },
  {
    id: "3d599470-3436-11e9-bc57-8b80ba54c431",
    name: "Matti Luukkainen",
    date: "10/17/2023",
    bodyMap: [
      { id: "1", label: 1, details: "Left Leg" },
      { id: "2", label: 2, details: "Left Arm" },
    ],
  },
];

const typeDefs = `
    scalar Date

    type User {
      id: ID!
      username: String!
      email: String!
      reports: [InjuryReport!]!
    }

    type InjuryReport {
      name: String!
      date: Date!
      bodyMap: [BodyMapArea!]!
      id: ID!
    }

    type BodyMapArea {
      id: ID!
      label: Int!
      details: String!
    }

    input BodyMapInput {
      id: ID!
      label: Int!
      details: String!
    }
  
    type Query {
      user(id: ID!): User
      injuryReport(id: ID!): InjuryReport
      allreports(name: String, date: String): [InjuryReport!]!
    }
    
    type Mutation {
      addReport(
        name: String!
        date: Date!
        bodyMap: [BodyMapInput!]!
      ): InjuryReport!
      editReport(
        name: String!
        date: Date!
        bodyMap: [BodyMapInput!]!
      ): InjuryReport!
      deleteReport( 
        id: ID! 
      ): InjuryReport!
    }
`;

const resolvers = {
  Query: {
    allreports: (root, args) => {
      if (!args.name && !args.date) {
        return reports;
      }
      if (args.name && args.date) {
        const findNameDate = reports.filter(
          (r) => r.name === args.name && r.date === args.date
        );
        return findNameDate;
      }
      if (args.name) {
        const findName = reports.filter((r) => r.name === args.name);
        return findName;
      }
      if (args.date) {
        const findDate = reports.filter((r) => r.date === args.date);
        return findDate;
      }
    },
  },
  Mutation: {
    addReport: (root, args) => {
      if (reports.find((r) => r.id == args.id)) {
        throw new GraphQLError("Id must be unique", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.id,
          },
        });
      }

      const report = { ...args, id: reports.length + 1 };
      reports = reports.concat(report);
      return report;
    },
    editReport: (root, args) => {
      const report = reports.find((r) => r.id == args.id);
      if (!report) {
        return null;
      }

      const editedReport = {
        ...report,
        name: args.name,
        date: args.date,
        bodyMap: args.bodyMap,
      };
      reports = reports.map((r) => (r.id == args.id ? editedReport : r));
      return editedReport;
    },
    deleteReport: (root, args) => {
      const report = reports.find((r) => r.id == args.id);
      if (!report) {
        return null;
      }

      reports = reports.filter((r) => r.id != report.id);
      return report;
    },
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
