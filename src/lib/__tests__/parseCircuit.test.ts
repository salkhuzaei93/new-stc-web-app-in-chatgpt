import { describe, expect, it } from "vitest";
import { inferLayer, parseCircuit } from "../parseCircuit";

describe("parseCircuit", () => {
  it("parses circuit tokens and infers layer", () => {
    const parsed = parseCircuit("JEDDAH-MAKKAH IP263");
    expect(parsed.siteA).toBe("JEDDAH");
    expect(parsed.siteZ).toBe("MAKKAH");
    expect(parsed.typeToken).toBe("IP");
    expect(parsed.circuitId).toBe("263");
    expect(parsed.circuitToken).toBe("IP263");
    expect(parsed.layer).toBe("L3");
  });

  it("rejects invalid circuit names", () => {
    expect(() => parseCircuit("INVALIDFORMAT")).toThrow();
  });
});

describe("inferLayer", () => {
  it("infers L2/L3 by type token", () => {
    expect(inferLayer("IP")).toBe("L3");
    expect(inferLayer("DIA")).toBe("L2");
    expect(inferLayer("UNKNOWN")).toBeNull();
  });
});
