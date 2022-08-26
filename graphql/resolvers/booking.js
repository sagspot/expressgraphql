const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { user, transformBooking } = require('./merge');

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map((booking) => transformBooking(booking));
    } catch (error) {
      throw error;
    }
  },

  bookEvent: async (args) => {
    const fetchedEvent = await Event.findById(args.eventId);
    const booking = await Booking.create({
      user: '6307ef81c7b4338b167398ea',
      event: fetchedEvent,
    });

    return transformBooking(booking);
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
};
