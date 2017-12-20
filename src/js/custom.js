jQuery(document).ready(function () {

	let myMap;

    function getCoordinates(person) {

    	return ymaps.geocode(person.city.title)
    		.then(data => {
    			person.coord = data.geoObjects.toArray()[0].geometry._coordinates;
    		  	return person;
    		});

    }

    function setMark(frends) {
    	frends.forEach(frend => {

    		if (frend) {
				let Placemark = new ymaps.Placemark(frend.coord, {
			        hintContent: `<img src='${frend.photo_100}'><p>${frend.first_name}</p>`,
			        balloonContent: `${frend.first_name}`
			    });

			    myMap.geoObjects.add(Placemark);
   			}
		})
    }

	function initMap(){ 
        myMap = new ymaps.Map("map", {
            center: [55.76, 37.64],
            zoom: 2
        }); 
    }

	function vkIni() {
		return new Promise((resolve, reject) => {
			VK.init({
				apiId: 6288637
			});

			VK.Auth.login(data => {
				if (data.session) {
					resolve(data);
				} else {
					reject(new Error('No access'));
				}
			}, 8);
		});
	}

	function vkApi() {

		return new Promise((resolve, reject) => {

			VK.api('friends.get', {fields: 'nickname, city, country, photo_100', v: 5.68}, data => { 
				if (data.error) {
					reject(new Error(data.error.error_msg));
				} else {
					resolve(data.response);
				}
			});
		});
	}
			

    new Promise(resolve => ymaps.ready(resolve))
    	.then(() => initMap())
    	.then(() => vkIni())
    	.then((data) => vkApi(data))
    	.then((data) =>  {
    		let frends = data.items;

    		let promises = frends.map(person => {
    			if (person.hasOwnProperty('city')) {
					return getCoordinates(person);
				}
    		})

    		return Promise.all(promises)
    	})
    	.then((frends) => {
    		 setMark(frends);
    	})
    	.catch(e => alert(e.message));
});
