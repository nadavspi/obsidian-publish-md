const pipe = <T>(fn1: (a: T) => T, ...fns: Array<(a: T) => T>) =>
	fns.reduce((prevFn, nextFn) => (value) => prevFn(nextFn(value)), fn1);
export default pipe;
