import React from 'react';
import { AppBar } from 'react-toolbox';
import theme from './theme';

const AppBarExtended = (props) => (
    <AppBar {...props} theme={theme} />
);

export default AppBarExtended;