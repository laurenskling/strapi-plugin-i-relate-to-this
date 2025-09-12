import List from './components/list';

export default {
  bootstrap(app) {
    // execute some bootstrap code
    app.getPlugin('content-manager').injectComponent('editView', 'right-links', {
      name: 'it-relates-to-me-list',
      Component: List,
    });
  },
  register() {}
};
