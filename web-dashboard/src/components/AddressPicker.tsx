import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, CircularProgress, TextField } from '@mui/material';
import { GeocodeResult, searchAddress } from '../services/geocoding';

interface AddressPickerProps {
  label?: string;
  value: string;
  onSelect: (result: GeocodeResult) => void;
  onInputChange?: (value: string) => void;
}

const AddressPicker: React.FC<AddressPickerProps> = ({ label = 'Street Address', value, onSelect, onInputChange }) => {
  const [options, setOptions] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Simple debounce implementation without external deps
  function createDebounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let t: any;
    return (...args: any[]) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  const runSearch = useMemo(() =>
    createDebounce(async (q: string) => {
      setLoading(true);
      try {
        const results = await searchAddress(q);
        setOptions(results);
      } finally {
        setLoading(false);
      }
    }, 300)
  , []);

  useEffect(() => {
    // no-op cleanup for our simple debounce
    return () => {};
  }, [runSearch]);

  return (
    <Autocomplete
      freeSolo
      filterOptions={(x) => x}
      getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.displayName)}
      options={options}
      loading={loading}
      inputValue={value}
      onInputChange={(_, newInputValue) => {
        onInputChange?.(newInputValue);
        if (newInputValue && newInputValue.length >= 2) {
          runSearch(newInputValue);
        } else {
          setOptions([]);
        }
      }}
      onChange={(_, newValue) => {
        if (newValue && typeof newValue !== 'string') {
          onSelect(newValue as GeocodeResult);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Start typing your address"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </Box>
            ),
          }}
        />
      )}
    />
  );
};

export default AddressPicker;
