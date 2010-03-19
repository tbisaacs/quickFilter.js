// Based on tableSearch.js by Steve Brewer - a.k.a The Big Dumb Developer.
// http://www.bigdumbdev.com/2007/08/table-searchfilter-using-single-input.html

// createDivFilter({params});

//search the contents of a div, only show divs containing matches.
var __currentDivFilterId = 0;
var createDivFilter = function (params) {
    var that = function (id) {
        var divFilter = {};
        window['divFilter' + id] = divFilter;
        divFilter.init = function (params) {
            params = params || {};
            this.searchInputId = params.searchInputId || "filter";				//input to observe
            this.interval = params.interval || 100;								//how often to check searchInputId
            this.scopeId = params.scopeId || "filterDiv"; 						//#container to look in
            this.elementClass = params.elementClass; 							//what gets shown/hidden - handy if you search nested divs.
			this.noResultsId = params.noResultsId || "no_results"; 				//element that get's shown when there are no results.
			this.searchableClass = params.searchableClass; 						//by default all text get search - you can specify the searchable items by class name.
			this.elementType = params.elementType || "div"; 					//what type of element are you searching
			this.callBack = "";													//fire a callback function
			
            this.currentSearch = ""; 
            params.callCount = params.callCount || 1;
            params.callCount++;
           
            this.divParent = document.getElementById(this.scopeId);			
			$('#' + this.noResultsId).hide();

            // if we didn't find the div, check again in 1 second (maybe it's being render, etc)
            if (!this.divParent) {
                if (params.callCount > 15){
                    return;  // give up, can't find the div in 15 seconds.
				}
                setTimeout(function () {
                    divFilter.init(params);
                }, 1000);
			}
    		
			this.searchInput = document.getElementById(this.searchInputId);
			
			this.searchInput.className += ' quickFiltered';

			if(!this.searchInput){
               return; // error
			}

            //Only need to run the filter while the input is focused.
	        this.searchInput.onfocus = function () {
				divFilter.intervalHandle = setInterval(function () { divFilter.search(); }, divFilter.interval);
			}
	
            this.searchInput.onblur = function () {
                clearTimeout(divFilter.intervalHandle);
            }

            if (this.searchInput.value.length > 0){
                this.search();
   			}
        };

        divFilter.search = function () {	
        
        	var searchString = this.searchInput.value.toLowerCase();

            if (searchString == this.currentSearch){
                return;
			}
    
        	this.currentSearch = searchString;

            var searchTokens = searchString.split(" ");

			var divs = this.divParent.getElementsByTagName(this.elementType);
			var divCount = 0;
			
			for (var i = 0; i < divs.length; i++) {
                var div = divs[i];
				if (this.elementClass && div.className.indexOf(this.elementClass) < 0) {
                    continue;
                }

                var filter = false;
                if (searchString.length > 0) {
                    for (var k = 0; k < searchTokens.length; k++) {
                        if (searchTokens[k].replace(/^\s+|\s+$/g, "").length === 0){
                            continue;
						}
						var haveMatch = false;
						
						var dictionary = ''; 
						if(this.searchableClass){
							var $items = $(div).find('.' + this.searchableClass);
							$items.each(function(index) {
								dictionary += " " + $(this).text();
							});							
						} else {
							// if no searchable class is specified, search all of the text in div
							dictionary = $(div).text();
						}
											
						if (dictionary.toLowerCase().indexOf(searchTokens[k]) >= 0) {
                            haveMatch = true;
                        }

                        if (!haveMatch) {
                            filter = true;
                            break;
                        }
                    }
                }

                if (filter) {
                    $(div).addClass('filtered').hide();
                } else {
                    $(div).removeClass('filtered').show();
                }
            }
			
			
			//check to see if no results div is needed
			if(($("#" + this.scopeId).find('.' + this.elementClass).length) == ($("#" + this.scopeId).find('.filtered').length)){
				$('#' + this.noResultsId).show();
			} else {
				$('#' + this.noResultsId).hide();
			}
			
			//run the callback
			if(params.callBack){
				setTimeout(params.callBack, this.interval); // give the call back function time to execute, otherwise they slam into each other.				
			}
        };

        return divFilter;
    } (__currentDivFilterId++);
    that.init(params);
};