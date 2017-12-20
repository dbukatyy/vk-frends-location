'use strict';

jQuery(document).ready(function () {

	var myMap = void 0;

	function getCoordinates(person) {

		return ymaps.geocode(person.city.title).then(function (data) {
			person.coord = data.geoObjects.toArray()[0].geometry._coordinates;
			return person;
		});
	}

	function setMark(frends) {
		frends.forEach(function (frend) {

			if (frend) {
				var Placemark = new ymaps.Placemark(frend.coord, {
					hintContent: '<img src=\'' + frend.photo_100 + '\'><p>' + frend.first_name + '</p>',
					balloonContent: '' + frend.first_name
				});

				myMap.geoObjects.add(Placemark);
			}
		});
	}

	function initMap() {
		myMap = new ymaps.Map("map", {
			center: [55.76, 37.64],
			zoom: 2
		});
	}

	function vkIni() {
		return new Promise(function (resolve, reject) {
			VK.init({
				apiId: 6288637
			});

			VK.Auth.login(function (data) {
				if (data.session) {
					resolve(data);
				} else {
					reject(new Error('No access'));
				}
			}, 8);
		});
	}

	function vkApi() {

		return new Promise(function (resolve, reject) {

			VK.api('friends.get', { fields: 'nickname, city, country, photo_100', v: 5.68 }, function (data) {
				if (data.error) {
					reject(new Error(data.error.error_msg));
				} else {
					resolve(data.response);
				}
			});
		});
	}

	new Promise(function (resolve) {
		return ymaps.ready(resolve);
	}).then(function () {
		return initMap();
	}).then(function () {
		return vkIni();
	}).then(function (data) {
		return vkApi(data);
	}).then(function (data) {
		var frends = data.items;

		var promises = frends.map(function (person) {
			if (person.hasOwnProperty('city')) {
				return getCoordinates(person);
			}
		});

		return Promise.all(promises);
	}).then(function (frends) {
		setMark(frends);
	}).catch(function (e) {
		return alert(e.message);
	});
});