/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import { CSS } from '../../utils/constants';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function MultiSelectAutoComplete(props) {
  const {
    options,
    getOptionLabel,
    label,
    placeholder,
    size,
    values,
    setValues,
    freeSolo,
  } = props;

  return (
    <Autocomplete
      multiple
      options={options}
      getOptionLabel={getOptionLabel || ((option) => option)}
      freeSolo={freeSolo}
      value={values}
      style={{ ...CSS.inputFormField, minWidth: '400px' }}
      size="small"
      disableCloseOnSelect
      onChange={(event, newValues) => setValues(newValues)}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            key={option}
            variant="outlined"
            label={option}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
          placeholder={placeholder || 'Press enter after entring the value'}
        />
      )}
    />
  );
}
