// import Promise from 'bluebird'
// import jwt from 'koa-jwt'
// import {pick, omit} from 'lodash/fp'

import Blog from '../models/blog'

const blog = {
  list: async (ctx, next) => {
    ctx.body = await Blog.find({});
  },

  create: async (ctx, next) => {
    if (!ctx.state.user.admin) {
      const found = await Blog.findOne({
        owner: ctx.state.user._id
      })
      if (found) {
        ctx.throw('You do not have permission to create more than one blog.', 412)
      }
    }
    const {blogname = ctx.throw({status: 401, message: 'You must special the blogname in your post body.'})} = ctx.request.body;
    try {
      ctx.body = await Blog.createAsync({blogname, owner: ctx.state.user._id})
    } catch (err) {
      ctx.throw(err, 400)
    }

    ctx.status = 201
  },

  deleteSelf: async (ctx, next) => {
    const {blogname = ctx.throw('You must special the blogname in your request params.', 401)} = ctx.params;
    console.log('get', blogname);
    const found = await Blog.findOne({
      owner: ctx.state.user._id,
      blogname
    })
    if (!found) {
      ctx.throw('Couldn\'t found your blog.', 404)
    }
    ctx.body = await found.remove()
  }
}

export default blog;