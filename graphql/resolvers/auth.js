const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  users: async (args, req) => {
    if (!req.isAuth) throw new Error('Unauthenticated');
    const users = await User.find();

    return users.map((user) => ({ ...user._doc, password: null }));
  },

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
      throw new Error(error);
    }
  },

  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user) throw 'Incorrect email / password';

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) throw 'Incorrect email / password';

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );

      return { userId: user.id, token, tokenExpiration: 1 };
    } catch (error) {
      throw new Error(error);
    }
  },
};
