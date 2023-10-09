/** Convert Danish month salary to other currencies & units of time */
import {
	makeQuestion, ask,
	slashPath, typeOf, intersect, inArr1NinArr2, subObj, dbgPath, compareArrays, GenObj, asNumeric,
} from 'pk-ts-node-lib';

/*
Assumptions:
5 work days per week
7.5 work hours per day
21.67 work days in a month
4.33 weeks in a month
52 weeks/year
*/


/** Amt of DKK per currency unit */
const exRates = {
	dkk: 1,
	gbp: 8.6,
	usd: 7.07,
	eur: 7.46,
};

const periods:GenObj = { //in hours
		hour: 1,
		day: 7.5,
	};
	periods.week = 5 * periods.day;
	periods.month = 21.67 * periods.day;
	periods.year = 52 * periods.week;


function convertToDkkHr(amt, cur, per) {
	let hrs = parseFloat(periods[per]);
	let exRate = parseFloat(exRates[cur]);
	let dkkHr = parseFloat(amt) * exRate/ hrs; 
	return dkkHr;
}

/**
 * Takes a salary amount, currency & time-period (ex: 70,000 DKK/Month) and
 * returns object keyed by currency & period for all equivalents - gbp/week, usd/hr, etc
 */
function equivs({ iAmt = 70000, iPer = 'month', iCur = 'dkk' } = {}) {
	//console.log({ iAmt, iCur, iPer });
	let dkhr = convertToDkkHr(iAmt, iCur, iPer);
	let res:GenObj = {};
	for (let curr in exRates) {
		let rate = exRates[curr];
		res[curr] = {};
		for (let per in periods) {
			let hrs = periods[per];
	//@ts-ignore
			res[curr][per] = parseInt((.5 + hrs * dkhr / rate).toString()) ;
		}
	}
	/*
	console.log({
		 exRates, periods,  dkhr, res,
	});
	*/
	return res;
}

async function tstask() {
	let currKeys = Object.keys(exRates);
	let defCurr = 'dkk';
	let perKeys = Object.keys(periods);
	let defPer = 'month';
	let defAmt = 70000;

	let aprompt = `
	  Takes a salary amount, currency [${currKeys.join(', ')}], & period [${perKeys.join(', ')}], and converts to equivalent 
		in all currencies & periods. Enter the prompts:
	`;

	console.log(aprompt);
	let iCur = await ask('What Currency?', { type: 'list', def: 'eur', choices: currKeys });
	let iPer =  await ask('What Time-period?', { type: 'list', def: 'month', choices: perKeys });
	let iAmt =  await ask('What Amount?', { type:'number', def: defAmt});
	let inpSalary = { iCur, iAmt, iPer };
	let eqRes = equivs(inpSalary);

	console.log({ inpSalary, eqRes });
	return eqRes;
}

async function amain() {
	 equivs();
	console.log("Returned from async amain");
}

//await amain();
await tstask();

