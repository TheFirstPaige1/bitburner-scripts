import { NS } from "@ns";
import { howTheTurnsTable, masterLister, thereCanBeOnlyOne } from "./bitlib";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	thereCanBeOnlyOne(ns);
	let formsexe = ns.fileExists("Formulas.exe", "home");
	let masterlist = masterLister(ns);
	for (const target of masterlist) { ns.scriptKill("manhack.js", target); }
	let ramlist = masterlist.filter(server => ns.getServerMaxRam(server) > 0);
	for (const target of ramlist) { ns.scp("manhack.js", target); }
	let targetList = masterlist.filter(server => (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) && (ns.getServerMaxMoney(server) > 0));
	let hacklist = [];
	for (const target of targetList) {
		hacklist.push({
			name: target,
			money: ns.getServerMoneyAvailable(target),
			security: ns.getServerSecurityLevel(target),
			ramServ: "",
			hackOp: "",
			threads: 0,
			pid: 0,
			timer: 0
		});
	}
	while (true) {
		for (let i = 0; i < hacklist.length; i++) {
			let target = hacklist[i].name;
			if (!ns.isRunning(hacklist[i].pid)) {
				hacklist[i].money = ns.getServerMoneyAvailable(target);
				hacklist[i].security = ns.getServerSecurityLevel(target);
				let ramserver = ramlist[0];
				let freeram = Math.max(0, ns.getServerMaxRam(ramserver) - ns.getServerUsedRam(ramserver) - Math.max(Math.trunc(ns.getServerMaxRam(ramserver) / 4), 128));
				let mostfreeram = freeram;
				for (let m = 1; m < ramlist.length; m++) {
					freeram = ns.getServerMaxRam(ramlist[m]) - ns.getServerUsedRam(ramlist[m]);
					if (ramlist[m].includes("hacknet")) { freeram = Math.trunc(ns.getServerMaxRam(ramlist[m]) / 2) - ns.getServerUsedRam(ramlist[m]); }
					if (freeram > mostfreeram) {
						mostfreeram = freeram;
						ramserver = ramlist[m];
					}
				}
				let maxthreads = Math.trunc(mostfreeram / 2);
				if (maxthreads > 0) {
					hacklist[i].ramServ = ramserver;
					if (ns.getServerSecurityLevel(target) > (ns.getServerMinSecurityLevel(target) + 5)) {
						hacklist[i].hackOp = "weaken";
						let weakengoal = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);
						let threadcount = 1;
						while (ns.weakenAnalyze(threadcount, ns.getServer(ramserver).cpuCores) < weakengoal) { threadcount++; }
						threadcount = Math.min(threadcount, maxthreads);
						hacklist[i].threads = threadcount;
						if (formsexe) {
							hacklist[i].timer = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer());
							//ns.print("weakening " + target + " for " + Math.trunc(hacklist[i].timer) + "ms");
							//ns.print("on " + ramserver + " with " + threadcount + " threads");
						} else { /*ns.print("weakening " + target + " with " + threadcount + " threads on " + ramserver);*/ }
						hacklist[i].pid = ns.exec("manhack.js", ramserver, threadcount, 0, target);
					} else if (ns.getServerMoneyAvailable(target) < (ns.getServerMaxMoney(target) * 0.75)) {
						hacklist[i].hackOp = "grow";
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
						hacklist[i].threads = threadcount;
						if (formsexe) {
							hacklist[i].timer = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer());
							//ns.print("growing " + target + " for " + Math.trunc(hacklist[i].timer) + "ms");
							//ns.print("on " + ramserver + " with " + threadcount + " threads");
						} else { /*ns.print("growing " + target + " with " + threadcount + " threads on " + ramserver);*/ }
						hacklist[i].pid = ns.exec("manhack.js", ramserver, threadcount, 1, target);
					} else {
						hacklist[i].hackOp = "hack";
						let hackgoal = ns.getServerMoneyAvailable(target) * 0.9;
						let threadcount = Math.trunc(ns.hackAnalyzeThreads(target, hackgoal));
						threadcount = Math.min(threadcount, maxthreads);
						hacklist[i].threads = threadcount;
						if (formsexe) {
							hacklist[i].timer = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer());
							//ns.print("hacking " + target + " for " + Math.trunc(hacklist[i].timer) + "ms");
							//ns.print("on " + ramserver + " with " + threadcount + " threads");
						} else { /*ns.print("hacking " + target + " with " + threadcount + " threads on " + ramserver);*/ }
						hacklist[i].pid = ns.exec("manhack.js", ramserver, threadcount, 2, target);
					}
				}
			}
		}
		ns.clearLog();
		ns.printRaw(howTheTurnsTable(ns, {
			name: "string",
			money: "number",
			security: "integer",
			ramServ: "string",
			hackOp: "string",
			threads: "string",
			pid: "string",
			timer: "duration"
		}, hacklist));
		if (formsexe) {
			let lowestms = Infinity;
			for (const hackservs of hacklist) { if (hackservs.timer < lowestms) { lowestms = hackservs.timer; } }
			for (let i = 0; i < hacklist.length; i++) { hacklist[i].timer = hacklist[i].timer - lowestms; }
			await ns.sleep(lowestms + 1);
		} else {
			let looping = true;
			while (looping) {
				let pidcount = 0;
				for (const hackservs of hacklist) { if (ns.isRunning(hackservs.pid)) { pidcount++; } }
				if (pidcount == hacklist.length) { await ns.sleep(5000); }
				else { looping = false; }
			}
		}
		let checklist = masterLister(ns);
		if (checklist.length > masterlist.length) { for (const server of checklist) { if (!masterlist.includes(server)) { masterlist.push(server); } } }
		for (const target of masterlist) {
			if ((!ramlist.includes(target)) && (ns.getServerMaxRam(target) > 0)) {
				ramlist.push(target);
				ns.scp("manhack.js", target);
			}
			if ((!targetList.includes(target)) && (ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel()) && (ns.getServerMaxMoney(target) > 0)) {
				targetList.push(target);
				hacklist.push({
					name: target,
					money: ns.getServerMoneyAvailable(target),
					security: ns.getServerSecurityLevel(target),
					ramServ: "",
					hackOp: "",
					threads: 0,
					pid: 0,
					timer: 0
				});
			}
		}
		if (!formsexe) {
			formsexe = ns.fileExists("Formulas.exe", "home");
			if (formsexe) { for (const target of masterlist) { ns.scriptKill("manhack.js", target); } }
		}
	}
}