import { NS } from "@ns";
import * as BitLib from "./bitlib";
export async function main(ns: NS): Promise<void> {
	if (!ns.fileExists("networkmap.txt", "home")) { ns.run("netscanner.js"); }
	let excludedservers = ns.getPurchasedServers();
	for (let i = 0; i < ns.hacknet.numNodes(); i++) { excludedservers.push(ns.hacknet.getNodeStats(i).name); }
	excludedservers.push("w0r1d_d43m0n");
	excludedservers.push("darkweb");
	let masterlist = BitLib.masterLister(ns);
	masterlist = masterlist.filter(server => !excludedservers.includes(server));
	let doorcount = [];
	for (const server of masterlist) {
		if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel() && !ns.getServer(server).backdoorInstalled) {
			BitLib.remoteConnect(ns, server);
			doorcount.push(ns.exec("mandoor.js", "home"));
			await ns.sleep(1);
		}
	}
	doorcount = doorcount.filter(door => door != 0);
	let runningcount = 0;
	for (const door of doorcount) { if (ns.isRunning(door)) { runningcount++; } }
	ns.singularity.connect("home");
	ns.tprint("attempting to backdoor " + doorcount.length + " servers...");
	while (runningcount > 0) {
		let oldcount = runningcount;
		ns.tprint(runningcount + " remaining");
		while (oldcount == runningcount) {
			await ns.sleep(500);
			runningcount = 0;
			for (const door of doorcount) { if (ns.isRunning(door)) { runningcount++; } }
		}
	}
	ns.tprint("done!");
}