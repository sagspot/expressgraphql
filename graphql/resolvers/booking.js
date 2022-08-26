const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { user, transformBooking } = require('./merge');

module.exports = {
  bookings: async (args, req) => {
    try {
      if (!req.isAuth) throw 'Unauthenticated';

      const bookings = await Booking.find();
      return bookings.map((booking) => transformBooking(booking));
    } catch (error) {
      throw new Error(error);
    }
  },

  bookEvent: async (args, req) => {
    try {
      if (!req.isAuth) throw 'Unauthenticated';

      const fetchedEvent = await Event.findById(args.eventId);
      const booking = await Booking.create({
        user: req.userId,
        event: fetchedEvent,
      });

      return transformBooking(booking);
    } catch (error) {
      throw new Error(error);
    }
  },

  cancelBooking: async (args, req) => {
    try {
      if (!req.isAuth) throw 'Unauthenticated';

      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = {
        ...booking.event._doc,
        creator: user.bind(this, booking.event.creator),
      };
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (error) {
      throw new Error(error);
    }
  },
};
