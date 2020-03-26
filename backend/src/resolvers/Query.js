const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  // products: forwardTo('db'),
  // categories: forwardTo('db'),
  productsConnection: forwardTo('db'),
  products(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that.'); // TODO only return products that belong to the user
    }
    return ctx.db.query.products({}, info);
  },

  product(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that.');
    }
    return ctx.db.query.product( // TODO only return if it belongs to the user
      {
        where: { id: args.id },
      },
      info
    );
  },

  productsConnection(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that.');
    }
    return ctx.db.query.productsConnection({}, info);
  },

  categories(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that.');
    }
    return ctx.db.query.categories({}, info); // TODO only return categories that belong to the user
  },

  me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info
    );
  },

  async users(parent, args, ctx, info) {
    // 1. check if logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that.');
    }
    // 2. check if the user has the permission to query all users
    hasPermission(ctx.request.user, ['ADMIN','PERMISSIONUPDATE']);

    // 3. query all users
    return ctx.db.query.users({}, info);
  },

};

module.exports = Query;
