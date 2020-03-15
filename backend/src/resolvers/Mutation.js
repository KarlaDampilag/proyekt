const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

const Mutations = {
  async signUp(parent, args, ctx, info) {
    // check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords don't match");
    }

    // lowercase their email
    args.email = args.email.toLowerCase();

    // hash their password
    const password = await bcrypt.hash(args.password, 10);

    // 2. Set a reset token and expiry on that user
    const randomBytesPromiseified = promisify(randomBytes);
    const confirmEmailToken = (await randomBytesPromiseified(20)).toString('hex');

    // create the user in the database
    const user = await ctx.db.mutation.createUser({
      data: {
        email: args.email,
        password,
        role: 'owner',
        verified: false,
        confirmEmailToken
      },
    }, info);

    // create the JWT token for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    // We set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });

    // email them that reset token
    const mailResponse = await transport.sendMail({
      from: 'karla.dmplg@gmail.com', // TODO change this on prod
      to: user.email,
      subject: 'Confirm your email',
      html: makeANiceEmail(
        `Please confirm your email by clicking on the link: \n\n
        <a href="${process.env.FRONTEND_URL}/confirmEmail?confirmEmailToken=${confirmEmailToken}&email=${args.email}">Click here to confirm your email</a>`
      )
    });

    // return the user to the browser
    return user;
  },

  async confirmEmail(parent, args, ctx, info) {
    const [user] = await ctx.db.query.users({
      where: {
        email: args.email
      }
    });

    if (!user) {
      throw new Error('User not found.');
    }

    if (user.verified) {
      return user;
    }
    if (user.confirmEmailToken != args.confirmEmailToken) {
      throw new Error('Verification token is invalid.');
    }

    //  save the new password to the user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        confirmEmailToken: null,
        verified: true
      },
    });

    // generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);

    // set the JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    // return the new user
    return updatedUser;
  },

  signOut(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },

  async signIn(parent, { email, password }, ctx, info) {
    // 1. check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. Check if their password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid Password!');
    }
    // 3. generate the JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. Set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    // 5. Return the user
    return user;
  },

  // async createItem(parent, args, ctx, info) {
  //   if (!ctx.request.userId) {
  //     throw new Error('You must be logged in to do that.');
  //   }

  //   const item = await ctx.db.mutation.createItem({
  //     data: {
  //       // create a relationship between the item and the user
  //       user: {
  //         connect: {
  //           id: ctx.request.userId
  //         }
  //       },
  //       ...args
  //     }
  //   }, info);

  //   return item;
  // },

  // updateItem(parent, args, ctx, info) {
  //   // first take a copy of the updates
  //   const updates = { ...args };

  //   // remove id from the updates so it won't get updated
  //   delete updates.id

  //   return ctx.db.mutation.updateItem({
  //     data: updates,
  //     where: {
  //       id: args.id
  //     }
  //   }, info);
  // },

  // async deleteItem(parent, args, ctx, info) {
  //   const where = { id: args.id };

  //   // find the item
  //   const item = await ctx.db.query.item({ where }, `{ id title user { id } }`);

  //   // check if user owns item, or if they have permissions
  //   const ownsItem = item.user.id == ctx.request.userId;
  //   const hasPermissions = ctx.request.user.permissions.some(permission => (
  //     ['ADMIN','ITEMDELETE'].includes(permission)
  //   ));

  //   if (!ownsItem && !hasPermissions) {
  //     throw new Error("You don't have the required permissions to perform this action.")
  //   }

  //   // delete item
  //   return ctx.db.mutation.deleteItem({ where }, info);
  // },

  // async requestReset(parent, args, ctx, info) {
  //   // 1. Check if this is a real user
  //   const user = await ctx.db.query.user({ where: { email: args.email } });
  //   if (!user) {
  //     throw new Error(`No such user found for email ${args.email}`);
  //   }
  //   // 2. Set a reset token and expiry on that user
  //   const randomBytesPromiseified = promisify(randomBytes);
  //   const resetToken = (await randomBytesPromiseified(20)).toString('hex');
  //   const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
  //   const res = await ctx.db.mutation.updateUser({
  //     where: { email: args.email },
  //     data: { resetToken, resetTokenExpiry },
  //   });

  //   // 3. Email them that reset token
  //   const mailResponse = await transport.sendMail({
  //     from: 'karla.dmplg@gmail.com', // TODO change this on prod
  //     to: user.email,
  //     subject: 'Your password reset token',
  //     html: makeANiceEmail(
  //       `Your password reset token is here \n\n
  //       <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to reset</a>`
  //     )
  //   });

  //   return { message: 'Thanks!' };
  // },

  // async resetPassword(parent, args, ctx, info) {
  //   // 1. check if the passwords match
  //   if (args.password !== args.confirmPassword) {
  //     throw new Error("Yo Passwords don't match!");
  //   }
  //   // 2. check if its a legit reset token
  //   // 3. Check if its expired
  //   const [user] = await ctx.db.query.users({
  //     where: {
  //       resetToken: args.resetToken,
  //       resetTokenExpiry_gte: Date.now() - 3600000,
  //     },
  //   });
  //   if (!user) {
  //     throw new Error('This token is either invalid or expired!');
  //   }
  //   // 4. Hash their new password
  //   const password = await bcrypt.hash(args.password, 10);
  //   // 5. Save the new password to the user and remove old resetToken fields
  //   const updatedUser = await ctx.db.mutation.updateUser({
  //     where: { email: user.email },
  //     data: {
  //       password,
  //       resetToken: null,
  //       resetTokenExpiry: null,
  //     },
  //   });
  //   // 6. Generate JWT
  //   const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
  //   // 7. Set the JWT cookie
  //   ctx.response.cookie('token', token, {
  //     httpOnly: true,
  //     maxAge: 1000 * 60 * 60 * 24 * 365,
  //   });
  //   // 8. return the new user
  //   return updatedUser;
  // },

  // async updatePermissions(parent, args, ctx, info) {
  //   // check if logged in
  //   if (!ctx.request.userId) {
  //     throw new Error('You must be logged in to do that.');
  //   }
  //   // query the current user
  //   const currentUser = await ctx.db.query.user({
  //     where: { id: ctx.request.userId  }
  //   }, info);
  //   // check if user has permissions to do this
  //   hasPermission(ctx.request.user, ['ADMIN','PERMISSIONUPDATE']);
  //   // update the permissions
  //   return ctx.db.mutation.updateUser({
  //     data: {
  //       permissions: { set: args.permissions }
  //     },
  //     where: { id: args.userId }
  //   }, info);
  // },

  // async addToCart(parent, args, ctx, info) {
  //   // check if signed in
  //   if (!ctx.request.userId) {
  //     throw new Error('You must be logged in to do that.');
  //   }

  //   // query the user's current cart
  //   const [existingCartItem] = await ctx.db.query.cartItems({
  //     where: {
  //       user: { id: ctx.request.userId },
  //       item: { id: args.id }
  //     }
  //   });

  //   // check if the item is already in their cart, increment by 1 if it is
  //   if (existingCartItem) {
  //     return ctx.db.mutation.updateCartItem({
  //       where: { id: existingCartItem.id },
  //       data: { quantity: existingCartItem.quantity + 1 }
  //     }, info);
  //   }

  //   // if not, create a new cart item for user
  //   return ctx.db.mutation.createCartItem({
  //     data: {
  //       user: {
  //         connect: { id: ctx.request.userId },
  //       },
  //       item: {
  //         connect: { id: args.id }
  //       }
  //     }
  //   }, info);
  // },

  // async removeFromCart(parent, args, ctx, info) {
  //   // find the cart item
  //   const cartItem = await ctx.db.query.cartItem({
  //     where: { id: args.id }
  //   }, `{ id, user { id } }`);

  //   // make sure we found an item
  //   if (!cartItem) {
  //     throw new Error('No cart item found.')
  //   }

  //   // make sure they own that cart item
  //   if (cartItem.user.id != ctx.request.userId) {
  //     throw new Error('You do not own this cart item.')
  //   }

  //   // delete that cart item
  //   return ctx.db.mutation.deleteCartItem({
  //     where: { id: args.id }
  //   }, info);
  // },

  // async createOrder(parent, args, ctx, info) {
  //   // query the current user and make sure they are signed in
  //   const userId = ctx.request.userId;
  //   if (!userId) {
  //     throw new Error('You must be signed in to complete this order.');
  //   }
  //   const user = await ctx.db.query.user({ where: { id: userId } },
  //     `{ id name email cart { id quantity item { id title price description image } } }`
  //   );
  //   // re-calculate the total for the price
  //   const amount = user.cart.reduce((tally, cartItem) => tally + cartItem.item.price * cartItem.quantity, 0);
  //   // create the stripe charge (turn token into money)
  //   const charge = await stripe.charges.create({
  //     amount: amount,
  //     currency: 'USD',
  //     source: args.token
  //   });
  //   // convert the cart items to order items
  //   const orderItems = user.cart.map(cartItem => {
  //     const orderItem = {
  //       ...cartItem.item,
  //       quantity: cartItem.quantity,
  //       user: { connect: { id: userId } }

  //     };
  //     delete orderItem.id;
  //     return orderItem;
  //   });
  //   // create the order
  //   const order = await ctx.db.mutation.createOrder({
  //     data: {
  //       total: charge.amount,
  //       charge: charge.id,
  //       items: { create: orderItems },
  //       user: { connect: { id: userId } }
  //     }
  //   });
  //   // clear the user's cart and delete cart items in db
  //   const cartItemIds = user.cart.map(cartItem => cartItem.id);
  //   await ctx.db.mutation.deleteManyCartItems({ where: { id_in: cartItemIds }});
  //   // return the order to the client
  //   return order;
  // }
};

module.exports = Mutations;
