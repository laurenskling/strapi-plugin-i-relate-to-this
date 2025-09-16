import List from "./list";

const Panel = ({ model, documentId, document }) => ({
  title: 'Relations to this entry',
  content: <List />,
});

export default Panel;