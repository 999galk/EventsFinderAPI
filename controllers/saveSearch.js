const handleSaveSearch = (req,res,db,request, google, oAuth2Client) => {
	const { user, eventId, eventTitle, location, description, start, end} = req.body;
	const calendar = google.calendar({version: 'v3', auth: oAuth2Client});
	  var event = {
	    summary: eventTitle,
	    location: location,
	    description: description,
	    start: {
	      dateTime: start,
	      timeZone: 'America/Los_Angeles'
	    },
	    end: {
	      dateTime: end,
	      timeZone: 'America/Los_Angeles'
	    },
	    recurrence: ['RRULE:FREQ=DAILY;COUNT=1'],
	    reminders: {
	      useDefault: false,
	      overrides: [
	        { method: 'email', minutes: 24 * 60 },
	        { method: 'popup', minutes: 10 }
	      ]
	    }
	  };

	  calendar.events.insert(
	    {
	      auth: oAuth2Client,
	      calendarId: 'primary',
	      resource: event
	    },
	    function(err, event) {
	      if (err) {
	        console.log(
	          'There was an error contacting the Calendar service: ' + err
	        );
	        return res.status(400).json('incorrect save destails');
	      }
	      console.log('Event created: %s', event.htmlLink);
	      res.json(user);
	    }
	  );
}

module.exports = {
	handleSaveSearch : handleSaveSearch,
};