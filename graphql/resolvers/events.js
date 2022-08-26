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
      throw new Error(error);
    }
  },

  createEvent: async (args, req) => {
    try {
      if (!req.isAuth) throw 'Unauthenticated';

      const event = await Event.create({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: dateToString(args.eventInput.date),
        creator: req.userId,
      });

      const creator = await User.findById(req.userId);
      if (!creator) throw 'User not found';

      creator.createdEvents.push(event.id);
      await creator.save();

      return transformEvent(event);
    } catch (error) {
      throw new Error(error);
    }
  },
};
