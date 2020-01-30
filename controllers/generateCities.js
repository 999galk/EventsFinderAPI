const handleGetCities = (req,res,cities) => {
	const {code} = req.body;
    const allCities = cities.filter(city => {
        return city.country.match(code);
    })
    const citiesFinalList = allCities.map(obj => {
      return obj.name;
    });
    res.json(citiesFinalList);
	
}

module.exports = {
	handleGetCities : handleGetCities
};