const router = require("express").Router();
const subvn = require("sub-vn");
//get all provinces

const convertData = (data) => {
  return data.map((item) => ({ label: item.name, code: item.code }));
};
router.get("/", async (req, res) => {
  try {
    const data = await subvn.getProvinces();

    res.json({ provinces: convertData(data) });
  } catch (error) {
    res.status(500).json(error);
  }
});

//get Districts By ProvinceCode
router.get("/districts", (req, res) => {
  const provinceCode = req.query.provinceCode;
  try {
    const data = subvn.getDistrictsByProvinceCode(provinceCode);
    res.json({ districts: convertData(data) });
  } catch (error) {
    res.status(500).json(error);
  }
});

//getWardsByDistrictCode(districtCode)
router.get("/wards", (req, res) => {
  const districtCode = req.query.districtCode;
  const data = subvn.getWardsByDistrictCode(districtCode);
  res.json({ wards: convertData(data) });
  try {
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
