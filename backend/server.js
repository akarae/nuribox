const app = require("./app");
const logger = require("./src/config/logger");

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`nuri-system backend listening on port ${PORT}`);
});
