import { NS } from '@ns';
import ReactLib from 'react';
import { wrapNS } from './bitlib';
declare const React: typeof ReactLib;
export async function main(ns: NS): Promise<void> {
	const wns = wrapNS(ns);
	ns.tail();
	ns.clearLog();
	let homestats = await wns.getServerD("home");
	let crimestat = await wns.singularity.getCrimeChanceD("Mug");
	ns.print(homestats.cpuCores + " " + crimestat);
}