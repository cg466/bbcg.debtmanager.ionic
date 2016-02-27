// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

angular.module('karz', ['ionic','karz.controllers','ngCordova','ngResource'])
.constant('ApiEndPoint', {
 url: 'http://localhost:8100/'
    // url: 'http://bbcgdebttracker.herokuapp.com/'
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/groups_menu.html',
    controller: 'MenuCtrl'
  })
  
  .state('app.signIn', {
    url: '/signIn',
    
	views: {
      'menuContent': {
		templateUrl: 'templates/signIn.html',
		controller: 'SignInCtrl'
      }
    }
  })
  
  .state('app.debtSummary', {
    url: '/debtSummary',
      views: {
      'menuContent': {
        templateUrl: 'templates/debtSummary.html',
		controller: 'DebtSummaryCtrl'
		
      }
    }
  })
  
  

  
  .state('app.personList', {
    url: '/personList',
      views: {
      'menuContent': {
        templateUrl: 'templates/personList.html',
          controller: 'PersonListCtrl'
      }
    }
  })
  
  .state('app.transactionList', {
    url: '/transactionList',
      views: {
      'menuContent': {
        templateUrl: 'templates/transactionList.html',
          controller: 'TransactionListCtrl'
      }
    }
  })
  
  // if none of the above states are matched, use this as the fallback

 $urlRouterProvider.otherwise('/app/debtSummary');
    // $urlRouterProvider.otherwise('/app/signIn');


});

