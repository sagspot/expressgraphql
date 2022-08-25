const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

const events = [];

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
      events: () => events,

      createEvent: (args, sags) => {
        const event = {
          _id: Math.random().toString(),
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date().toISOString(),
        };
        events.push(event);
        return event;
      },
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
