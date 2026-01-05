const FormSectionField = ({ label, helper, error, children }) => {
  return (
    <div>
      <label>{label}</label>
      {children}
      {helper && <div className="helper">{helper}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default FormSectionField;
