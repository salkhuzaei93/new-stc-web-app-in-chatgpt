const FormSection = ({ title, description, children }) => {
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h2>{title}</h2>
      </div>
      {description && <p>{description}</p>}
      <div className="grid" style={{ marginTop: "16px" }}>
        {children}
      </div>
    </section>
  );
};

export default FormSection;
