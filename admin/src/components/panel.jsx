import List from "./list";

const Panel = (props) => ({
  title: 'One way Relations to this entry',
  content: <List {...props} />,
});

export default Panel;