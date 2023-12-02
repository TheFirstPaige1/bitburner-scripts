import { NS } from "@ns";
import { masterLister } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	ns.tail();
	let formsexe = ns.fileExists("Formulas.exe", "home");
	let masterlist = masterLister(ns);
	for (const target of masterlist) { ns.scriptKill("manhack.js", target); }
	let ramlist = masterlist.filter(server => ns.getServerMaxRam(server) > 0);
	for (const target of ramlist) { ns.scp("manhack.js", target); }
	let targetList = masterlist.filter(server => (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) && (ns.getServerMaxMoney(server) > 0));
	let moneyList = [];
	let securityList = [];
	for (const target of targetList) {
		moneyList.push(ns.getServerMaxMoney(target) * 0.75);
		securityList.push(ns.getServerMinSecurityLevel(target) + 5);
	}
	let pidList = Array(targetList.length).fill(0);
	let timerlist = Array(targetList.length).fill(0);
	while (true) {
		for (let i = 0; i < targetList.length; i++) {
			let target = targetList[i];
			if (!ns.isRunning(pidList[i])) {
				let ramserver = ramlist[0];
				let freeram = Math.max(0, ns.getServerMaxRam(ramserver) - ns.getServerUsedRam(ramserver) - Math.max(Math.trunc(ns.getServerMaxRam(ramserver) / 4), 16));
				let mostfreeram = freeram;
				for (let m = 1; m < ramlist.length; m++) {
					freeram = ns.getServerMaxRam(ramlist[m]) - ns.getServerUsedRam(ramlist[m]);
					if (freeram > mostfreeram) {
						mostfreeram = freeram;
						ramserver = ramlist[m];
					}
				}
				let maxthreads = Math.trunc(mostfreeram / 2);
				if (maxthreads > 0) {
					let moneyThresh = moneyList[i];
					let securityThresh = securityList[i];
					if (ns.getServerSecurityLevel(target) > securityThresh) {
						let weakengoal = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);
						let threadcount = 1;
						while (ns.weakenAnalyze(threadcount, ns.getServer(ramserver).cpuCores) < weakengoal) { threadcount++; }
						threadcount = Math.min(threadcount, maxthreads);
						if (formsexe) {
							timerlist[i] = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer());
							ns.print("weakening " + target + " for " + Math.trunc(timerlist[i]) + "ms");
							ns.print("on " + ramserver + " with " + threadcount + " threads");
						} else { ns.print("weakening " + target + " with " + threadcount + " threads on " + ramserver); }
						pidList[i] = ns.exec("manhack.js", ramserver, threadcount, 0, target);
					} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
						let threadcount = 1;
						if (ns.getServerMoneyAvailable(target) < 10) { threadcount = maxthreads; }
						else {
							if (formsexe) { threadcount = ns.formulas.hacking.growThreads(ns.getServer(target), ns.getPlayer(), Infinity, ns.getServer(ramserver).cpuCores); }
							else {
								let growthgoal = ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target);
								threadcount = Math.ceil(ns.growthAnalyze(target, growthgoal, ns.getServer(ramserver).cpuCores));
							}
							threadcount = Math.min(maxthreads, threadcount);
						}
						if (formsexe) {
							timerlist[i] = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer());
							ns.print("growing " + target + " for " + Math.trunc(timerlist[i]) + "ms");
							ns.print("on " + ramserver + " with " + threadcount + " threads");
						} else { ns.print("growing " + target + " with " + threadcount + " threads on " + ramserver); }
						pidList[i] = ns.exec("manhack.js", ramserver, threadcount, 1, target);
					} else {
						let hackgoal = ns.getServerMaxMoney(target) - moneyThresh;
						let threadcount = Math.ceil(ns.hackAnalyzeThreads(target, hackgoal));
						threadcount = Math.min(threadcount, maxthreads);
						if (formsexe) {
							timerlist[i] = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer());
							ns.print("hacking " + target + " for " + Math.trunc(timerlist[i]) + "ms");
							ns.print("on " + ramserver + " with " + threadcount + " threads");
						} else { ns.print("hacking " + target + " with " + threadcount + " threads on " + ramserver); }
						pidList[i] = ns.exec("manhack.js", ramserver, threadcount, 2, target);
					}
				}
			}
		}
		if (formsexe) {
			let lowestms = Infinity;
			for (const listtime of timerlist) { if (listtime < lowestms) { lowestms = listtime; } }
			for (let i = 0; i < timerlist.length; i++) { timerlist[i] = timerlist[i] - lowestms; }
			await ns.sleep(lowestms + 1);
		} else {
			let looping = true;
			while (looping) {
				let pidcount = 0;
				for (const pidc of pidList) { if (ns.isRunning(pidc)) { pidcount++; } }
				if (pidcount == pidList.length) { await ns.sleep(5000); }
				else { looping = false; }
			}
		}
		let checklist = masterLister(ns);
		if (checklist.length > masterlist.length) {
			for (const server of checklist) { if (!masterlist.includes(server)) { masterlist.push(server); } }
			for (const target of masterlist) {
				if (!ramlist.includes(target)) {
					if (ns.getServerMaxRam(target) > 0) {
						ramlist.push(target);
						ns.scp("manhack.js", target);
					}
				}
				if (!targetList.includes(target)) {
					if (ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel()) {
						if (ns.getServerMaxMoney(target) > 0) {
							targetList.push(target);
							moneyList.push(ns.getServerMaxMoney(target) * 0.75);
							securityList.push(ns.getServerMinSecurityLevel(target) + 5);
						}
					}
				}
			}
			if (pidList.length < targetList.length) {
				pidList = pidList.concat(Array(targetList.length - pidList.length).fill(0));
				timerlist = timerlist.concat(Array(targetList.length - timerlist.length).fill(0));
			}
			if (!formsexe) {
				formsexe = ns.fileExists("Formulas.exe", "home");
				if (formsexe) {
					for (const target of masterlist) { ns.scriptKill("manhack.js", target); }
					for (let i = 0; i < pidList.length; i++) { pidList[i] = 0; }
				}
			}
		}
	}
}