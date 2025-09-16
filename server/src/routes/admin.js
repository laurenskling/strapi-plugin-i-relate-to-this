export default [
  {
    method: 'GET',
    path: '/:contentType/:id/:documentId/:status',
    handler: 'controller.getunirelations',
  },
];
