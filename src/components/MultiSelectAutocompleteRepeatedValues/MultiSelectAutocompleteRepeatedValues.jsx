import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Paper from '@material-ui/core/Paper';
import TagFacesIcon from '@material-ui/icons/TagFaces';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    listStyle: 'none',
    padding: theme.spacing(0.5),
    margin: 0,
    width: '300px',
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

export default function MultiSelectAutocompleteRepeatedValues(props) {
  // eslint-disable-next-line react/prop-types
  const { options, label, size, placeholder, values, setValues, style } = props;
  const classes = useStyles();

  const [inputValue, setInputValue] = React.useState('');

  const handleDelete = (chipToDelete) => () => {
    setValues((chips) =>
      chips.filter((chip) => {
        if (chip === chipToDelete) {
          // eslint-disable-next-line no-param-reassign
          chipToDelete = null;
          return false;
        }
        return true;
      })
    );
  };
  return (
    <div style={{ ...style, boxShadow: '1px 1px 5px grey', padding: '20px' }}>
      <Grid container justify="space-around">
        <Grid item xs="12">
          <div>{label}</div>
        </Grid>
        <Grid item>
          {/** Chip View of selected values */}
          <Paper component="ul" className={classes.root}>
            {values.map((data, i) => {
              let icon;

              return (
                // eslint-disable-next-line react/no-array-index-key
                <li key={`${data}${i}`}>
                  <Chip
                    icon={icon}
                    label={data}
                    onDelete={handleDelete(data)}
                    className={classes.chip}
                  />
                </li>
              );
            })}
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <Autocomplete
            size={size}
            disableCloseOnSelect
            inputValue={inputValue}
            onInputChange={(event, newValue) => setInputValue(newValue)}
            options={options}
            onChange={() => {}}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" />
            )}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (options.includes(inputValue))
                setValues([...values, inputValue]);
            }}
          >
            Add
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}
