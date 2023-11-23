import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	ns.print("populating masterlist...");
	let formsexe = ns.fileExists("Formulas.exe", "home");
	let masterlist = ["home"];
	for (const scantarg of masterlist) {
		let workinglist = ns.scan(scantarg);
		for (const target of workinglist) {
			if (!masterlist.includes(target)) {
				for (const fn of [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject, ns.nuke]) try { fn(target) } catch { }
				if (ns.hasRootAccess(target)) { masterlist.push(target); }
			}
		}
	}
	masterlist = masterlist.slice(1);
	ns.print("killing old subscripts...");
	for (const target of masterlist) {
		ns.scriptKill("manhack.js", target);
		ns.scriptKill("mangrow.js", target);
		ns.scriptKill("manweaken.js", target);
	}
	ns.print("populating RAM servers...");
	let ramlist = [];
	for (const target of masterlist) {
		if (ns.getServerMaxRam(target) > 0) {
			ramlist.push(target);
			ns.scp("manhack.js", target);
			ns.scp("mangrow.js", target);
			ns.scp("manweaken.js", target);
		}
	}
	ns.print("populating hack servers...");
	let targetList = [];
	let moneyList = [];
	let securityList = [];
	for (const target of masterlist) {
		if (ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel()) {
			if (ns.getServerMaxMoney(target) > 0) {
				targetList.push(target);
				moneyList.push(ns.getServerMaxMoney(target) * 0.75);
				securityList.push(ns.getServerMinSecurityLevel(target) + 5);
			}
		}
	}
	ns.print("creating PID and timer arrays...");
	let pidList = Array(targetList.length).fill(0);
	let timerlist = Array(targetList.length).fill(0);
	ns.print("beginning main loop");
	let loopcount = 0;
	while (true) {
		for (let i = 0; i < targetList.length; i++) {
			let target = targetList[i];
			if (!ns.isRunning(pidList[i])) {
				let moneyThresh = moneyList[i];
				let securityThresh = securityList[i];
				let mostfreeram = 0;
				let ramserver = ramlist[0];
				for (let m = 0; m < ramlist.length; m++) {
					let freeram = ns.getServerMaxRam(ramlist[m]) - ns.getServerUsedRam(ramlist[m]);
					if (freeram > mostfreeram) {
						mostfreeram = freeram;
						ramserver = ramlist[m];
					}
				}
				let maxthreads = Math.trunc(mostfreeram / 2);
				if (ns.getServerSecurityLevel(target) > securityThresh) {
					let weakengoal = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);
					let threadcount = 1;
					while (ns.weakenAnalyze(threadcount) < weakengoal) { threadcount++; }
					threadcount = Math.min(threadcount, maxthreads);
					if (formsexe) {
						timerlist[i] = ns.formulas.hacking.weakenTime(ns.getServer(target), ns.getPlayer());
						ns.print("weakening " + target + " for " + Math.trunc(timerlist[i]) + "ms");
						ns.print("on " + ramserver + " with " + threadcount + " threads");
					} else { ns.print("weakening " + target + " with " + threadcount + " threads on " + ramserver); }
					pidList[i] = ns.exec("manweaken.js", ramserver, threadcount, target);
				} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
					let threadcount = 1;
					if (ns.getServerMoneyAvailable(target) < 10) { threadcount = maxthreads; }
					else {
						if (formsexe) { threadcount = ns.formulas.hacking.growThreads(ns.getServer(target), ns.getPlayer(), Infinity); }
						else {
							let growthgoal = ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target);
							threadcount = Math.ceil(ns.growthAnalyze(target, growthgoal));
						}
						threadcount = Math.min(maxthreads, threadcount);
					}
					if (formsexe) {
						timerlist[i] = ns.formulas.hacking.growTime(ns.getServer(target), ns.getPlayer());
						ns.print("growing " + target + " for " + Math.trunc(timerlist[i]) + "ms");
						ns.print("on " + ramserver + " with " + threadcount + " threads");
					} else { ns.print("growing " + target + " with " + threadcount + " threads on " + ramserver); }
					pidList[i] = ns.exec("mangrow.js", ramserver, threadcount, target);
				} else {
					let hackgoal = ns.getServerMaxMoney(target) - moneyThresh;
					let threadcount = Math.ceil(ns.hackAnalyzeThreads(target, hackgoal));
					threadcount = Math.min(threadcount, maxthreads);
					if (formsexe) {
						timerlist[i] = ns.formulas.hacking.hackTime(ns.getServer(target), ns.getPlayer());
						ns.print("hacking " + target + " for " + Math.trunc(timerlist[i]) + "ms");
						ns.print("on " + ramserver + " with " + threadcount + " threads");
					} else { ns.print("hacking " + target + " with " + threadcount + " threads on " + ramserver); }
					pidList[i] = ns.exec("manhack.js", ramserver, threadcount, target);
				}
			}
		}
		if (formsexe) {
			let lowestms = Infinity;
			for (const listtime of timerlist) { if (listtime < lowestms) { lowestms = listtime; } }
			await ns.sleep(lowestms);
		} else {
			let looping = true;
			while (looping) {
				let pidcount = 0;
				for (const pidc of pidList) { if (ns.isRunning(pidc)) { pidcount++; } }
				if (pidcount == pidList.length) { await ns.sleep(5000); }
				else { looping = false; }
			}
		}
		if (loopcount > 24) {
			ns.print("updating masterlist...");
			masterlist.unshift("home");
			for (const scantarg of masterlist) {
				let workinglist = ns.scan(scantarg);
				for (const target of workinglist) {
					if (!masterlist.includes(target)) {
						for (const fn of [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject, ns.nuke]) try { fn(target) } catch { }
						if (ns.hasRootAccess(target)) { masterlist.push(target); }
					}
				}
			}
			masterlist = masterlist.slice(1);
			ns.print("updating RAM servers...");
			for (const target of masterlist) {
				if (!ramlist.includes(target)) {
					if (ns.getServerMaxRam(target) > 0) {
						ramlist.push(target);
						ns.scp("manhack.js", target);
						ns.scp("mangrow.js", target);
						ns.scp("manweaken.js", target);
					}
				}
			}
			ns.print("updating hack servers...");
			for (const target of masterlist) {
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
			ns.print("updating PID and timer arrays...");
			if (pidList.length < targetList.length) {
				pidList = pidList.concat(Array(targetList.length - pidList.length).fill(0));
				timerlist = timerlist.concat(Array(targetList.length - timerlist.length).fill(0));
			}
			if (!formsexe) {
				ns.print("checking for Formulas.exe...");
				formsexe = ns.fileExists("Formulas.exe", "home");
				if (formsexe) {
					ns.print("Formulas.exe found! wiping subscripts and PID array...");
					for (const target of masterlist) {
						ns.scriptKill("manhack.js", target);
						ns.scriptKill("mangrow.js", target);
						ns.scriptKill("manweaken.js", target);
					}
					for (let i = 0; i < pidList.length; i++) { pidList[i] = 0; }
				}
			}
			loopcount = 0;
		} else {
			loopcount++;
			ns.print("loop count: " + loopcount);
		}
	}
}