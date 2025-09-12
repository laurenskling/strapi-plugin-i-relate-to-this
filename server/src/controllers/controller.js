const controller = ({ strapi }) => ({
  async getunirelations(ctx) {
    const { id, contentType, status } = ctx.request.params;
    const response = await strapi.service('plugin::i-relate-to-this.service').getunirelations(contentType, id, status);
    if (!response) {
      ctx.body = { success: false };
      return;
    }
    ctx.body = {
      success: true,
      items: response,
    };
  },
});

export default controller;
