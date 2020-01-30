const handleGetCalendar = (req,res, request) => {
	const { cc, city} = req.params;
	console.log('got to calevents.js, details:', cc, city);
	if( !cc || !city ){
		return res.status(400).json('incorrect destails');
	}
	const fetchUrl = `https://app.ticketmaster.com/discovery/v2/events.json?countryCode=${cc}&apikey=BTAzLLcXX3xXtooi8WdIktbOn1C3irib`;
	console.log(fetchUrl);

	request({
	  method: 'GET',
	  url: fetchUrl,
	 headers: {
	    'Accept': 'application/json'
	  }}, function (error, response, body) {
	  // console.log('Status:', response.statusCode);
	  // console.log('Headers:', JSON.stringify(response.headers));
	  // console.log('Response:', body);
	  res.send(body);
	});
}

module.exports = {
	handleGetCalendar : handleGetCalendar
};