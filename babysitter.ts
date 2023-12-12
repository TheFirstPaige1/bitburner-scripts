import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('sleep');
	while (true) {
		if (ns.hacknet.numHashes() > Math.trunc(ns.hacknet.hashCapacity() / 2)) {
			ns.hacknet.spendHashes("Improve Studying");
			ns.hacknet.spendHashes("Improve Gym Training");
			ns.hacknet.spendHashes("Sell for Money");
		} else { await ns.sleep(1000); }
	}
}