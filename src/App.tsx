import { useMemo, useState } from "react";
import FormSection from "./components/FormSection";
import FormSectionField from "./components/FormSectionField";
import { formSchema, orderTypes, transportTypes, vendorOptions, FormValues } from "./lib/validators";
import { parseCircuit } from "./lib/parseCircuit";
import { generateCommands } from "./lib/generateCommands";

const initialValues: FormValues = {
  circuitName: "",
  orderNumber: "",
  orderType: "I",
  transportType: "Fiber",
  aggregatorPe: "",
  upeName: "",
  aggregatorVendor: "Cisco",
  upeVendor: "Cisco",
  vlanId: "",
  interfaceName: "",
  customerIp: "",
  defaultGateway: "",
  instanceName: ""
};

type ErrorMap = Record<string, string>;

const App = () => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [output, setOutput] = useState<string[]>([]);
  const [outputMessage, setOutputMessage] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [showExplanations, setShowExplanations] = useState(false);

  const parsedCircuit = useMemo(() => {
    if (!values.circuitName) {
      return null;
    }
    try {
      return parseCircuit(values.circuitName);
    } catch {
      return null;
    }
  }, [values.circuitName]);

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = formSchema.safeParse(values);
    if (!result.success) {
      const nextErrors: ErrorMap = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path.join(".") || "form";
        nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      setOutput([]);
      setOutputMessage("Please resolve the highlighted fields.");
      return;
    }

    setErrors({});
    const generated = generateCommands(result.data);
    if (generated.status === "ready") {
      setOutput(generated.commands ?? []);
      setExplanations(generated.explanations ?? []);
      setOutputMessage(null);
    } else {
      setOutput([]);
      setExplanations([]);
      setOutputMessage(generated.message ?? "Command generation is blocked.");
    }
  };

  const handleCopy = async () => {
    if (!output.length) return;
    await navigator.clipboard.writeText(output.join("\n"));
  };

  return (
    <main>
      <div>
        <h1>Circuit Verification Assistant (CVA)</h1>
        <p>
          Generate read-only verification commands based on explicit circuit details. This tool never provides
          configuration or remediation steps.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <FormSection
          title="A) Circuit Identification"
          description="Enter the circuit name exactly as ordered. The parser will infer the layer based on the type token."
        >
          <FormSectionField
            label="Circuit Name"
            helper="Format: <SITE-A>-<SITE-Z> <TYPE><ID> (e.g., JEDDAH-MAKKAH IP263)"
            error={errors.circuitName}
          >
            <input
              value={values.circuitName}
              onChange={(event) => handleChange("circuitName", event.target.value)}
              placeholder="JEDDAH-MAKKAH IP263"
            />
          </FormSectionField>
          {parsedCircuit && (
            <div className="badge">Layer inferred: {parsedCircuit.layer}</div>
          )}
        </FormSection>

        <FormSection title="B) Order Context">
          <div className="grid grid-2">
            <FormSectionField label="Order Number" error={errors.orderNumber}>
              <input
                value={values.orderNumber}
                onChange={(event) => handleChange("orderNumber", event.target.value)}
              />
            </FormSectionField>
            <FormSectionField label="Order Type" error={errors.orderType}>
              <select
                value={values.orderType}
                onChange={(event) => handleChange("orderType", event.target.value)}
              >
                {orderTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormSectionField>
          </div>
        </FormSection>

        <FormSection title="C) Transport & Device Targets">
          <div className="grid grid-2">
            <FormSectionField label="Transport Type" error={errors.transportType}>
              <select
                value={values.transportType}
                onChange={(event) => handleChange("transportType", event.target.value)}
              >
                {transportTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormSectionField>
            <FormSectionField label="Aggregator PE Name" error={errors.aggregatorPe}>
              <input
                value={values.aggregatorPe}
                onChange={(event) => handleChange("aggregatorPe", event.target.value)}
              />
            </FormSectionField>
          </div>

          {values.transportType === "UPE" && (
            <div className="grid grid-2">
              <FormSectionField label="UPE Name" error={errors.upeName}>
                <input
                  value={values.upeName}
                  onChange={(event) => handleChange("upeName", event.target.value)}
                />
              </FormSectionField>
            </div>
          )}
        </FormSection>

        <FormSection title="D) Vendors">
          <div className="grid grid-2">
            <FormSectionField label="Aggregator Vendor" error={errors.aggregatorVendor}>
              <select
                value={values.aggregatorVendor}
                onChange={(event) => handleChange("aggregatorVendor", event.target.value)}
              >
                {vendorOptions.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </FormSectionField>
            {values.transportType === "UPE" && (
              <FormSectionField label="UPE Vendor" error={errors.upeVendor}>
                <select
                  value={values.upeVendor}
                  onChange={(event) => handleChange("upeVendor", event.target.value)}
                >
                  {vendorOptions.map((vendor) => (
                    <option key={vendor} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>
              </FormSectionField>
            )}
          </div>
        </FormSection>

        <FormSection title="E) Service Parameters">
          <div className="grid grid-2">
            <FormSectionField label="VLAN ID" error={errors.vlanId}>
              <input
                value={values.vlanId}
                onChange={(event) => handleChange("vlanId", event.target.value)}
              />
            </FormSectionField>
            <FormSectionField label="Interface (optional)" error={errors.interfaceName}>
              <input
                value={values.interfaceName}
                onChange={(event) => handleChange("interfaceName", event.target.value)}
                placeholder="Gi0/0/1.123"
              />
            </FormSectionField>
          </div>

          {parsedCircuit?.layer === "L3" && (
            <div className="grid grid-2" style={{ marginTop: "12px" }}>
              <FormSectionField label="Customer IP" error={errors.customerIp}>
                <input
                  value={values.customerIp}
                  onChange={(event) => handleChange("customerIp", event.target.value)}
                  placeholder="192.0.2.10"
                />
              </FormSectionField>
              <FormSectionField label="Default Gateway" error={errors.defaultGateway}>
                <input
                  value={values.defaultGateway}
                  onChange={(event) => handleChange("defaultGateway", event.target.value)}
                  placeholder="192.0.2.1"
                />
              </FormSectionField>
              <FormSectionField
                label="Instance Name"
                helper={
                  values.aggregatorVendor === "Cisco"
                    ? "Cisco: VRF name"
                    : values.aggregatorVendor === "Huawei"
                      ? "Huawei: VPN Instance name"
                      : "Juniper: Routing Instance name"
                }
                error={errors.instanceName}
              >
                <input
                  value={values.instanceName}
                  onChange={(event) => handleChange("instanceName", event.target.value)}
                  placeholder="VRF-CUSTOMER"
                />
              </FormSectionField>
            </div>
          )}
        </FormSection>

        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2>E) Generated Command Set</h2>
              <p>Commands are read-only and generated only when required fields are present.</p>
            </div>
            <button className="button" type="submit">
              Generate Commands
            </button>
          </div>

          {outputMessage && <p className="error">{outputMessage}</p>}

          {output.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
                <button type="button" className="button" onClick={handleCopy}>
                  Copy Commands
                </button>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={showExplanations}
                    onChange={(event) => setShowExplanations(event.target.checked)}
                  />
                  Show explanations
                </label>
              </div>
              <div className="output">{output.join("\n")}</div>
              {showExplanations && explanations.length > 0 && (
                <ul style={{ marginTop: "12px", color: "#334155" }}>
                  {explanations.map((explanation, index) => (
                    <li key={explanation}>
                      <strong>{index + 1}.</strong> {explanation}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </form>
    </main>
  );
};

export default App;
