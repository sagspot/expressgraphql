const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const connectDB = require('./config/db');
const Event = require('./models/event');
const User = require('./models/user');
const bcrypt = require('bcryptjs');

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

      type User {
        _id: ID!
        email: String!
        password: String
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input UserInput {
        email: String!
        password: String!
      }
    
      type RootQuery {
        events: [Event!]!
        users: [User!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
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

      createEvent: async (args) => {
        try {
          const event = await Event.create({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '6307ef81c7b4338b167398ea',
          });

          const user = await User.findById('6307ef81c7b4338b167398ea');
          if (!user) throw new Error('User not found');

          user.createdEvents.push(event.id);
          await user.save();

          return event;
        } catch (error) {
          console.log(`[error]: ${error}`);
          throw error;
        }
      },

      createUser: async (args) => {
        try {
          const user = await User.findOne({ email: args.userInput.email });
          if (user) throw new Error('User exists already');

          const createdUser = await User.create({
            email: args.userInput.email,
            password: await bcrypt.hash(args.userInput.password, 10),
          });

          return { ...createdUser._doc, password: null };
        } catch (error) {
          console.log(`[error]: ${error}`);
          throw error;
        }
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
