var map, heatmap;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    zoom: 2,
    center: {lat: 40.386965, lng: 3.340445},
    dissipating:true
  });
  heatmap = new google.maps.visualization.HeatmapLayer({
    map: map,
    maxIntensity: 25
  });
  viewAfter()
}

function viewAfter(){
  getTweets("/after.json");
  $("#legend").text("Locations of Users before of Euro2016")
}

function viewOpenning(){
  getTweets("/openning.json");
  $("#legend").text("Locations of Users in Openning Day Euro2016")
}


function view1stWeek(){
  getTweets("/1stweek.json");
  $("#legend").text("Locations of Users during 1st week Euro2016")
}

function view2ndWeek(){
  getTweets("/2ndweek.json");
  $("#legend").text("Locations of Users during 2nd week Euro2016")
}

function view3rdWeek(){
  getTweets("/3rdweek.json");
   $("#legend").text("Locations of Users during 3rd week Euro2016")
}

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeGradient() {
  var gradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)'
  ]
 heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function changeRadius(radius) {
  heatmap.set('radius',15);
}

function changeOpacity() {
  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
}

function addStades(response){
  console.log("obtener estados")
  var stades = response.stades;
  console.log(response);
  var marker
  for(var i in stades){
    var location = new google.maps.LatLng(stades[i].lat,stades[i].lng);
    marker = new google.maps.Marker({
      position: location,
      title: stades[i].name,
      map: map
    })
    google.maps.event.addListener(marker , 'click', function(){
      var infowindow = new google.maps.InfoWindow({
        content: marker.title,
        position: marker.position,
      });
      infowindow.open(map);
    });
  }
}

function getTweets(url){
  $.getJSON(url,function(response){
    var array = [];
    for(var i in response.tweets){
      var location = response.tweets[i].coordinates;
      array.push(new google.maps.LatLng(parseFloat(location.latitud),parseFloat(location.longitud)))
    }
    heatmap.setData(array);
    changeRadius(radius);
  });
}
/*
function getTweets(url){
  var callback = function(response){
      console.log(response);
      var tweets = [];
      for(var i in response){
        var location = response[i];
        console.log(location)
        tweets.push(new google.maps.LatLng(location.lat,location.lng))
      }
      console.log(tweets)
      heatmap = new google.maps.visualization.HeatmapLayer({
          data: tweets,
          map: map,
          maxIntensity: 25
      });
      changeRadius();
  }
  $.ajax({ url: url , type:  'get', success: callback });
}*/

function getPointsFromDB(){
  var tweets = [];
  
  var callback = function(response){
    var docs = response.tweets;
    var new_page = response.page;
    if(docs.length>0){
      for(var i in docs){
        var location = docs[i];
        tweets.push(new google.maps.LatLng(location.lat,location.lng))
      }
    }
    if (new_page != -1){
      $.ajax({ 
        url:'/getTweetsPerPage/' + new_page, 
        type:  'get', 
        success: callback 
      });
    }else{
      console.log("empieza animacion");
      console.log(tweets.length)
      heatmap = new google.maps.visualization.HeatmapLayer({    
        data: tweets,
        map: map,
        maxIntensity: 25
      });
      changeRadius();
      return;
    }
  }

  var page = 1;

  $.ajax({
    url:'/getTweetsPerPage/' + page, 
    type:  'get', 
    success: callback 
  });
}