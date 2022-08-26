const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');
const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();

      return events.map((event) => transformEvent(event));
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
        date: dateToString(args.eventInput),
        creator: '6307ef81c7b4338b167398ea',
      });

      const currUser = await User.findById('6307ef81c7b4338b167398ea');
      if (!currUser) throw 'User not found';

      currUser.createdEvents.push(event.id);
      await currUser.save();

      return transformEvent(event);
    } catch (error) {
      console.log(`[error]: ${error}`);
      throw error;
    }
  },
};
