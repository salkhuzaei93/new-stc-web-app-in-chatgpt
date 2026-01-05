import { z } from "zod";
import { parseCircuit } from "./parseCircuit";

export const orderTypes = ["I", "M", "C", "O"];
export const transportTypes = ["Fiber", "Copper", "Transmission", "UPE"];
export const vendorOptions = ["Cisco", "Huawei", "Juniper"];

export const circuitNameSchema = z
  .string()
  .min(1, "Circuit name is required.")
  .refine((value) => {
    try {
      parseCircuit(value);
      return true;
    } catch {
      return false;
    }
  }, "Circuit name must match <SITE-A>-<SITE-Z> <TYPE><ID>. Example: JEDDAH-MAKKAH IP263.");

export const ipv4Schema = z
  .string()
  .regex(
    /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/,
    "Must be a valid IPv4 address."
  );

export const formSchema = z
  .object({
    circuitName: circuitNameSchema,
    orderNumber: z.string().min(1, "Order number is required."),
    orderType: z.enum(orderTypes, { required_error: "Order type is required." }),
    transportType: z.enum(transportTypes, { required_error: "Transport type is required." }),
    aggregatorPe: z.string().optional(),
    upeName: z.string().optional(),
    aggregatorVendor: z.enum(vendorOptions, { required_error: "Aggregator vendor is required." }),
    upeVendor: z.enum(vendorOptions).optional(),
    vlanId: z
      .string()
      .min(1, "VLAN ID is required.")
      .regex(/^\d+$/, "VLAN ID must be numeric."),
    interfaceName: z.string().optional(),
    customerIp: ipv4Schema.optional(),
    defaultGateway: ipv4Schema.optional(),
    instanceName: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (!data.aggregatorPe) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Aggregator PE name is required.",
        path: ["aggregatorPe"]
      });
    }

    if (data.transportType === "UPE") {
      if (!data.upeName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "UPE name is required when transport is UPE.",
          path: ["upeName"]
        });
      }
      if (!data.upeVendor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "UPE vendor is required when transport is UPE.",
          path: ["upeVendor"]
        });
      }
    }

    let parsed;
    try {
      parsed = parseCircuit(data.circuitName);
    } catch {
      return;
    }

    if (parsed.layer === "L3") {
      if (!data.customerIp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Customer IP is required for L3 circuits.",
          path: ["customerIp"]
        });
      }
      if (!data.defaultGateway) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Default gateway is required for L3 circuits.",
          path: ["defaultGateway"]
        });
      }
      if (!data.instanceName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Instance name is required for L3 circuits.",
          path: ["instanceName"]
        });
      }
    }
  });
