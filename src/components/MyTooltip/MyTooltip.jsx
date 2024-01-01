/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

import EmojiObjectsOutlinedIcon from '@material-ui/icons/EmojiObjectsOutlined';

const useStylesBootstrap = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid black',
    boxShadow: '0px 3px 5px grey',
  },
}));

function BootstrapTooltip(props) {
  const classes = useStylesBootstrap();

  return <Tooltip arrow classes={classes} {...props} placement="top" />;
}

export default function CustomizedTooltips(props) {
  const { title, children } = props;
  return (
    <BootstrapTooltip
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14px',
          }}
        >
          <EmojiObjectsOutlinedIcon />
          <div> {title} </div>
        </div>
      }
    >
      {children}
    </BootstrapTooltip>
  );
}
