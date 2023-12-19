import { NS } from "@ns";
import { quietTheBabblingThrong } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	quietTheBabblingThrong(ns);
	while (true) {
		if (ns.hacknet.numHashes() > Math.trunc(ns.hacknet.hashCapacity() * 0.75)) {
			while (ns.hacknet.numHashes() > Math.trunc(ns.hacknet.hashCapacity() * 0.5)) {
				ns.hacknet.spendHashes("Sell for Money");
			}
		} else { await ns.sleep(1000); }
	}
}