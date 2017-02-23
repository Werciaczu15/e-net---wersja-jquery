$(document).ready(function(){
	exsitsHistory();
	$("#movie-compare").click(function(event) {
		btnListener(event);
	});
	$(".clear_result").click(function(event) {
		clearResult();
	});
});

function btnListener(event){
	event.preventDefault();
	var title1 = $('#title1').val();
	var title2 = $('#title2').val();
	movie1 = title1.trim();
	movie2 = title2.trim();
	var apiMovie1;
	var apiMovie2;
	$('.result-director').empty();
	$('.result-actor').empty();
	$('.no-result').hide();
	var res = true;
	

	var validateMovie1 = movieValidate(movie1, 1);
	var validateMovie2 = movieValidate(movie2, 2);
	if(validateMovie1 == true && validateMovie2 == true){
		var storedItem = getFromHistory(movie1, movie2);
		if(storedItem){
			apiMovie1 = storedItem.apiMovie1;
			apiMovie2 = storedItem.apiMovie2;
		}
		else{
			apiMovie1 = apiConnect(movie1);
			apiMovie2 = apiConnect(movie2);
			res = apiMovie1.result == 'True' && apiMovie2.result == 'True';
			if(res){
				updateHistory(movie1, movie2, apiMovie1, apiMovie2 );
			}
		}
		
		if(res){
			compareResult(apiMovie1, apiMovie2, movie1, movie2, false);
			
		}else{
			$('.no-result').text('Coś poszło źle. Być może nie mamy tego filmu w bazie danych.');
			$('.no-result').show('slow');
		}
	}
}

function movieValidate(movie, nr){
	var result = false;
	var nameReg = /^[-_ . ! a-zA-Z0-9]+$/;
	
	if(!movie){
		$('#error-title'+nr).show();
		$('#error-title'+nr).text('Pole nie może być puste');
		result = false;
	}else if(movie && !nameReg.test(movie)){
		$('#error-title'+nr).show();
		$('#error-title'+nr).text('Czy dobrze wpisałeś tytuł?');
		result = false;
	}
	else{
		$('#error-title'+nr).hide();
		result = true;
	}
	
	return result;
}

function apiConnect(movie){
	var name = movie.replace(/\s+/g, '+');

	var result;
	
	var url = 'http://www.omdbapi.com/?t='+name+'&y=&plot=short&r=json';
	
	$.ajax({
		global: false,
		async:false,
		type: 'GET',
		dataType: "json",
		url: url,
		beforeSend: function() {
			$('#movie-compare').attr("disabled", true);
			$('.loading-result').show();
		},
		success: function (data) {
			if(data.Response  == "True"){
				director_tmp = data.Director;
				director = director_tmp.split(', ');
				actors_tmp = data.Actors;
				actors = actors_tmp.split(', ');
				result = {director: director, actors: actors, result: data.Response};
			}else{
				result = {result: data.Response, error: "data.Error"};
			}
		},
		error: function (request, status, error) {
			console.log(request.responseText);
			result = {result: data.Response, error: data.Error};
		},
		complete: function() {
			$('.loading-result').hide();
			setTimeout(function(){
				$('#movie-compare').attr("disabled", false);
			},500);
		}
	});
	
	return result;
	
}

function compareResult(apiMovie1, apiMovie2, movie1, movie2, notclick){
	var result_director = false;
	var result_actor = false;
	
	var resultDirector = [];
	$.map(apiMovie1.director, function (val, i) {
		if ($.inArray(val, apiMovie2.director) > -1) {
			resultDirector.push(val);
		}
	});
	
	var resultActor = [];
	$.map(apiMovie1.actors, function (val, i) {
		if ($.inArray(val, apiMovie2.actors) > -1) {
			resultActor.push(val);
		}
	});
	if(notclick == false){
		if(resultDirector.length >0){
			setTimeout(function(){
				$('.result-director').text('Reżyser: ' + resultDirector);
				$('.result-director').slideDown();
			}, 500);
			result_director = true;
		}

		if(resultActor.length >0){
			setTimeout(function(){
				$('.result-actor').text('Aktorzy: ' + resultActor);
				$('.result-actor').slideDown();
			}, 500);
			result_actor = true;
		}
		if(result_director == false && result_actor == false){
			$('.result-director').hide();
			$('.result-actor').hide();
			setTimeout(function(){
				$('.no-result').slideDown();
			}, 500);
		}else{
			$('.no-result').hide();
		}
		
		$('.clear_result').show();

	}
	setLocalStorage(resultDirector, resultActor, movie1, movie2);
}

function setLocalStorage(resultDirector, resultActor, movie1, movie2){
	localStorage.setItem("director", resultDirector);
	localStorage.setItem("actor", resultActor);
	localStorage.setItem("movie1", movie1);
	localStorage.setItem("movie2", movie2);
	
	var tmp_id = localStorage.getItem('lastID');
	var director = localStorage.getItem('director');
	var actor = localStorage.getItem('actor');
	var movie1 = localStorage.getItem('movie1');
	var movie2 = localStorage.getItem('movie2');
	
	showResult();
	

}

function getHistory(){
	var item = localStorage.getItem('history');
	if(item == null) { return {}; }
	return JSON.parse(item);
}

function createHistoryId(movie1, movie2){
	return  movie1.toLowerCase() + '_' + movie2.toLowerCase();
}

function updateHistory(movie1, movie2, apiMovie1, apiMovie2 ){
	var history = getHistory();
	var searchId = createHistoryId(movie1, movie2);
	history[searchId] = {apiMovie1: apiMovie1, apiMovie2: apiMovie2, movie1: movie1, movie2: movie2};
	var item = JSON.stringify(history);
	return localStorage.setItem('history', item);
}

function getFromHistory(movie1, movie2){	
	var history = getHistory();
	var searchId = createHistoryId(movie1, movie2);
	return history[searchId];
}


function showResult(){
	var director = localStorage.getItem('director');
	var actor = localStorage.getItem('actor');
	var movie1 = localStorage.getItem('movie1');
	var movie2 = localStorage.getItem('movie2');
	
	var resultDirector = false;
	var resultActor = false;
	
	row = $("<tr></tr>");
	col = $("<th colspan='2'>"+movie1 +" oraz "+ movie2+"</th>");
	row.append(col).appendTo("#history-table");
	
	if(director){
		row = $("<tr></tr>");
		col1 = $("<td>Reżyser:</td>");
		col2 = $("<td>"+director+"</td>");
		row.append(col1,col2).appendTo("#history-table");
		resultDirector = true;
	}
		
	if(actor){
		row = $("<tr></tr>");
		col1 = $("<td>Obsada:</td>");
		col2 = $("<td>"+actor+"</td>");
		row.append(col1,col2).appendTo("#history-table");
		resultActor = true;
	}
	
	if(resultDirector == false && resultActor == false){
		row = $("<tr></tr>");
		col = $("<td colspan='2'>----</td>");
		row.append(col).appendTo("#history-table");
	}
}

function exsitsHistory(){
	var title1 = $('#title1').val();
	var title2 = $('#title2').val();
	movie1 = title1.trim();
	movie2 = title2.trim();
	
	var history = getHistory();
	if(history){
		for (var id in history) {      
			if (history.hasOwnProperty(id)){
				compareResult(history[id].apiMovie1,  history[id].apiMovie2, history[id].movie1, history[id].movie2, 150);
			}
		}
	}
	
	if($.isEmptyObject(history)){
		$('.clear_result').hide();
	}else{
		$('.clear_result').show();
	}
	
}

function clearResult(){
	localStorage.clear();
	location.reload();
}

