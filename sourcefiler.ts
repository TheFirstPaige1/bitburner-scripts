import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	const fetchedfiles = ns.singularity.getOwnedSourceFiles();
	const currentnode = ns.getResetInfo().currentNode;
	let sortedfiles = [];
	for (let i = 0; i < fetchedfiles.length; i++) { sortedfiles.push(0); }
	for (const fileobject of fetchedfiles) { sortedfiles[fileobject.n] = fileobject.lvl; }
	sortedfiles[0] = currentnode;
	ns.rm("sourcefiles.txt");
	ns.write("sourcefiles.txt", sortedfiles.toString());
}