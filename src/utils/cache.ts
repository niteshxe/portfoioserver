import NodeCache from "node-cache";

// Cache for 24 hours by default, but we will invalidate manually on CMS update
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 600 });

export default cache;
