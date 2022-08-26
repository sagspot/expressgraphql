const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
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

const singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return {
      ...event._doc,
      date: new Date(event.date).toISOString(),
      creator: user.bind(this, event.creator),
    };
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

  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map((booking) => ({
        ...booking._doc,
        user: user.bind(this, booking.user),
        event: singleEvent.bind(this, booking.event),
        createdAt: new Date(booking.createdAt).toISOString(),
        updatedAt: new Date(booking.updatedAt).toISOString(),
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

  bookEvent: async (args) => {
    const fetchedEvent = await Event.findById(args.eventId);
    const booking = await Booking.create({
      user: '6307ef81c7b4338b167398ea',
      event: fetchedEvent,
    });

    return {
      ...booking._doc,
      user: user.bind(this, booking.user),
      event: singleEvent.bind(this, booking.event),
      createdAt: new Date(booking.createdAt).toISOString(),
      updatedAt: new Date(booking.updatedAt).toISOString(),
    };
  },

  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = {
        ...booking.event._doc,
        creator: user.bind(this, booking.event.creator),
      };
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (error) {
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
