const { dateToString } = require('../../helpers/date');
const Event = require('../../models/event');
const User = require('../../models/user');

const events = async (eventIds) => {
  try {
    const events = await Event.find({ id: { $in: eventIds } });

    return events.map((event) => transformEvent(event));
  } catch (error) {
    throw error;
  }
};

const singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
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

const transformEvent = (event) => ({
  ...event._doc,
  date: dateToString(event.date),
  creator: user.bind(this, event.creator),
});

const transformBooking = (booking) => ({
  ...booking._doc,
  user: user.bind(this, booking.user),
  event: singleEvent.bind(this, booking.event),
  createdAt: dateToString(booking.createdAt),
  updatedAt: dateToString(booking.updatedAt),
});

// exports.events = events;
// exports.singleEvent = singleEvent;
exports.user = user;
exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
