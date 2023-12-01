import { NS } from "@ns";
import { popTheHood } from "./bitlib";
import { remoteConnect } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	let excludedservers = ns.getPurchasedServers();
	for (let i = 0; i < ns.hacknet.numNodes(); i++) { excludedservers.push(ns.hacknet.getNodeStats(i).name); }
	excludedservers.push("w0r1d_d43m0n");
	excludedservers.push("darkweb");
	let masterlist = ["home"];
	for (const scantarg of masterlist) {
		let workinglist = ns.scan(scantarg);
		for (const target of workinglist) {
			if (!masterlist.includes(target) && !excludedservers.includes(target)) {
				if (popTheHood(ns, target)) { masterlist.push(target); }
			}
		}
	}
	for (const server of masterlist) {
		if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() && !ns.getServer(server).backdoorInstalled) {
			remoteConnect(ns, server);
			ns.exec("mandoor.js", "home");
			await ns.sleep(1);
		}
	}
	ns.singularity.connect("home");
}