const Event = require('../../models/event');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

const events = async (eventIds) => {
  try {
    const events = await Event.find({ id: { $in: eventIds } });

    return events.map((event) => ({
      ...event._doc,
      date: new Date(event.date).toISOString(),
      creator: user.bind(this, event.creator),
    }));
  } catch (error) {
    throw error;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      password: null,
      createdEvents: events.bind(this, user.createdEvents),
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();

      return events.map((event) => ({
        ...event._doc,
        date: new Date(event.date).toISOString(),
        creator: user.bind(this, event.creator),
      }));
    } catch (error) {
      throw error;
    }
  },

  createEvent: async (args) => {
    try {
      const event = await Event.create({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: '6307ef81c7b4338b167398ea',
      });

      const currUser = await User.findById('6307ef81c7b4338b167398ea');
      if (!currUser) throw new Error('User not found');

      currUser.createdEvents.push(event.id);
      await currUser.save();

      return {
        ...event._doc,
        date: new Date(event.date).toISOString(),
        creator: user.bind(this, event.creator),
      };
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
      throw error;
    }
  },
};
