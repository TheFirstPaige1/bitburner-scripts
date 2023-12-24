import { NS } from "@ns";
import { remoteConnect } from "./bitlib";
export async function main(ns: NS): Promise<void> { remoteConnect(ns, ns.args[0] as string); }