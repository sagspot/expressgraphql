const User = require('../../models/user');
const bcrypt = require('bcryptjs');

module.exports = {
  users: (async) => User.find(),

  createUser: async (args) => {
    try {
      const user = await User.findOne({ email: args.userInput.email });
      if (user) throw 'User exists already';

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
