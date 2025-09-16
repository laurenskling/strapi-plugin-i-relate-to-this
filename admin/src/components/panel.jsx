import List from "./list";

const Panel = (props) => ({
  title: 'Relations to this entry',
  content: <List {...props} />,
});

export default Panel;