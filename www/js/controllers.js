angular.module('karz.controllers', [])

.controller('SignInCtrl',function($scope,$state,$ionicLoading, $ionicHistory,personsService,$rootScope){
	$rootScope.skipSignin=false;
	
	$scope.googleSignIn=function(){
		$ionicLoading.show({
			template:'Logging in...'
		});
		
		
		
		window.plugins.googleplus.login({},
			function(user_data){
				console.log("user_data");
				$rootScope.userData=user_data;
				
				personsService.getPersonByGmail(user_data.email).then(function(person){
                    
					$rootScope.activePerson=person;
					console.log("active person loaded");
					console.log(person.personId);
					$ionicLoading.hide();
					$rootScope.$broadcast('personAuthenticated');
					$rootScope.backButton=false;
					$ionicHistory.nextViewOptions({
						historyRoot: true
					});
					$state.go('app.debtSummary');
				});
				
				
				
			},
			function(msg){
				$ionicLoading.hide();
			}
		);
	};
	
	
})

.controller('MenuCtrl', function($scope, $ionicPopup,$ionicPlatform,$stateParams, $state,$cordovaNetwork,$ionicPopup,personsService,groupService,$rootScope,$ionicLoading,$ionicHistory) {
    //changes
     $ionicPlatform.registerBackButtonAction(function() {
		$rootScope.myGoBack();
    }, 100);
	$rootScope.$on('$cordovaNetwork:offline', 
					function(event, networkState){
						$ionicLoading.hide();
						$ionicPopup.alert({
							title: "Internet Disconnected",
							content: "No internet connection detected. Karz will now close."
						}).then(function(result) {
							ionic.Platform.exitApp();
						});
					}
	);
	
    if($rootScope.skipSignIn=true) {
		$ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
		personsService.getPerson(9).then(function(person){
			$rootScope.activePerson=person;
			console.log("active Person");
			console.log(person);		
			$rootScope.$broadcast('personAuthenticated');
			$ionicLoading.hide();
		});
	}
   
    $rootScope.numCharRow=14;
	$rootScope.heightPerRow=45;
	$rootScope.$on('personAuthenticated', function(event, args) {
		$ionicLoading.show({template: '<ion-spinner></ion-spinner>'});		
		console.log($rootScope.activePerson.personId);
		groupService.getGroups($rootScope.activePerson.personId).then(function(groups){
			$scope.groups=groups;
			console.log("groups");
			console.log(groups);
			$scope.selectGroup(groupService.getGroup(1));
			$ionicLoading.hide();
		});
	})
    
    
    
    $scope.selectGroup=function(group){
        
        $rootScope.activeGroup=group;
		$scope.menuTitleGroup = $rootScope.activeGroup.groupName;
        if($scope.activeGroup.persons[0].latestBalance.balanceAmount >= 0) {
			$scope.menuTitleBalance = "You owe "+$scope.returnCurrencyAmount($scope.activeGroup.persons[0].latestBalance.balanceAmount);
		}
		else {
			$scope.menuTitleBalance = "You are owed "+$scope.returnCurrencyAmount($scope.activeGroup.persons[0].latestBalance.balanceAmount);
		}
		
		
		console.log('latest balance');
		console.log($rootScope.activeGroup.persons[0].latestBalance.balanceAmount);
        
		console.log("group selected");
		console.log($rootScope.activeGroup);
        $rootScope.$broadcast('groupSelected');
	};
	
    $rootScope.returnCurrencyAmount=function(number) {
        var roundedNumber=Math.round(100*(Math.abs(number)))/100;
        return roundedNumber.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };
	
    $rootScope.getGoogleImageSrc=function(googleImageUrl,size){
				
		if (googleImageUrl!=null)
			return googleImageUrl+"="+size;
		else
			return "img/ic_contact_picture.png";
	};
	
	$rootScope.getCoverImgSrc=function(googleImageUrl){
				
		if (googleImageUrl!=null)
			return googleImageUrl;
		else
			return "img/ic_contact_picture.png";
	};
	
	$rootScope.getTransactionHeight=function(transaction,index){
		// var elmnt = document.getElementById("tranDesc");
		// $rootScope.tranHeightCalc=true;
		// $rootScope.tranHeightDescription=transaction.transactionDescription;
		// if(index<2) {
			// //console.log(elmnt.prop('offsetHeight'));
		// }
		// $rootScope.tranHeightCalc=false;
		if(index<20)
		{
		
			//console.log(transaction.transactionDescription+","+transaction.transactionDescription.length+","+Math.ceil((transaction.transactionDescription.length)/$rootScope.numCharRow)+","+Math.ceil((transaction.transactionDescription.length)/$rootScope.numCharRow )* $rootScope.heightPerRow);}
			//return Math.ceil((transaction.transactionDescription.length)/$rootScope.numCharRow )* $rootScope.heightPerRow;
			return 150;
		}
	}
    
    $rootScope.myGoBack = function() {
		$rootScope.backButton=false;
		// $ionicHistory.goBack();
		if ($state.is('app.debtSummary')) {
			ionic.Platform.exitApp();
		}
		else {
			$ionicHistory.goBack();
		}		
	};
    
    $rootScope.showHide = function() {
        
     return $rootScope.backButton;
  };
	
})

.controller('DebtSummaryCtrl', function($scope, $ionicHistory,$ionicModal, $stateParams, transactionDetailService, transactionService,groupService,settleUpService,$rootScope,$ionicLoading) {


	$rootScope.backButton=false;
	$rootScope.$on('groupSelected', function(event, args) {
		$ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
		$scope.transactions=null;
        console.log("Inside debt summary controller");	 transactionService.getTransactionsLite($rootScope.activePerson.personId,$scope.activeGroup.groupId,'Y',20).then(function(transactions){
			$scope.transactions=transactions;
			console.log($scope.transactions);
			$ionicLoading.hide();
		});
		$ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
		$scope.settleUps=null;
		settleUpService.getSettleUps($rootScope.activePerson.personId,$scope.activeGroup.groupId).then(function(settleUps){			
			$scope.settleUps=settleUps;
			console.log($scope.settleUps);
		});
		$ionicLoading.hide();
	});
	
	 $scope.selectTransaction=function(transaction) {
		
		$rootScope.transaction=transaction ; 
		console.log ('selected transaction');
		console.log("here Transaction details");    
		$ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
		$rootScope.transactionDetail=null;	
		transactionDetailService.getTransactionDetails($rootScope.transaction.tranId,$rootScope.activePerson.personId,$rootScope.activeGroup.groupId).then(function(transactionDetail){
			$rootScope.transactionDetail=transactionDetail;
			console.log(transactionDetail);
		});		
		$ionicLoading.hide();
			
		$scope.openModal();
	};
		

	
	$ionicModal.fromTemplateUrl('templates/transactionDetailsModal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function() {
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
  
	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});
	// Execute action on hide modal
	$scope.$on('modal.hidden', function() {
		// Execute action
	});
	// Execute action on remove modal
	$scope.$on('modal.removed', function() {
		// Execute action
	});
})    
       
.controller('PersonListCtrl', function($scope, $cordovaToast, $ionicPopup,$stateParams, personsService,transactionService,groupService,$rootScope, $ionicLoading) {
		// $ionicPopup.alert({
							// title: "Test",
							// content: angular.toJson($rootScope.userData)
						// }).then(function(result) {
							// ionic.Platform.exitApp();
						// });
						
	$cordovaToast.show(angular.toJson($rootScope.userData),'long','top');
	$cordovaToast.show($rootScope.userData.displayName,'long','bottom');
	$rootScope.backButton=true;		
	console.log("here Person list");    
	$ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
	$scope.persons=null;
	personsService.getBalances($rootScope.activePerson.personId,$rootScope.activeGroup.groupId,false).then(function(persons) {
		$scope.persons=persons;
		console.log(persons);
		$ionicLoading.hide();
	});
	$rootScope.$on('groupSelected', function(event, args) { 
		console.log("here Person list");    
		$ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
		$scope.persons=null;
		personsService.getBalances($rootScope.activePerson.personId,$rootScope.activeGroup.groupId,false).then(function(persons) {
			$scope.persons=persons;
			console.log(persons);
			$ionicLoading.hide();
		});
	});
})

.controller('TransactionListCtrl', function($scope, $stateParams, personsService,transactionService,transactionDetailService,groupService,$rootScope,$ionicModal,$ionicLoading) {
  $rootScope.backButton=true;	      
 $ionicModal.fromTemplateUrl('templates/transactionDetailsModal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function() {
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
  
	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});
	// Execute action on hide modal
	$scope.$on('modal.hidden', function() {
		// Execute action
	});
	// Execute action on remove modal
	$scope.$on('modal.removed', function() {
		// Execute action
	});
			
	console.log("here transaction list");
	$ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
	$scope.transactions=null;
	transactionService.getTransactions($rootScope.activePerson.personId,$rootScope.activeGroup.groupId,'Y').then(function(transactions){
		$scope.transactions=transactions;
		console.log($scope.transactions);
		$ionicLoading.hide();
	});
	
	$rootScope.$on('groupSelected', function(event, args) { 
		$ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
		$scope.transactions=null;
		transactionService.getTransactions($rootScope.activePerson.personId,$rootScope.activeGroup.groupId,'Y').then(function(transactions){
			$scope.transactions=transactions;
			console.log($scope.transactions);
			$ionicLoading.hide();
		});
	});
	
	$scope.selectTransaction=function(transaction) {
		$rootScope.transaction=transaction ; 
		console.log ('selected transaction');
		console.log("here Transaction details");    
		$ionicLoading.show({template: '<ion-spinner></ion-spinner>'});		
		$rootScope.transactionDetail=null;
		transactionDetailService.getTransactionDetails($rootScope.transaction.tranId,$rootScope.activePerson.personId,$rootScope.activeGroup.groupId).then(function(transactionDetail){
			$rootScope.transactionDetail=transactionDetail;
			console.log(transactionDetail);
		});	
		$ionicLoading.hide();				
		$scope.openModal();	
	};
}) 	
    
.factory('personsService', function($http,ApiEndPoint) {
    
    var persons;
	var person;
    var serviceName = "balances";
	var personServiceName="getPerson";
	var personByGoogleServiceName="personByGooglePerson";
    var parameter = "?personId=";
    var parameter2 = "&groupId=";
    var parameter3 = "&singleUser=";  
	var createPersonServiceName="createPerson";
    var nameParameter="?name=";
    
    var emailParameter="&email=";
    var gmailParameter= "?gmail=";
    var googleImageUrlParameter="&googleImageUrl=";
    var googleDisplayNameParameter="&googleDisplayName=";
    var googleGivenNameParameter="&googleGivenName=";
    var googleFamilyNameParameter="&googleFamilyName=";
    var inviteeParameter="&invitee=";
    
    return {
        
		getBalances: function(personId,groupId,singleUser){
            var url = ApiEndPoint.url + serviceName + parameter + personId + parameter2 + groupId + parameter3 + singleUser;
			return $http.get(url).then(function(response){
                persons=response.data;
               
                return persons;
            });
		},
		
		getPerson: function(personId){
            var url = ApiEndPoint.url + personServiceName + parameter + personId;
			
			return $http.get(url).then(function(response){
                person=response.data;               
                return person;
            });
		},
		getPersonByGmail: function(gmail){
            var url = ApiEndPoint.url + personByGoogleServiceName + gmailParameter + gmail;
			return $http.get(url).then(function(response){
                person=response.data;
               
                return person;
            });
		},
        createPerson: function(name,email,gmail,googleImageUrl,googleDisplayName,googleGivenName,googleFamilyName,invitee){
            var url = ApiEndPoint.url + createPersonServiceName +
                nameParameter + name +
                emailParameter +email +
                gmailParameter + gmail +
                googleImageUrlParameter +googleImageUrl +
                googleDisplayNameParameter +googleDisplayName +
                googleGivenNameParameter +googleGivenName +
                googleFamilyNameParameter + googleFamilyName +
                inviteeParameter + invitee;
			return $http.get(url).then(function(response){
                person=response.data;
               
                return person;
            });
		}
		
	}
})
    




.factory('groupService', function($http,ApiEndPoint) {
    var groups;
    var serviceName = "getGroups";
    var parameter = "?personId=";
    var parameter2 = "&getBalances=";
    
    return {
        
		getGroups: function(personId){
            var url = ApiEndPoint.url + serviceName + parameter + personId + parameter2 + 'Y';
			return $http.get(url).then(function(response){
                groups=response.data;
                
                return groups;
            });
		},
        
        getGroup: function(groupId){
            
            for(var i=0;i<groups.length;i++)
            {
                if(groups[i].groupId==groupId)
                    {
                        return groups[i];
                    }
            }
        return null;
            
            
		}
	}
})

.factory('transactionService', function($http,ApiEndPoint) {
    
    var transactions;
    var serviceName = "transactions";
    var parameter = "?personId=";
    var parameter2 = "&groupId=";
    var parameter3 = "&showMine=";
    var parameter4=  "&count=";
 
    
    
    return {
        
		getTransactionsLite: function(personId,groupId,showMine,count){
            var url = ApiEndPoint.url + serviceName + parameter + personId + parameter2 + groupId + parameter3 + showMine + parameter4 + count;
			return $http.get(url).then(function(response){
                transactions=response.data;
               
                return transactions;
            });
		},
		getTransactions: function(personId,groupId,showMine){
            var url = ApiEndPoint.url + serviceName + parameter + personId + parameter2 + groupId + parameter3 + showMine;
			return $http.get(url).then(function(response){
                transactions=response.data;
               
                return transactions;
            });
		}
		
        
	}
})

.factory('transactionDetailService', function($http,ApiEndPoint) {
    
    var transactionDetails;
    var serviceName = "transactionDetails";
    var parameter = "?tranId=";
    var parameter2 = "&personId=";
    var parameter3 = "&groupId=";
    
 
    
    
    return {
        
		getTransactionDetails: function(tranId,personId,groupId){
            var url = ApiEndPoint.url + serviceName + parameter + tranId + parameter2 + personId + parameter3 + groupId;
			return $http.get(url).then(function(response){
                transactionDetails=response.data;
               
                return transactionDetails;
            });
		}
        
	}
})

.factory('settleUpService', function($http,ApiEndPoint) {
    
    var settleUps;
    var serviceName = "settleUp";
    var parameter = "?personId=";
    var parameter2 = "&groupId=";
    
 
    
    
    return {
        
		getSettleUps: function(personId,groupId){
            var url = ApiEndPoint.url + serviceName + parameter + personId + parameter2 + groupId;
			return $http.get(url).then(function(response){
                settleUps=response.data;
               
                return settleUps;
            });
		}
        
	}
})