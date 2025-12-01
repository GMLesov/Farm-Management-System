// Quick fix for MUI Select queries in tests
// MUI Select components render as buttons with role="combobox"
// Use screen.getByRole('combobox', { name: /label/i }) instead of getByLabelText

export const getMuiSelect = (screen: any, labelText: RegExp) => {
  return screen.getByRole('combobox', { name: labelText });
};
