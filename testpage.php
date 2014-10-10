<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Recipe Analysis</title>
  <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css">
  <script src="//code.jquery.com/jquery-1.10.2.js"></script>
  <script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
  <script>
  </script>
  <style>
    .ui-autocomplete-loading {
      background: white url("images/ui-anim_basic_16x16.gif") right center no-repeat;
    }
    textarea { width:500px; height: 250px;}
    .red {
      background-color: red;
      cursor: pointer;
    }
    table, th, td {
      border: 1px solid black;
    }
  </style>
</head>
<body>
 <div id="recipeTextarea">
  <form action="/" id="recipeForm">
    <textarea id="rec"></textarea>
    <input type="submit" value="Submit">
  </form>
</div>
<div id="result" style="display:none;">
  <table id="ingredientsTable"></table>
  <button onclick="openTextarea();">Edit ingredients</button>
</div>

<script>
// Attach a submit handler to the form
$( "#recipeForm" ).submit(function( event ) {

  var host = location.host;
 
  // Stop form from submitting normally
  event.preventDefault();
 
  // Get some values from elements on the page:
  var $form = $( this ),
    term = $("#rec").val();
    //url = 'http://104.131.17.237:8080/api/recipecheck';
    url = 'http://'+host+':8080/api/recipecheck';
 
  $.ajax({

    url : url,

    type: 'POST',

    dataType : "json",

    data: {ingredients: term},

    success:function(data) {
      var table = '<tr><th>Amount</th><th>Measure</th><th>Ingredient</th><th>Delete</th></tr>';
      $("#recipeTextarea").hide();
      $("#result").show();
          $.each( data.ingredients, function( i, val ) {
            table += '<tr id="'+i+'">';
            table += '<td ' + (val.amount == null ? 'class="red"' : "") + ' id="'+i+'_amount">'+val.amount+'</td> ';
            table += '<td ' + (val.measure == null ? 'class="red"' : "") + ' id="'+i+'_measure">'+val.measure+'</td> ';
            table += '<td ' + (val.ingredient == null ? 'class="red ingr" onClick="popup(this);" ' : 'title="'+val.ingredient+'"') + ' id="'+i+'_ingredient">'+val.keyword.replace(val.amount + ' ' + val.measure, '').trim()+'</td> ';
            table += '<td class="red" onClick="removeRow('+i+');"> X</td>';
            table += '</tr>';
            console.log(val);
      });
      $("#ingredientsTable").html(table);
          console.log(data);
    },


    error: function (xhr, ajaxOptions, thrownError) {
      console.log(xhr.responseText);
      console.log(thrownError);
    }

  }

);
});

  function ingredientsSearch() {
    var id = $("#dialog input[name='id']").val();
    var ingredient = $("#dialog input[name='ingredient']").val();

    var host = location.host;

    var url = 'http://'+host+':8080/api/ingredientsearch/';

    $.get(url + ingredient,function(data,status){
      if (status == 'success') {
        var results = '';
        $.each( data.result, function( i, val ) {
          results += '<div style="cursor: pointer;" onClick="replace(\''+id+'\', \''+val.Long_Desc+'\');">'+val.Long_Desc+'</div>';
        })
        $("#dialog #searchResult").html(results);
      }
    });
  }

  function replace(id, newVal) {//TODO umesto ovoga ponovo api kalkulacija
    $("#"+id).text(newVal);
  }

  function removeRow(id) {
    $("#"+id).remove();
  }

  function popup(element) {
    $("#dialog #searchResult").empty();
    $( "#dialog input[name='id']" ).val(element.id);
    $( "#dialog input[name='ingredient']" ).val(element.innerHTML);
    $( "#dialog" ).dialog();
  }

  function openTextarea() {
    $("#recipeTextarea").show();
    $("#result").hide();
  }
</script>
 <div id="dialog" title="Basic dialog" style="display: none">
   <input type="text" name="ingredient">
   <input type="hidden" name="id">
   <button onClick="ingredientsSearch();" name="ingredientSearch">Search</button>
   <div id="searchResult"></div>
 </div>
 
</body>
</html>