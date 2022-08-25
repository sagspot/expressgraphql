const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const connectDB = require('./config/db');
const Event = require('./models/event');
require('dotenv').config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input EventInput {
        title:String!
        description:String!
        price:Float!
        date:String!
      }
    
      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: () =>
        Event.find().catch((error) => {
          console.log(`[error]: ${error}`);
          throw error;
        }),

      createEvent: (args) =>
        Event.create({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
        }).catch((error) => {
          console.log(`[error]: ${error}`);
          throw error;
        }),
    },
    graphiql: process.env.NODE_ENV !== 'production',
  })
);

const PORT = process.env.PORT || 8000;

(async () => {
  try {
    await connectDB();

    app.listen(PORT, () =>
      console.log(
        `[server]: Server is listening on http://localhost:${PORT}/graphql`
      )
    );
  } catch (error) {
    console.error(`[error]: ${error}`);
    process.exit(1);
  }
})();
