
var app = angular.module('BookUI', []);


app.service('bookSvc', function($http) {
  this.getBooks = function(callback){
	  		$http.get("/books").then(function (response) {
	  			callback(response.data);
	    });
  	};
});

app.controller('BookList', function($scope, bookSvc) {
    bookSvc.getBooks(function(data){
    	$scope.books = data._embedded.books;
    })
});
