import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	const fetchedfiles = ns.singularity.getOwnedSourceFiles();
	const currentnode = ns.getResetInfo().currentNode;
	let sortedfiles = [];
	for (let i = 0; i < fetchedfiles.length; i++) { sortedfiles.push(0); }
	for (const fileobject of fetchedfiles) {
		if (fileobject.n == currentnode) {
			sortedfiles[fileobject.n] = fileobject.n + "." + (fileobject.lvl + 1);
		} else {
			sortedfiles[fileobject.n] = fileobject.n + "." + fileobject.lvl;
		}
	}
	sortedfiles = sortedfiles.slice(1);
	ns.rm("sourcefiles.txt");
	ns.write("sourcefiles.txt", sortedfiles.toString());
}