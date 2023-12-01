import { NS } from "@ns";

/**
 * Forces an update to the sourcefiles.txt, or creates it if it doesn't exist.
 * Only call on functions being ran on home, or it'll create extra text files.
 * RAM cost: 82/22/7 GB
 * @param ns BitBurner NS object
 */
function updateSourceFiles(ns: NS) {
	const fetchedfiles = ns.singularity.getOwnedSourceFiles();
	const currentnode = ns.getResetInfo().currentNode;
	let sortedfiles = Array(14).fill(0);
	for (const fileobject of fetchedfiles) { sortedfiles[fileobject.n] = (fileobject.lvl || 0); }
	sortedfiles[0] = currentnode;
	ns.rm("sourcefiles.txt");
	ns.write("sourcefiles.txt", JSON.stringify(sortedfiles));
}

/**
 * Forces an update to the networkmap.txt, or creates it if it doesn't exist.
 * Only call on functions being ran on home, or it'll create the file in the wrong place.
 * RAM cost: 5.25 GB
 * @param ns BitBurner NS object
 */
function netScan(ns: NS) {
	let excludedservers = ns.getPurchasedServers();
	for (let i = 0; i < ns.hacknet.numNodes(); i++) { excludedservers.push(ns.hacknet.getNodeStats(i).name); }
	excludedservers.push("w0r1d_d43m0n");
	excludedservers.push("darkweb");
	let currentserver = "home";
	let scanservers = ["home"];
	let knownservers = [] as Array<string>;
	let servermap = [["home", "home"]];
	while (scanservers.length > 0) {
		currentserver = scanservers[0];
		knownservers.push(currentserver);
		for (const scantarg of ns.scan(currentserver)) {
			if (!scanservers.includes(scantarg) && !knownservers.includes(scantarg) && !excludedservers.includes(scantarg)) {
				scanservers.push(scantarg);
				servermap.push([scantarg, currentserver]);
			}
		}
		scanservers = scanservers.slice(1);
	}
	ns.rm("networkmap.txt");
	ns.write("networkmap.txt", JSON.stringify(servermap));
}

/**
 * Checks for if source file requirements are met, by either being in a node or owning a source file.
 * Cannot check source files if sourcefiles.txt doesn't exist and will only check current node.
 * Only call on functions being ran on home, or it'll look in the wrong place for the text file.
 * RAM cost: 1.1 GB
 * @param ns BitBurner NS object
 * @param node number of BitNode being checked for, must be between 1 and 13
 * @param level level of source file being checked for
 * @returns true if the current bitnode is the given number, or owned source files of the given bitnode are at least the given level, false otherwise
 */
export function sourceCheck(ns: NS, node: number, level: number): boolean {
	if (ns.fileExists("sourcefiles.txt", "home")) {
		const bitnodes = JSON.parse(ns.read("sourcefiles.txt"));
		if (bitnodes[0] == node || bitnodes[node] >= level) { return true; }
		else { return false; }
	} else {
		if (node == ns.getResetInfo().currentNode) { return true; }
		else { return false; }
	}
}

/**
 * Attempts to open every port and nuke the given server, returning a boolean of root access.
 * RAM cost: 0.35 GB
 * @param ns BitBurner NS object
 * @param target string of the server to attempt to root
 * @returns true if root access was gained or already exists, false otherwise
 */
export function popTheHood(ns: NS, target: string): boolean {
	for (const fn of [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject, ns.nuke]) try { fn(target) } catch { }
	return (ns.hasRootAccess(target));
}

/**
 * Attempts to connect to a given server by daisy-chaining between it and home.
 * Relies on an existing networkmap.txt.
 * RAM cost: 32/8/2 GB
 * @param ns BitBurner NS object
 * @param target string of the server to connect to
 */
export function remoteConnect(ns: NS, target: string) {
	const networkmap = JSON.parse(ns.read("networkmap.txt"));
	let next = target;
	let netpath = [target];
	for (let i = networkmap.length - 1; i > 0; i--) {
		if (networkmap[i][0] == next) {
			next = networkmap[i][1];
			netpath.unshift(networkmap[i][1]);
		}
	}
	for (const next of netpath) { ns.singularity.connect(next); }
}

export async function main(ns: NS): Promise<void> {
	updateSourceFiles(ns);
	netScan(ns);
}