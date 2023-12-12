import { NS } from "@ns";
export async function main(ns: NS): Promise<void> { while (ns.hacknet.spendHashes("Sell for Money")) { await ns.sleep(1); } }
