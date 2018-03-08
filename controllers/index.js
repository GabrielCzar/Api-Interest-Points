module.exports = function (app) {
	let cheerio = require('cheerio')
	,   request = require('request');

	return {
		index: function (req, res) {
			res.render('pt-index')
		},
		us_index: function (req, res) {
			res.render('us-index')
		},
		city: function (req, res) {
			let overpass = require('query-overpass')

			coord = req.params

			box = `${coord.ilat},${coord.ilon},${coord.flat},${coord.flon}`

			query = `
				node(${box})[amenity];out;
			 `.replace(/\s/g, '')

			overpass(query, (err, data) => {			
				if (data.hasOwnProperty('features')) {
					data = data.features

					let amenities = unique = [...new Set(data.map(value => value.properties.tags.amenity))];

					console.log('amenities >> ' + amenities.length);

					data = data.map(value => Object.assign({}, {
						id: value.properties.id
					,	amenity: value.properties.tags.amenity
					,	name: value.properties.tags.name || ''
					,	lat: value.geometry.coordinates[1]
					, 	lon: value.geometry.coordinates[0]
					})).filter(value =>	value['name'] !== '');

					console.log('interest points >> ' + data.length)

					res.json(data);
				} else 
					res.json([]);
			});

		},
		scrape_cities: function (req, res) {
			let OSM_URL = 'http://download.bbbike.org/osm/bbbike/'

			request(OSM_URL, function (err, rs, html) {
				if (!err) {
					let $ = cheerio.load(html);

					let list = $('tbody').first().children()

					let data = []
					Object.keys(list).forEach(key => {
						value = list[key]
						if (key !== '0' && value !== 'undefined' && value.hasOwnProperty('children'))
							data.push(value.children[0].children[0].children[0].data)
					})
					
					console.log('cities: ' + data.length)
					
					res.json(data)
				}
			})
		},
		scrape_location: function (req, res) {
			let params = req.params;
			let city = params.city

			let LOCATION_URL = `http://download.bbbike.org/osm/bbbike/${city}/${city}.poly`

			request(LOCATION_URL, function (err, rs, html) {
				if (!err) {
					let $ = cheerio.load(html);

					let data = $('body').first().text();
					data = data.split('\n').splice(2, 4);
					firstPoint = data[0].slice(3).split(' ').reverse().join().split(',,')
					lastPoint = data[2].slice(3).split(' ').reverse().join().split(',,')
					result = firstPoint.concat(lastPoint)

					res.json(result)
				}
			});
		}
	}
}
