const FILTER_OPTIONS = [
  'Business Development',
  'Software Engineer',
  'Product Manager',
  'Project Manager',
  'Business Analyst',
  'Data Engineer',
]

export default function FilterDropdown({ selected, onChange }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div className="db-filter-dropdown">
      {FILTER_OPTIONS.map(opt => (
        <label key={opt} className="db-filter-dropdown__item">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  )
}
