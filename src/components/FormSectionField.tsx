import { ReactNode } from "react";

type FormSectionFieldProps = {
  label: string;
  helper?: string;
  error?: string;
  children: ReactNode;
};

const FormSectionField = ({ label, helper, error, children }: FormSectionFieldProps) => {
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
