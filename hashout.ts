import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.hacknet.spendHashes("Sell for Money", "", Math.trunc(ns.hacknet.numHashes() / ns.hacknet.hashCost("Sell for Money")));
}
