import {LinearProgress, Typography} from '@mui/material';
import React, {memo} from 'react';

import './LoadingBar.css';

/** Renders a loading bar. */
const LoadingBar = () => (
  <Typography className="loadingBarContainer" color="text.disabled">
    <LinearProgress className="loadingBar" color="inherit" />
  </Typography>
);

export default memo(LoadingBar);
