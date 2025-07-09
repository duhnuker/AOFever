import { Select } from '@radix-ui/themes';

interface FilterDropdownProps {
  placeholder: string;
  options: (string | number)[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const FilterDropdown = ({ 
  placeholder, 
  options, 
  value, 
  onValueChange, 
  disabled = false 
}: FilterDropdownProps) => {
  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger placeholder={placeholder} style={{ minWidth: '150px' }} />
      <Select.Content>
        <Select.Group>
          <Select.Item value="Default">Default</Select.Item>
          {options.map((option) => (
            <Select.Item key={option} value={option.toString()}>
              {option}
            </Select.Item>
          ))}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
};

export default FilterDropdown;
