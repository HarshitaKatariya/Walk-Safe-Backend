const admin = require("../utils/firebase");

exports.zones = async (req, res) => {
  try {
    const db = admin.database();
    const snapshot = await db.ref("zones").once("value");
    const zones = snapshot.val() || {};
    res.json(Object.values(zones)); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch zones" });
  }
};
