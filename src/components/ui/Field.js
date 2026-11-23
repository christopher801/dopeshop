/** Campo de formulario accesible: etiqueta, control y mensaje de error enlazados. */
export default function Field({ id, label, error, hint, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required && <span aria-hidden="true" className="text-red-600"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
