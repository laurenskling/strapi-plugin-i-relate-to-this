import Panel from './components/panel';

export default {
  bootstrap(app) {
    // execute some bootstrap code
    app.getPlugin('content-manager').apis.addEditViewSidePanel([Panel]);
  },
  register() {}
};
