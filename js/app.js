/*========== M O D E L =============*/
var model = [
  {
    name: "Sukhna Lake",
		lat: 30.7333304 ,
		lng: 76.8166634,
		show: true,
		selected: false,
		venueid: "5204feb1498ed42a61bafb61"
  },
  {
    name: "Rose Garden",
		lat: 30.7461143,
		lng: 76.7819774,
		show: true,
		selected: false,
		venueid: "4c0ba827009a0f47975cebbf"
  },
  {
    name: "Rock Garden",
		lat: 30.752535,
		lng: 76.8101038,
		show: true,
		selected: false,
		venueid: "4b6fe660f964a5206dff2ce3"
  },
  {
    name: "Chattbir zoo",
		lat: 30.603913,
		lng: 76.792463,
		show: true,
		selected: false,
		venueid: "4f531694e4b07e4c63681170"
  },
  {
    name: "Pinjore Garden",
		lat: 30.7940877,
		lng: 76.9147109,
		show: true,
		selected: false,
		venueid: "50f2dd31e4b0ff7d3253b877"
  },
  {
    name: "Elante Mall",
		lat: 30.7055869,
		lng: 76.80127089999999,
		show: true,
		selected: false,
		venueid: "5114cd90e4b06bb0ed15a97f"
  },
  {
    name: "Government Museum and Art Gallery",
		lat: 30.7489118,
		lng: 76.78746749999999,
		show: true,
		selected: false,
		venueid: "4e746a9a62e1263515eed5d9"
  },
  {
    name: "Chandigarh Capitol Complex",
		lat: 30.756714,
		lng: 76.8021677,
		show: true,
		selected: false,
		venueid: "4e97f82261af7d268f13d826"
  },
  {
    name: "Open Hand Monument",
		lat: 30.7564556,
		lng: 76.80193810000002,
		show: true,
		selected: false,
		venueid: "4d81ab1abede5481126003d1"
  },
  {
    name: "International Dolls Museum",
		lat: 30.7416365,
		lng: 76.7708432,
		show: true,
		selected: false,
		venueid: "4e746a9a62e1263515eed5d9"
  }
];

/*====== View Model =========*/

var viewModel = function() {

  var self = this;

  self.errorDisplay = ko.observable('');

  // populate mapList with each Model
  self.mapList = [];
  model.forEach(function(marker){
    self.mapList.push(new google.maps.Marker({
      position: {lat: marker.lat, lng: marker.lng},
      map: map,
      name: marker.name,
      show: ko.observable(marker.show),  // sets observable for checking
      selected: ko.observable(marker.selected),
      venueid: marker.venueid,   // foursquare venue id
      animation: google.maps.Animation.DROP
    }));
  });

  //store mapList length
  self.mapListLength = self.mapList.length;

  //set current map item
  self.currentMapItem = self.mapList[0];

  // function to make marker bounce but stop after 700ms
  self.makeBounce = function(marker){
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null);}, 700);
  };

  // function to add API information to each marker
  self.addApiInfo = function(passedMapMarker){
      $.ajax({
        url: "https://api.foursquare.com/v2/venues/" + passedMapMarker.venueid + '?client_id=CGOJQ1C3N5GARA4Q53TWRBUWARWXRPEXEG1KM1CCVFDWO2VA&client_secret=OQXLE0UEJOKJLGOM0AT5NA5JE10AXSFNS3GT1PKJGCQ3JJM2&v=20160614',
        dataType: "json",
        success: function(data){
          // stores results to display likes and ratings
          var result = data.response.venue;

          // add likes and ratings to marker
          passedMapMarker.likes = result.hasOwnProperty('likes') ? result.likes.summary: "";
          passedMapMarker.rating = result.hasOwnProperty('rating') ? result.rating: "";
        },
        //alert if there is error in recievng json
        error: function(e) {
          self.errorDisplay("Foursquare data is unavailable. Please try again later.");
        }
      });
  };

  // iterate through mapList and add marker event listener and API information
  for (var i=0; i < self.mapListLength; i++){

    (function abc(passedMapMarker){
    	self.addApiInfo(passedMapMarker);
			//add the click event listener to mapMarker
		passedMapMarker.addListener('click', function(){
				//set this mapMarker to the "selected" state
		self.setSelected(passedMapMarker);
			});
	})
		
(self.mapList[i]);
  }

  // create a filter observable for filter text
  self.filterText = ko.observable('');


  // calls every keydown from input box
  self.applyFilter = function() {

    var currentFilter = self.filterText();
    infowindow.close();

    //filter the list as user seach
    if (currentFilter.length === 0) {
			self.setAllShow(true);
		} else {
			for (var i = 0; i < self.mapListLength; i++) {
				if (self.mapList[i].name.toLowerCase().indexOf(currentFilter.toLowerCase()) > -1) {
					self.mapList[i].show(true);
					self.mapList[i].setVisible(true);
				} else {
					self.mapList[i].show(false);
					self.mapList[i].setVisible(false);
				}
			}
    }
    infowindow.close();
  };

  // to make all marker visible
  self.setAllShow = function(showVar) {
    for (var i = 0; i < self.mapListLength; i++) {
      self.mapList[i].show(showVar);
      self.mapList[i].setVisible(showVar);
    }
  };

  self.setAllUnselected = function() {
		for (var i = 0; i < self.mapListLength; i++) {
			self.mapList[i].selected(false);
		}
	};

  self.setSelected = function(location) {
		self.setAllUnselected();
        location.selected(true);

        self.currentMapItem = location;

        formattedLikes = function() {
        	if (self.currentMapItem.likes === "" || self.currentMapItem.likes === undefined) {
        		return "No likes to display";
        	} else {
        		return "Location has " + self.currentMapItem.likes;
        	}
        };

        formattedRating = function() {
        	if (self.currentMapItem.rating === "" || self.currentMapItem.rating === undefined) {
        		return "No rating to display";
        	} else {
        		return "Location is rated " + self.currentMapItem.rating;
        	}
        };

        var formattedInfoWindow = "<h5>" + self.currentMapItem.name + "</h5>" + "<div>" + formattedLikes() + "</div>" + "<div>" + formattedRating() + "</div>";

		infowindow.setContent(formattedInfoWindow);

        infowindow.open(map, location);
        self.makeBounce(location);
	};
};
