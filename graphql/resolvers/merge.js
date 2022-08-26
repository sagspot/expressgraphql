const DataLoader = require('dataloader');
const { dateToString } = require('../../helpers/date');
const Event = require('../../models/event');
const User = require('../../models/user');

const eventLoader = new DataLoader((eventIds) => events(eventIds));
const userLoader = new DataLoader((userIds) =>
  User.find({ _id: { $in: userIds } })
);

const events = async (eventIds) => {
  try {
    const events = await Event.find({ id: { $in: eventIds } });
    events.sort(
      (a, b) =>
        eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString())
    );

    return events.map((event) => transformEvent(event));
  } catch (error) {
    throw error;
  }
};

const singleEvent = async (eventId) => {
  try {
    // const event = await Event.findById(eventId);
    const event = await eventLoader.load(eventId.toString());
    // return transformEvent(event);
    return event;
  } catch (error) {
    throw error;
  }
};

const user = async (userId) => {
  try {
    // const user = await User.findById(userId);
    const user = await userLoader.load(userId.toString());
    return {
      ...user._doc,
      password: null,
      // createdEvents: events.bind(this, user.createdEvents),
      createdEvents: () => eventLoader.loadMany(user.createdEvents),
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
