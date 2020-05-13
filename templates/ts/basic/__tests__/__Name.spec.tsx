import { render } from '@testing-library/react';
import __Name from '../__Name';

describe('snapshot', () => {
  it('renders correctly', () => {
    const {container} = render(<__Name />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
