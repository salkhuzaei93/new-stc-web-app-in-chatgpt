import { describe, expect, it } from "vitest";
import { generateCommands } from "../generateCommands";
import { FormValues } from "../validators";

const baseValues: FormValues = {
  circuitName: "JEDDAH-MAKKAH IP263",
  orderNumber: "ORD-123",
  orderType: "I",
  transportType: "Fiber",
  aggregatorPe: "PE1",
  upeName: "",
  aggregatorVendor: "Cisco",
  upeVendor: "Cisco",
  vlanId: "300",
  interfaceName: "Gi0/0/1.300",
  customerIp: "192.0.2.10",
  defaultGateway: "192.0.2.1",
  instanceName: "VRF-CUSTOMER"
};

describe("generateCommands", () => {
  it("generates Cisco L3 commands", () => {
    const output = generateCommands(baseValues);
    expect(output.status).toBe("ready");
    expect(output.commands?.[0]).toContain("show interface description");
    expect(output.commands?.[1]).toContain("show run interface");
  });

  it("blocks when interface is missing", () => {
    const output = generateCommands({ ...baseValues, interfaceName: "" });
    expect(output.status).toBe("blocked");
  });

  it("returns unsupported for non-Cisco or L2", () => {
    const output = generateCommands({ ...baseValues, aggregatorVendor: "Juniper" });
    expect(output.status).toBe("unsupported");
  });
});
