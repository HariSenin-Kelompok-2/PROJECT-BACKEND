const { Router } = require("express");
const router = Router();

const routes = [require("./users.routes"),
               require("./category.routes"), 
               require("./region.routes"),
               require("./product.routes")];
for (const route of routes) {
  router.use("/api", route);
}

module.exports = router;
