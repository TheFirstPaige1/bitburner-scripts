import { NS } from "@ns";
import { masterLister } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	let excludedservers = ns.getPurchasedServers();
	for (let i = 0; i < ns.hacknet.numNodes(); i++) { excludedservers.push(ns.hacknet.getNodeStats(i).name); }
	excludedservers.push("home");
	excludedservers.push("w0r1d_d43m0n");
	excludedservers.push("darkweb");
	const servers = masterLister(ns).filter(serv => (ns.getServerMaxRam(serv) >= 8) && (!excludedservers.includes(serv)));
	for (const server of servers) {
		ns.killall(server);
		ns.scp("manshare.js", server);
		ns.exec("manshare.js", server, Math.trunc(ns.getServerMaxRam(server) / 8));
	}
}