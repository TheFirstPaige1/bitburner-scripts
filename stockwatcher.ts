import { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	ns.tail();
	const pricedev = 2;
	const moneybuffer = 1000000;
	const stocknames = ns.stock.getSymbols();
	let stockhistory = [];
	for (let i = 0; i < stocknames.length; i++) {
		stockhistory.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	}
	let updatecount = 0;
	ns.print("building stock price history for 20 updates");
	while (updatecount < 20) {
		for (let i = 0; i < stocknames.length; i++) {
			stockhistory[i].unshift(ns.stock.getPrice(stocknames[i]));
			stockhistory[i].pop();
		}
		while (stockhistory[0][0] == ns.stock.getPrice(stocknames[0])) {
			await ns.sleep(500);
		}
		updatecount++;
		ns.print("WSE ticked, update " + updatecount + "/20");
	}
	let hottrend = 0;
	let newtrend = 0;
	while (true) {
		for (let i = 0; i < stocknames.length; i++) {
			let stocksym = stocknames[i];
			let spendingmoney = Math.max(((ns.getServerMoneyAvailable("home") - moneybuffer) * 0.25), 0);
			let stockprice = ns.stock.getPrice(stocksym);
			stockhistory[i].unshift(stockprice);
			stockhistory[i].pop();
			let avcalc = [0, 0, 0];
			for (let j = 0; j < 5; j++) {
				avcalc[0] = avcalc[0] + stockhistory[i][j];
			}
			avcalc[0] = avcalc[0] / 5;
			for (let j = 0; j < 10; j++) {
				avcalc[1] = avcalc[1] + stockhistory[i][j];
			}
			avcalc[1] = avcalc[1] / 10;
			for (let j = 10; j < 20; j++) {
				avcalc[2] = avcalc[2] + stockhistory[i][j];
			}
			avcalc[2] = avcalc[2] / 10;
			hottrend = (100 * (avcalc[0] / avcalc[2])) - 100;
			newtrend = (100 * (avcalc[1] / avcalc[2])) - 100;
			let stockposition = ns.stock.getPosition(stocksym);
			if (stockposition[0] == 0 && spendingmoney > moneybuffer) {
				let purchasecount = Math.trunc(spendingmoney / stockprice);
				purchasecount = Math.min(purchasecount, ns.stock.getMaxShares(stocksym));
				if (hottrend > pricedev) {
					ns.print(stocksym + " hot: %" + ns.formatNumber(hottrend));
					ns.print("purchase of " + purchasecount + " stocks at $" + Math.trunc(stockprice));
					ns.stock.buyStock(stocksym, purchasecount);
				} else if (newtrend > pricedev) {
					ns.print(stocksym + " new: %" + ns.formatNumber(newtrend));
					ns.print("purchase of " + purchasecount + " stocks at $" + Math.trunc(stockprice));
					ns.stock.buyStock(stocksym, purchasecount);
				}
			} else if (stockposition[0] > 0) {
				let salecount = stockposition[0];
				if (hottrend < (-1 * pricedev)) {
					ns.print(stocksym + " hot: %" + ns.formatNumber(hottrend));
					ns.print("sale of " + salecount + " at $" + Math.trunc(stockprice));
					ns.print("profit: $" + ns.formatNumber(ns.stock.getSaleGain(stocksym, salecount, "Long")));
					ns.stock.sellStock(stocksym, salecount);
				} else if (newtrend < (-1 * pricedev)) {
					ns.print(stocksym + " new: %" + ns.formatNumber(newtrend));
					ns.print("sale of " + salecount + " at $" + Math.trunc(stockprice));
					ns.print("profit: $" + ns.formatNumber(ns.stock.getSaleGain(stocksym, salecount, "Long")));
					ns.stock.sellStock(stocksym, salecount);
				}
			}
		}
		while (stockhistory[0][0] == ns.stock.getPrice(stocknames[0])) {
			await ns.sleep(500);
		}
	}
}