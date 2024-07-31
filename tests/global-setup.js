const { rimraf } = require("rimraf");

module.exports = async () => {
	await rimraf("tests/output/**/*.*", { glob: true });
}
