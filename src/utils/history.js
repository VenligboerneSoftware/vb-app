import { createMemoryHistory } from 'history';

const history = createMemoryHistory({
  initialEntries: [ '/startup' ],
  initialIndex: 0
});

export default history;
