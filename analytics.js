var request = require('request')

module.exports = function () {
	return new Analytics()
}


function Analytics() {
	var self = this
	self.get = function (site, fn) {
		var key = '38f1da95bee8d6d37b00f9d256437b4f';
		var url = 'http://api.chartbeat.com/live/toppages/v3/?apikey='+key+'&host='+site

		request({url: url, json: true}, function(error, reponse, data){
			if(error){
				return fn(error)
			}
			if(reponse.statusCode !== 200) {
				return fn(new Error('unexpected status' + response.statusCode))
			}

			fn(null, data)
		})
	}
}