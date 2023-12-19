import { NS } from "@ns";
import * as BitLib from "./bitlib";
export async function main(ns: NS): Promise<void> {
	BitLib.quietTheBabblingThrong(ns);
	while (true) {
		if (ns.hacknet.numHashes() > Math.trunc(ns.hacknet.hashCapacity() * 0.75)) {
			while (ns.hacknet.numHashes() > Math.trunc(ns.hacknet.hashCapacity() * 0.5)) {
				ns.hacknet.spendHashes("Improve Gym Training");
				ns.hacknet.spendHashes("Improve Studying");
				ns.hacknet.spendHashes("Sell for Money");
			}
		} else { await ns.sleep(1000); }
	}
}