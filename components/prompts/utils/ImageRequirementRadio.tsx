interface ImageRequirementRadioProps {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ImageRequirementRadio({ value, onChange }: ImageRequirementRadioProps) {
  const options = [
    { value: -1, label: 'No Images' },
    { value: 0, label: 'Optional' },
    { value: 1, label: '1 Image' },
    { value: 2, label: '2 Images' },
    { value: 3, label: '3 Images' },
    { value: 4, label: '4 Images' },
  ];

  return (
    <div>
      <label htmlFor="imageRequirement" className="block text-sm font-semibold text-primary mb-2 font-body">
        Image Requirement
      </label>
      <ul className="items-center w-full text-sm font-medium text-primary bg-background border border-primary/10 rounded-lg sm:flex">
        {options.map((option, index) => (
          <li
            key={option.value}
            className={`w-full ${
              index < options.length - 1 ? 'border-b border-primary/10 sm:border-b-0 sm:border-r' : ''
            }`}
          >
            <div className="flex items-center ps-3">
              <input
                id={`image-req-${option.value}`}
                type="radio"
                value={option.value}
                name="imageRequirement"
                checked={value === option.value}
                onChange={onChange}
                className="w-4 h-4 border-2 border-primary/30 bg-white rounded-full appearance-none cursor-pointer checked:bg-accent checked:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
              />
              <label
                htmlFor={`image-req-${option.value}`}
                className="w-full py-3 select-none ms-2 text-sm font-medium text-primary cursor-pointer font-body"
              >
                {option.label}
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
