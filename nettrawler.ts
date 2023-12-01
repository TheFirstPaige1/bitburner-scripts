import { NS } from "@ns";
import { popTheHood } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	let excludedservers = ns.getPurchasedServers();
	for (let i = 0; i < ns.hacknet.numNodes(); i++) { excludedservers.push(ns.hacknet.getNodeStats(i).name); }
	excludedservers.push("w0r1d_d43m0n");
	excludedservers.push("darkweb");
	let currentserver = "home";
	let scanservers = ["home"];
	let knownservers = [] as Array<string>;
	while (scanservers.length > 0) {
		currentserver = scanservers[0];
		knownservers.push(currentserver);
		if (currentserver == ns.getHostname() || ns.singularity.connect(currentserver)) {
			for (const scantarg of ns.scan(currentserver)) {
				if (!scanservers.includes(scantarg) && !knownservers.includes(scantarg) && !excludedservers.includes(scantarg)) {
					scanservers.push(scantarg);
					ns.singularity.connect(scantarg);
					if (popTheHood(ns, scantarg) && ns.getServerRequiredHackingLevel(scantarg) <= ns.getHackingLevel() && !ns.getServer(scantarg).backdoorInstalled) {
						//ns.tprint("Backdooring " + scantarg + ", please wait!");
						//await ns.singularity.installBackdoor();
						ns.scp("mandoor.js", scantarg, "home");
						ns.exec("mandoor.js", scantarg);
						await ns.sleep(1);
					}
					ns.singularity.connect(currentserver);
				}
			}
		}
		scanservers = scanservers.slice(1);
	}
	//ns.tprint("Done!");
	ns.singularity.connect("home");
}