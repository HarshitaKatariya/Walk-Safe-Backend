const admin = require("../utils/firebase");
const axios = require("axios");

exports.addReview = async (req, res) => {
  try {
    const { areaName, score } = req.body;

    if (!areaName || score == null)
      return res.status(400).json({ error: "areaName and score required" });

    if (score < 0 || score > 10)
      return res.status(400).json({ error: "Score must be between 0 and 10" });

    const db = admin.database();
    const zonesRef = db.ref("zones");

    // 1️⃣ Check if zone already exists
    const snapshot = await zonesRef
      .orderByChild("areaName")
      .equalTo(areaName)
      .once("value");

    let zoneId;
    let zone;

    if (snapshot.exists()) {
      // ✅ Existing zone
      zoneId = Object.keys(snapshot.val())[0];
      zone = snapshot.val()[zoneId];
    } else {
      // 🆕 New zone → Get coordinates from Mapbox
      const mapboxToken = process.env.MAPBOX_TOKEN;
      const geo = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          areaName
        )}.json?access_token=${mapboxToken}`
      );

      if (!geo.data.features.length)
        return res.status(404).json({ error: "Invalid area name" });

      const { center } = geo.data.features[0];
      const [lng, lat] = center;

      // Create new zone in DB
      const newZoneRef = zonesRef.push();
      zoneId = newZoneRef.key;
      zone = {
        areaName,
        lat,
        lng,
        reviews: [],
        avgScore: 0,
        color: "green",
        createdAt: new Date().toISOString(),
      };

      await newZoneRef.set(zone);
    }

    // 2️⃣ Add new review
    const reviews = zone.reviews || [];
    reviews.push({
      userId: "anonymous",
      score,
    });

    // 3️⃣ Calculate new average
    const total = reviews.reduce((sum, r) => sum + r.score, 0);
    const avg = total / reviews.length;

    // 4️⃣ Decide color
    let color = "green";
    if (avg <= 3) color = "red";
    else if (avg <= 7) color = "yellow";

    // 5️⃣ Update zone data
    await db.ref(`zones/${zoneId}`).update({
      reviews,
      avgScore: avg,
      color,
    });

    res.status(200).json({
      message: snapshot.exists()
        ? "Review added and zone updated"
        : "Zone created and review added",
      zoneId,
      areaName,
      avgScore: avg,
      color,
    });
  }  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }

};
