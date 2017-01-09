var app = angular.module('BookUI', []);

app.service('bookSvc', function($http) {
  this.getBooks = function(){
	  		$http.get("https://bookservice.run.aws-usw02-pr.ice.predix.io/books").then(function (response) {
	        return "test";
	    });
  	};
});